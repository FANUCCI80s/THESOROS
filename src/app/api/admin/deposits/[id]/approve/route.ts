import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/require";
import { adminDepositActionSchema } from "@/lib/validations/deposit";
import {
  creditDepositToLedger,
  withLedgerTransaction,
  lockDeposit,
} from "@/lib/deposits/ledger";
import { ledgerErrorToHttp } from "@/lib/ledger";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/deposits/[id]/approve
 *
 * Locking order (Serializable + FOR UPDATE):
 * 1. Deposit row FOR UPDATE → must be PENDING
 * 2. Account row FOR UPDATE → credit available balance + Transaction ledger
 * 3. Mark deposit APPROVED
 *
 * Concurrent double-approve: second tx blocks on deposit lock, then sees non-PENDING → 409
 * Concurrent credits to same user: serialized on Account FOR UPDATE
 */
export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requirePermission("deposits:review");
  if ("error" in auth) return auth.error;
  const admin = auth.ctx.user;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const data = adminDepositActionSchema.parse(body);

    const existing = await prisma.deposit.findUnique({
      where: { id },
      include: { cryptocurrency: { select: { symbol: true } } },
    });

    if (!existing) {
      return jsonError("Deposit not found", 404);
    }

    if (existing.status !== "PENDING") {
      return jsonError(
        `Only PENDING deposits can be approved (current: ${existing.status})`,
        400
      );
    }

    if (existing.method === "AUTOMATIC" && !existing.proofUrl) {
      return jsonError(
        "Automatic deposit has no proof attached yet. Wait for user proof or decline.",
        400
      );
    }

    const result = await withLedgerTransaction(prisma, async (tx) => {
      // 1. Lock deposit
      const lockedDeposit = await lockDeposit(tx, id);

      if (lockedDeposit.status !== "PENDING") {
        throw new Error(
          `Deposit already ${lockedDeposit.status} (concurrent approval)`
        );
      }

      if (lockedDeposit.method === "AUTOMATIC" && !lockedDeposit.proofUrl) {
        throw new Error("Automatic deposit has no proof attached");
      }

      // 2. Lock account + ledger credit
      const ledger = await creditDepositToLedger(tx, {
        userId: lockedDeposit.userId,
        depositId: lockedDeposit.id,
        amount: lockedDeposit.amount,
        description: `Deposit approved (${lockedDeposit.method}) · ${existing.cryptocurrency.symbol}`,
      });

      // 3. Mark approved only after ledger succeeds
      const updated = await tx.deposit.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewedAt: new Date(),
          reviewedById: admin.id,
          adminNote: data.adminNote ?? undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "DEPOSIT_APPROVED",
          actorId: admin.id,
          entityType: "Deposit",
          entityId: id,
          details: {
            amount: lockedDeposit.amount.toString(),
            method: lockedDeposit.method,
            userId: lockedDeposit.userId,
            reference: ledger.reference,
          },
        },
      });

      return { updated, ledger };
    });

    return jsonOk({
      message: "Deposit approved. Available balance updated.",
      deposit: {
        id: result.updated.id,
        status: result.updated.status,
        amount: result.updated.amount.toString(),
        reviewedAt: result.updated.reviewedAt?.toISOString(),
      },
      transaction: {
        id: result.ledger.transactionId,
        reference: result.ledger.reference,
        balanceBefore: result.ledger.balanceBefore.toString(),
        balanceAfter: result.ledger.balanceAfter.toString(),
        availableBalance: result.ledger.availableBalance.toString(),
        investedBalance: result.ledger.investedBalance.toString(),
      },
    });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);

    // Concurrent approval / business rule messages thrown as plain Error
    if (err instanceof Error) {
      const msg = err.message;
      if (
        msg.includes("concurrent") ||
        msg.includes("already") ||
        msg.includes("no proof")
      ) {
        return jsonError(msg, 409);
      }
    }

    const mapped = ledgerErrorToHttp(err);
    if (mapped.body.code !== "UNKNOWN") {
      console.warn("[admin/deposits/approve]", mapped.body.code, mapped.body.error);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }

    console.error("[admin/deposits/approve]", err);
    return jsonError(
      err instanceof Error ? err.message : "Unable to approve deposit",
      500
    );
  }
}
