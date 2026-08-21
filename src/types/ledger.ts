import type { TransactionStatus, TransactionType } from "./enums";
import type { DecimalString } from "./api";

export type LedgerDirection =
  | "credit_available"
  | "debit_available"
  | "credit_invested"
  | "debit_invested"
  | "move_available_to_invested"
  | "move_invested_to_available";

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
  | "CIRCUIT_OPEN"
  | "UNKNOWN";

export type LockedAccountSnapshot = {
  id: string;
  userId: string;
  availableBalance: DecimalString;
  investedBalance: DecimalString;
  currency: string;
};

export type LedgerEntryParams = {
  userId: string;
  type: TransactionType;
  amount: DecimalString | number;
  direction: LedgerDirection;
  description?: string;
  referencePrefix?: string;
  depositId?: string | null;
  withdrawalId?: string | null;
  investmentId?: string | null;
  metadata?: Record<string, unknown>;
  status?: TransactionStatus;
};

export type LedgerEntryOutcome = {
  accountId: string;
  transactionId: string;
  reference: string;
  balanceBefore: DecimalString;
  balanceAfter: DecimalString;
  availableBalance: DecimalString;
  investedBalance: DecimalString;
};

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export type CircuitStats = {
  name: string;
  state: CircuitState;
  failures: number;
  successes: number;
  openedAt: number | null;
  halfOpenInFlight: number;
};

export type BackoffJitter = "full" | "equal" | "none";

export type BackoffConfig = {
  baseMs?: number;
  maxMs?: number;
  maxRetries?: number;
  jitter?: BackoffJitter;
  factor?: number;
};
