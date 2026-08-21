/**
 * Exponential backoff with full jitter (AWS-style).
 *
 * delay = random(0, min(cap, base * 2^attempt))
 *
 * Full jitter reduces synchronized retries ("thundering herd") better than
 * equal jitter or pure exponential growth alone.
 *
 * @see https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
 */

export type BackoffOptions = {
  /** First attempt is 0; delay applies before attempt 1, 2, … */
  baseMs?: number;
  /** Hard ceiling for any single delay (default 2000ms) */
  maxMs?: number;
  /** Extra attempts after the first (default 2 → 3 total tries) */
  maxRetries?: number;
  /**
   * Jitter mode:
   * - full:    random(0, exp)           — recommended default
   * - equal:   exp/2 + random(0, exp/2)
   * - none:    pure exponential (exp)
   */
  jitter?: "full" | "equal" | "none";
  /** Optional multiplier instead of 2 (default 2) */
  factor?: number;
  /** Called before each sleep (attempt is 1-based retry count) */
  onRetry?: (info: RetryInfo) => void;
  /** Abort retries early if this returns false */
  shouldRetry?: (err: unknown, attempt: number) => boolean;
};

export type RetryInfo = {
  attempt: number;
  maxRetries: number;
  delayMs: number;
  error: unknown;
};

export type ComputedDelay = {
  attempt: number;
  exponentialMs: number;
  delayMs: number;
};

const DEFAULTS = {
  baseMs: 50,
  maxMs: 2_000,
  maxRetries: 2,
  jitter: "full" as const,
  factor: 2,
};

/**
 * Compute delay for a given retry attempt (1 = first retry after failure).
 */
export function computeBackoffDelay(
  attempt: number,
  options: Pick<BackoffOptions, "baseMs" | "maxMs" | "factor" | "jitter"> = {}
): ComputedDelay {
  const baseMs = options.baseMs ?? DEFAULTS.baseMs;
  const maxMs = options.maxMs ?? DEFAULTS.maxMs;
  const factor = options.factor ?? DEFAULTS.factor;
  const jitter = options.jitter ?? DEFAULTS.jitter;

  const exponentialMs = Math.min(
    maxMs,
    baseMs * Math.pow(factor, Math.max(0, attempt - 1))
  );

  let delayMs: number;
  switch (jitter) {
    case "none":
      delayMs = exponentialMs;
      break;
    case "equal":
      delayMs = exponentialMs / 2 + Math.random() * (exponentialMs / 2);
      break;
    case "full":
    default:
      delayMs = Math.random() * exponentialMs;
      break;
  }

  return {
    attempt,
    exponentialMs,
    delayMs: Math.max(0, Math.floor(delayMs)),
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute `fn` with exponential backoff on failure.
 *
 * Total attempts = 1 + maxRetries.
 * Only errors for which shouldRetry (default: always) returns true are retried.
 */
export async function withExponentialBackoff<T>(
  fn: (attempt: number) => Promise<T>,
  options: BackoffOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? DEFAULTS.maxRetries;
  const shouldRetry = options.shouldRetry ?? (() => true);

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;

      if (attempt >= maxRetries || !shouldRetry(err, attempt)) {
        throw err;
      }

      const { delayMs } = computeBackoffDelay(attempt + 1, options);

      options.onRetry?.({
        attempt: attempt + 1,
        maxRetries,
        delayMs,
        error: err,
      });

      await sleep(delayMs);
    }
  }

  throw lastError;
}

/**
 * Preset tuned for ledger / row-lock contention.
 * Short base, modest cap — financial ops should resolve quickly or fail.
 */
export const LEDGER_BACKOFF: BackoffOptions = {
  baseMs: 50,
  maxMs: 1_500,
  maxRetries: 3,
  jitter: "full",
  factor: 2,
};
