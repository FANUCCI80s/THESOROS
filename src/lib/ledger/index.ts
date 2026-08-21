import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";
import type { PrismaClient, TransactionType, TransactionStatus } from "@prisma/client";
import {
  withExponentialBackoff,
  LEDGER_BACKOFF,
} from "@/lib/retry/exponential-backoff";
import {
  getCircuitBreaker,
  isCircuitOpenError,
  CircuitOpenError,
} from "@/lib/resilience/circuit-breaker";

export type TxClient = Prisma.TransactionClient;

/** Recommended options for any balance-mutating transaction */
export const LEDGER_TX_OPTIONS = {
  /** Prevent dirty/non-repeatable reads during concurrent credits */
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  maxWait: 10_000,
  timeout: 15_000,
} as const;

export type LockedAccount = {
  id: string;
  userId: string;
  availableBalance: Prisma.Decimal;
  investedBalance: Prisma.Decimal;
  currency: string;
};

/**
 * Unique ledger reference: PREFIX-YYYYMMDD-HEX
 */
export function makeReference(prefix: string): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${date}-${suffix}`;
}

function toDecimal(value: Prisma.Decimal | string | number): Prisma.Decimal {
  return new Prisma.Decimal(value.toString());
}

/**
 * Pessimistic lock on Account row (SELECT … FOR UPDATE).
 * Blocks concurrent ledger writers for the same user until this transaction commits.
 *
 * Must be called inside an interactive $transaction.
 */
export async function lockAccount(
  tx: TxClient,
  userId: string
): Promise<LockedAccount> {
  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      userId: string;
      availableBalance: Prisma.Decimal | string;
      investedBalance: Prisma.Decimal | string;
      currency: string;
    }>
  >`
    SELECT
      id,
      "userId",
      "availableBalance",
      "investedBalance",
      currency
    FROM "Account"
    WHERE "userId" = ${userId}
    FOR UPDATE
  `;

  if (!rows.length) {
    throw new LedgerError("ACCOUNT_NOT_FOUND", "User account not found");
  }

  const row = rows[0];
  return {
    id: row.id,
    userId: row.userId,
    availableBalance: toDecimal(row.availableBalance),
    investedBalance: toDecimal(row.investedBalance),
    currency: row.currency,
  };
}

/**
 * Pessimistic lock on Deposit row — prevents double-approve races.
 */
export async function lockDeposit(tx: TxClient, depositId: string) {
  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      userId: string;
      status: string;
      method: string;
      amount: Prisma.Decimal | string;
      proofUrl: string | null;
    }>
  >`
    SELECT
      id,
      "userId",
      status,
      method,
      amount,
      "proofUrl"
    FROM "Deposit"
    WHERE id = ${depositId}
    FOR UPDATE
  `;

  if (!rows.length) {
    throw new LedgerError("DEPOSIT_NOT_FOUND", "Deposit not found");
  }

  const row = rows[0];
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    method: row.method,
    amount: toDecimal(row.amount),
    proofUrl: row.proofUrl,
  };
}

export type LedgerEntryInput = {
  userId: string;
  type: TransactionType;
  amount: Prisma.Decimal | string | number;
  /** Positive amount is applied according to direction */
  direction: "credit_available" | "debit_available" | "credit_invested" | "debit_invested" | "move_available_to_invested" | "move_invested_to_available";
  description?: string;
  referencePrefix?: string;
  depositId?: string | null;
  withdrawalId?: string | null;
  investmentId?: string | null;
  metadata?: Prisma.InputJsonValue;
  status?: TransactionStatus;
};

export type LedgerEntryResult = {
  accountId: string;
  transactionId: string;
  reference: string;
  balanceBefore: Prisma.Decimal;
  balanceAfter: Prisma.Decimal;
  availableBalance: Prisma.Decimal;
  investedBalance: Prisma.Decimal;
};

/**
 * Apply a single ledger entry under an already-locked account.
 * Caller must have called lockAccount() in the same transaction first.
 */
export async function applyLedgerEntry(
  tx: TxClient,
  locked: LockedAccount,
  input: LedgerEntryInput
): Promise<LedgerEntryResult> {
  if (locked.userId !== input.userId) {
    throw new LedgerError("ACCOUNT_MISMATCH", "Locked account does not match userId");
  }

  const amount = toDecimal(input.amount);
  if (amount.lte(0)) {
    throw new LedgerError("INVALID_AMOUNT", "Amount must be greater than zero");
  }

  let available = locked.availableBalance;
  let invested = locked.investedBalance;
  /** balanceBefore/After track available unless invested-only movement */
  let balanceBefore = available;
  let balanceAfter = available;

  switch (input.direction) {
    case "credit_available": {
      balanceBefore = available;
      available = available.add(amount);
      balanceAfter = available;
      break;
    }
    case "debit_available": {
      balanceBefore = available;
      if (available.lt(amount)) {
        throw new LedgerError("INSUFFICIENT_FUNDS", "Insufficient available balance");
      }
      available = available.sub(amount);
      balanceAfter = available;
      break;
    }
    case "credit_invested": {
      balanceBefore = invested;
      invested = invested.add(amount);
      balanceAfter = invested;
      break;
    }
    case "debit_invested": {
      balanceBefore = invested;
      if (invested.lt(amount)) {
        throw new LedgerError("INSUFFICIENT_INVESTED", "Insufficient invested balance");
      }
      invested = invested.sub(amount);
      balanceAfter = invested;
      break;
    }
    case "move_available_to_invested": {
      balanceBefore = available;
      if (available.lt(amount)) {
        throw new LedgerError("INSUFFICIENT_FUNDS", "Insufficient available balance");
      }
      available = available.sub(amount);
      invested = invested.add(amount);
      balanceAfter = available;
      break;
    }
    case "move_invested_to_available": {
      balanceBefore = invested;
      if (invested.lt(amount)) {
        throw new LedgerError("INSUFFICIENT_INVESTED", "Insufficient invested balance");
      }
      invested = invested.sub(amount);
      available = available.add(amount);
      balanceAfter = available;
      break;
    }
    default:
      throw new LedgerError("INVALID_DIRECTION", "Unknown ledger direction");
  }

  await tx.account.update({
    where: { id: locked.id },
    data: {
      availableBalance: available,
      investedBalance: invested,
    },
  });

  // Refresh locked snapshot for subsequent entries in the same tx
  locked.availableBalance = available;
  locked.investedBalance = invested;

  const prefix = input.referencePrefix ?? refPrefixForType(input.type);
  const reference = makeReference(prefix);

  const transaction = await tx.transaction.create({
    data: {
      userId: input.userId,
      type: input.type,
      status: input.status ?? "COMPLETED",
      amount,
      balanceBefore,
      balanceAfter,
      reference,
      description: input.description ?? null,
      depositId: input.depositId ?? null,
      withdrawalId: input.withdrawalId ?? null,
      investmentId: input.investmentId ?? null,
      metadata: input.metadata ?? undefined,
    },
  });

  return {
    accountId: locked.id,
    transactionId: transaction.id,
    reference,
    balanceBefore,
    balanceAfter,
    availableBalance: available,
    investedBalance: invested,
  };
}

function refPrefixForType(type: TransactionType): string {
  switch (type) {
    case "DEPOSIT":
      return "DEP";
    case "WITHDRAWAL":
      return "WDR";
    case "INVESTMENT_PURCHASE":
      return "INV";
    case "INVESTMENT_RETURN":
      return "RET";
    case "INVESTMENT_MATURITY":
      return "MAT";
    case "BALANCE_ADJUSTMENT":
      return "ADJ";
    case "FEE":
      return "FEE";
    case "REFUND":
      return "RFD";
    default:
      return "TXN";
  }
}

/**
 * Convenience: lock account + apply one entry in the current transaction.
 */
export async function lockedLedgerEntry(
  tx: TxClient,
  input: LedgerEntryInput
): Promise<LedgerEntryResult> {
  const locked = await lockAccount(tx, input.userId);
  return applyLedgerEntry(tx, locked, input);
}

/* -------------------------------------------------------------------------- */
/*  Errors & lock-timeout handling                                              */
/* -------------------------------------------------------------------------- */

export type LedgerErrorCode =
  | "ACCOUNT_NOT_FOUND"
  | "DEPOSIT_NOT_FOUND"
  | "ACCOUNT_MISMATCH"
  | "INVALID_AMOUNT"
  | "INSUFFICIENT_FUNDS"
  | "INSUFFICIENT_INVESTED"
  | "INVALID_DIRECTION"
  | "DEPOSIT_USER_MISMATCH"
  | "DEPOSIT_NOT_PENDING"
  | "LOCK_TIMEOUT"
  | "LOCK_NOT_AVAILABLE"
  | "DEADLOCK"
  | "SERIALIZATION_FAILURE"
  | "TX_TIMEOUT"
  | "TX_CONFLICT"
  | "UNKNOWN";

export class LedgerError extends Error {
  code: LedgerErrorCode;
  /** Suggested HTTP status for API responses */
  httpStatus: number;
  /** Client may safely retry the same operation */
  retryable: boolean;
  /** Original driver / Prisma error, if any */
  cause?: unknown;

  constructor(
    code: LedgerErrorCode,
    message: string,
    options?: { httpStatus?: number; retryable?: boolean; cause?: unknown }
  ) {
    super(message);
    this.name = "LedgerError";
    this.code = code;
    this.httpStatus = options?.httpStatus ?? defaultStatus(code);
    this.retryable = options?.retryable ?? isRetryableCode(code);
    this.cause = options?.cause;
  }
}

function defaultStatus(code: LedgerErrorCode): number {
  switch (code) {
    case "LOCK_TIMEOUT":
    case "LOCK_NOT_AVAILABLE":
    case "DEADLOCK":
    case "SERIALIZATION_FAILURE":
    case "TX_TIMEOUT":
    case "TX_CONFLICT":
      return 409;
    case "INSUFFICIENT_FUNDS":
    case "INSUFFICIENT_INVESTED":
    case "INVALID_AMOUNT":
    case "INVALID_DIRECTION":
    case "DEPOSIT_NOT_PENDING":
      return 400;
    case "ACCOUNT_NOT_FOUND":
    case "DEPOSIT_NOT_FOUND":
      return 404;
    default:
      return 500;
  }
}

function isRetryableCode(code: LedgerErrorCode): boolean {
  return (
    code === "LOCK_TIMEOUT" ||
    code === "LOCK_NOT_AVAILABLE" ||
    code === "DEADLOCK" ||
    code === "SERIALIZATION_FAILURE" ||
    code === "TX_TIMEOUT" ||
    code === "TX_CONFLICT"
  );
}

export function isLedgerError(err: unknown): err is LedgerError {
  return err instanceof LedgerError;
}

/**
 * Map Prisma / PostgreSQL concurrency errors to LedgerError.
 */
export function mapLedgerDriverError(err: unknown): LedgerError {
  if (isLedgerError(err)) return err;

  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  // Prisma known codes
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : "";

  // P2028 — interactive transaction timed out / closed
  if (code === "P2028" || lower.includes("transaction already closed") || lower.includes("transaction api error")) {
    return new LedgerError(
      "TX_TIMEOUT",
      "The operation timed out while waiting for the database transaction. Please retry.",
      { cause: err }
    );
  }

  // P2034 — write conflict or deadlock
  if (code === "P2034") {
    return new LedgerError(
      "TX_CONFLICT",
      "A concurrent balance update conflicted with this operation. Please retry.",
      { cause: err }
    );
  }

  // P2024 — connection pool timeout
  if (code === "P2024" || lower.includes("timed out fetching a new connection")) {
    return new LedgerError(
      "LOCK_TIMEOUT",
      "Database is busy. Could not obtain a connection in time. Please retry shortly.",
      { cause: err }
    );
  }

  // PostgreSQL: lock_not_available (55P03)
  if (
    code === "55P03" ||
    lower.includes("lock_not_available") ||
    lower.includes("could not obtain lock")
  ) {
    return new LedgerError(
      "LOCK_NOT_AVAILABLE",
      "Could not obtain a lock on the account. Another operation is in progress. Please retry.",
      { cause: err }
    );
  }

  // PostgreSQL: deadlock_detected (40P01)
  if (code === "40P01" || lower.includes("deadlock detected")) {
    return new LedgerError(
      "DEADLOCK",
      "A database deadlock occurred. Please retry the operation.",
      { cause: err }
    );
  }

  // PostgreSQL: serialization_failure (40001)
  if (
    code === "40001" ||
    lower.includes("serialization failure") ||
    lower.includes("could not serialize")
  ) {
    return new LedgerError(
      "SERIALIZATION_FAILURE",
      "Concurrent update conflict. Please retry the operation.",
      { cause: err }
    );
  }

  // Prisma / engine timeout wording
  if (
    lower.includes("timeout") ||
    lower.includes("timed out") ||
    lower.includes("canceling statement due to lock timeout")
  ) {
    return new LedgerError(
      "LOCK_TIMEOUT",
      "Timed out waiting for a database lock. Please retry.",
      { cause: err }
    );
  }

  // maxWait exceeded when starting interactive transaction
  if (lower.includes("unable to start a transaction") || lower.includes("maxwait")) {
    return new LedgerError(
      "TX_TIMEOUT",
      "Could not start a ledger transaction in time. Please retry.",
      { cause: err }
    );
  }

  return new LedgerError(
    "UNKNOWN",
    message || "Ledger operation failed",
    { httpStatus: 500, retryable: false, cause: err }
  );
}

export type WithLedgerOptions = {
  /**
   * Extra attempts after the first (default from LEDGER_BACKOFF = 3 → 4 tries total).
   * @deprecated prefer backoff.maxRetries
   */
  retries?: number;
  /**
   * Base delay ms (default 50).
   * @deprecated prefer backoff.baseMs
   */
  retryDelayMs?: number;
  /** Full exponential-backoff config (overrides retries / retryDelayMs) */
  backoff?: {
    baseMs?: number;
    maxMs?: number;
    maxRetries?: number;
    jitter?: "full" | "equal" | "none";
    factor?: number;
  };
};

/** Shared breaker for all ledger balance mutations */
export const ledgerCircuit = getCircuitBreaker("ledger", {
  failureThreshold: 5,
  successThreshold: 2,
  cooldownMs: 30_000,
  halfOpenMaxCalls: 1,
  // Only trip on systemic failures, not business rule errors
  isFailure: (err) => {
    if (isLedgerError(err)) {
      return (
        err.retryable ||
        err.code === "UNKNOWN" ||
        err.code === "TX_TIMEOUT" ||
        err.code === "LOCK_TIMEOUT"
      );
    }
    return true;
  },
});

/**
 * Run a callback inside a Serializable interactive transaction.
 *
 * Layers:
 * 1. Circuit breaker — fail fast if ledger dependency is unhealthy
 * 2. Exponential backoff + full jitter — retry transient lock conflicts
 * 3. Serializable $transaction + FOR UPDATE row locks
 */
export async function withLedgerTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: TxClient) => Promise<T>,
  options?: WithLedgerOptions
): Promise<T> {
  const backoff = {
    ...LEDGER_BACKOFF,
    ...options?.backoff,
    ...(options?.retries !== undefined
      ? { maxRetries: options.retries }
      : {}),
    ...(options?.retryDelayMs !== undefined
      ? { baseMs: options.retryDelayMs }
      : {}),
  };

  try {
    return await ledgerCircuit.exec(() =>
      withExponentialBackoff(
        async () => {
          try {
            return await prisma.$transaction(fn, LEDGER_TX_OPTIONS);
          } catch (err) {
            throw mapLedgerDriverError(err);
          }
        },
        {
          ...backoff,
          shouldRetry: (err) => isLedgerError(err) && err.retryable,
          onRetry: ({ attempt, maxRetries, delayMs, error }) => {
            const code = isLedgerError(error) ? error.code : "UNKNOWN";
            console.warn(
              `[ledger] ${code} — retry ${attempt}/${maxRetries} after ${delayMs}ms backoff`
            );
          },
        }
      )
    );
  } catch (err) {
    if (isCircuitOpenError(err)) {
      throw new LedgerError(
        "TX_TIMEOUT",
        err.message,
        {
          httpStatus: 503,
          retryable: true,
          cause: err,
        }
      );
    }
    throw err;
  }
}

export { isCircuitOpenError, CircuitOpenError };

/**
 * Convert any ledger failure into a consistent API JSON response shape.
 * Use in route catch blocks:
 *   return ledgerErrorResponse(err);
 */
export function ledgerErrorToHttp(err: unknown): {
  status: number;
  body: {
    success: false;
    error: string;
    code: string;
    retryable: boolean;
    retryAfterMs?: number;
  };
} {
  if (isCircuitOpenError(err)) {
    return {
      status: 503,
      body: {
        success: false,
        error: err.message,
        code: "CIRCUIT_OPEN",
        retryable: true,
        retryAfterMs: err.retryAfterMs,
      },
    };
  }

  const mapped = mapLedgerDriverError(err);

  // Circuit mapped to LedgerError TX_TIMEOUT with 503
  if (
    mapped.httpStatus === 503 ||
    (mapped.cause && isCircuitOpenError(mapped.cause))
  ) {
    const retryAfterMs = isCircuitOpenError(mapped.cause)
      ? mapped.cause.retryAfterMs
      : 30_000;
    return {
      status: 503,
      body: {
        success: false,
        error: mapped.message,
        code: "CIRCUIT_OPEN",
        retryable: true,
        retryAfterMs,
      },
    };
  }

  return {
    status: mapped.httpStatus,
    body: {
      success: false,
      error: mapped.message,
      code: mapped.code,
      retryable: mapped.retryable,
    },
  };
}
