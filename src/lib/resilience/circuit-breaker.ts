/**
 * Circuit breaker — fail fast when a dependency is unhealthy.
 *
 * States:
 *   CLOSED     → normal; failures increment counter
 *   OPEN       → reject immediately until cooldown elapses
 *   HALF_OPEN  → allow a limited number of trial calls
 *
 * Transitions:
 *   CLOSED  --(failures ≥ threshold)--> OPEN
 *   OPEN    --(cooldown elapsed)------> HALF_OPEN
 *   HALF_OPEN --(trial success)-------> CLOSED
 *   HALF_OPEN --(trial failure)-------> OPEN
 */

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export type CircuitBreakerOptions = {
  /** Name for logs / metrics */
  name?: string;
  /** Failures in CLOSED before opening (default 5) */
  failureThreshold?: number;
  /** Successes in HALF_OPEN before closing (default 2) */
  successThreshold?: number;
  /** How long to stay OPEN before probing (default 30_000 ms) */
  cooldownMs?: number;
  /** Max concurrent probes in HALF_OPEN (default 1) */
  halfOpenMaxCalls?: number;
  /** Optional: only count errors that match this predicate */
  isFailure?: (err: unknown) => boolean;
  /** Optional observer for state changes */
  onStateChange?: (from: CircuitState, to: CircuitState, name: string) => void;
};

export class CircuitOpenError extends Error {
  readonly circuit: string;
  readonly state: CircuitState;
  readonly retryAfterMs: number;

  constructor(circuit: string, retryAfterMs: number) {
    super(
      `Circuit "${circuit}" is open. Retry after ~${Math.ceil(retryAfterMs / 1000)}s.`
    );
    this.name = "CircuitOpenError";
    this.circuit = circuit;
    this.state = "OPEN";
    this.retryAfterMs = retryAfterMs;
  }
}

export function isCircuitOpenError(err: unknown): err is CircuitOpenError {
  return err instanceof CircuitOpenError;
}

type InternalState = {
  state: CircuitState;
  failures: number;
  successes: number;
  openedAt: number;
  halfOpenInFlight: number;
};

const DEFAULTS = {
  name: "default",
  failureThreshold: 5,
  successThreshold: 2,
  cooldownMs: 30_000,
  halfOpenMaxCalls: 1,
};

export class CircuitBreaker {
  readonly name: string;
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly cooldownMs: number;
  private readonly halfOpenMaxCalls: number;
  private readonly isFailure: (err: unknown) => boolean;
  private readonly onStateChange?: (
    from: CircuitState,
    to: CircuitState,
    name: string
  ) => void;

  private internal: InternalState = {
    state: "CLOSED",
    failures: 0,
    successes: 0,
    openedAt: 0,
    halfOpenInFlight: 0,
  };

  constructor(options: CircuitBreakerOptions = {}) {
    this.name = options.name ?? DEFAULTS.name;
    this.failureThreshold = options.failureThreshold ?? DEFAULTS.failureThreshold;
    this.successThreshold = options.successThreshold ?? DEFAULTS.successThreshold;
    this.cooldownMs = options.cooldownMs ?? DEFAULTS.cooldownMs;
    this.halfOpenMaxCalls = options.halfOpenMaxCalls ?? DEFAULTS.halfOpenMaxCalls;
    this.isFailure = options.isFailure ?? (() => true);
    this.onStateChange = options.onStateChange;
  }

  get state(): CircuitState {
    this.maybeTransitionToHalfOpen();
    return this.internal.state;
  }

  get stats() {
    return {
      name: this.name,
      state: this.state,
      failures: this.internal.failures,
      successes: this.internal.successes,
      openedAt: this.internal.openedAt || null,
      halfOpenInFlight: this.internal.halfOpenInFlight,
    };
  }

  /**
   * Execute `fn` under circuit protection.
   * Throws CircuitOpenError when the circuit is OPEN (or HALF_OPEN saturated).
   */
  async exec<T>(fn: () => Promise<T>): Promise<T> {
    this.beforeCall();

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      if (this.isFailure(err)) {
        this.onFailure();
      }
      throw err;
    }
  }

  /** Force open (e.g. ops kill switch) */
  trip(): void {
    this.transition("OPEN");
    this.internal.openedAt = Date.now();
    this.internal.failures = this.failureThreshold;
  }

  /** Force closed and reset counters */
  reset(): void {
    this.internal.failures = 0;
    this.internal.successes = 0;
    this.internal.halfOpenInFlight = 0;
    this.internal.openedAt = 0;
    this.transition("CLOSED");
  }

  private beforeCall(): void {
    this.maybeTransitionToHalfOpen();

    const { state, halfOpenInFlight } = this.internal;

    if (state === "OPEN") {
      const retryAfter = this.cooldownRemaining();
      throw new CircuitOpenError(this.name, retryAfter);
    }

    if (state === "HALF_OPEN") {
      if (halfOpenInFlight >= this.halfOpenMaxCalls) {
        throw new CircuitOpenError(this.name, this.cooldownRemaining());
      }
      this.internal.halfOpenInFlight += 1;
    }
  }

  private onSuccess(): void {
    if (this.internal.state === "HALF_OPEN") {
      this.internal.halfOpenInFlight = Math.max(
        0,
        this.internal.halfOpenInFlight - 1
      );
      this.internal.successes += 1;
      if (this.internal.successes >= this.successThreshold) {
        this.internal.failures = 0;
        this.internal.successes = 0;
        this.transition("CLOSED");
      }
      return;
    }

    // CLOSED — decay failure streak on success
    this.internal.failures = 0;
  }

  private onFailure(): void {
    if (this.internal.state === "HALF_OPEN") {
      this.internal.halfOpenInFlight = Math.max(
        0,
        this.internal.halfOpenInFlight - 1
      );
      this.internal.successes = 0;
      this.internal.openedAt = Date.now();
      this.transition("OPEN");
      return;
    }

    // CLOSED
    this.internal.failures += 1;
    if (this.internal.failures >= this.failureThreshold) {
      this.internal.openedAt = Date.now();
      this.transition("OPEN");
    }
  }

  private maybeTransitionToHalfOpen(): void {
    if (this.internal.state !== "OPEN") return;
    if (Date.now() - this.internal.openedAt < this.cooldownMs) return;

    this.internal.successes = 0;
    this.internal.halfOpenInFlight = 0;
    this.transition("HALF_OPEN");
  }

  private cooldownRemaining(): number {
    if (this.internal.state !== "OPEN" && this.internal.state !== "HALF_OPEN") {
      return 0;
    }
    const elapsed = Date.now() - this.internal.openedAt;
    return Math.max(0, this.cooldownMs - elapsed);
  }

  private transition(to: CircuitState): void {
    const from = this.internal.state;
    if (from === to) return;
    this.internal.state = to;
    this.onStateChange?.(from, to, this.name);
    console.warn(`[circuit:${this.name}] ${from} → ${to}`);
  }
}

/** Process-wide registry so the same dependency shares one breaker */
const registry = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  name: string,
  options?: Omit<CircuitBreakerOptions, "name">
): CircuitBreaker {
  let breaker = registry.get(name);
  if (!breaker) {
    breaker = new CircuitBreaker({ ...options, name });
    registry.set(name, breaker);
  }
  return breaker;
}

export function resetAllCircuitBreakers(): void {
  for (const b of registry.values()) {
    b.reset();
  }
}
