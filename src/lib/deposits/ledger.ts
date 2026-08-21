import type { Prisma } from "@prisma/client";
import {
  lockAccount,
  applyLedgerEntry,
  withLedgerTransaction,
  isLedgerError,
  LedgerError,
  ledgerErrorToHttp,
  mapLedgerDriverError,
  type TxClient,
  type LedgerEntryResult,
} from "@/lib/ledger";

export {
  lockAccount,
  withLedgerTransaction,
  isLedgerError,
  LedgerError,
  ledgerErrorToHttp,
  mapLedgerDriverError,
};

export { lockDeposit } from "@/lib/ledger";

/**
 * Credit available balance for an approved deposit.
 *
 * Prerequisites (caller must do these in the same transaction first):
 * - lockDeposit(tx, depositId)
 * - verify status === PENDING
 *
 * This function:
 * - lockAccount(tx, userId)  — SELECT … FOR UPDATE
 * - applyLedgerEntry credit_available
 *
 * Does NOT change Deposit.status — caller sets APPROVED after success.
 */
export async function creditDepositToLedger(
  tx: TxClient,
  params: {
    userId: string;
    depositId: string;
    amount: Prisma.Decimal | string | number;
    description?: string;
  }
): Promise<LedgerEntryResult> {
  const account = await lockAccount(tx, params.userId);

  return applyLedgerEntry(tx, account, {
    userId: params.userId,
    type: "DEPOSIT",
    direction: "credit_available",
    amount: params.amount,
    depositId: params.depositId,
    description: params.description ?? "Deposit approved",
    referencePrefix: "DEP",
    metadata: { source: "deposit_approval" },
  });
}
