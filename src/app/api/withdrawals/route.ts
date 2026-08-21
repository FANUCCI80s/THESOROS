import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/require";
import { withdrawalRequestSchema } from "@/lib/validations/withdrawal";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";
import {
  withLedgerTransaction,
  lockAccount,
  applyLedgerEntry,
  isLedgerError,
} from "@/lib/ledger";

/** GET /api/withdrawals — own withdrawals */
export async function GET(request: NextRequest) {
  const auth = await requirePermission("withdrawal:read_own");
  if ("error" in auth) return auth.error;

  const limit = Math.min(
    parseInt(request.nextUrl.searchParams.get("limit") || "20", 10) || 20,
    100
  );

  const rows = await prisma.withdrawal.findMany({
    where: { userId: auth.ctx.user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      cryptocurrency: { select: { symbol: true, name: true } },
      network: { select: { name: true } },
    },
  });

  return jsonOk({
    withdrawals: rows.map((w) => ({
      id: w.id,
      status: w.status,
      amount: w.amount.toString(),
      destinationAddress: w.destinationAddress,
      adminNote: w.adminNote,
      txHash: w.txHash,
      createdAt: w.createdAt.toISOString(),
      cryptocurrency: w.cryptocurrency,
      network: w.network,
    })),
  });
}

/**
 * POST /api/withdrawals
 * Creates PENDING withdrawal and holds funds (debit available) via ledger.
 * Admin approval later marks COMPLETED without second debit.
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission("withdrawal:create");
  if ("error" in auth) return auth.error;
  const userId = auth.ctx.user.id;

  try {
    const body = await request.json();
    const data = withdrawalRequestSchema.parse(body);

    const crypto = await prisma.cryptocurrency.findFirst({
      where: { id: data.cryptocurrencyId, isActive: true },
    });
    if (!crypto) return jsonError("Cryptocurrency not available", 400);

    const network = await prisma.cryptoNetwork.findFirst({
      where: {
        id: data.networkId,
        cryptocurrencyId: data.cryptocurrencyId,
        status: "ACTIVE",
      },
    });
    if (!network) return jsonError("Network not available", 400);

    const result = await withLedgerTransaction(prisma, async (tx) => {
      const account = await lockAccount(tx, userId);
      const amount = new Prisma.Decimal(data.amount);

      if (account.availableBalance.lt(amount)) {
        throw new Error("Insufficient available balance");
      }

      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          status: "PENDING",
          amount,
          cryptocurrencyId: data.cryptocurrencyId,
          networkId: data.networkId,
          destinationAddress: data.destinationAddress,
        },
      });

      await applyLedgerEntry(tx, account, {
        userId,
        type: "WITHDRAWAL",
        direction: "debit_available",
        amount,
        withdrawalId: withdrawal.id,
        description: `Withdrawal request (${crypto.symbol})`,
        referencePrefix: "WDR",
        status: "PENDING",
        metadata: { phase: "hold" },
      });

      return withdrawal;
    });

    return jsonOk(
      {
        message: "Withdrawal submitted and is PENDING admin review",
        withdrawal: {
          id: result.id,
          status: result.status,
          amount: result.amount.toString(),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (isLedgerError(err)) return jsonError(err.message, 409);
    if (err instanceof Error && err.message.includes("Insufficient")) {
      return jsonError(err.message, 400);
    }
    console.error("[withdrawals]", err);
    return jsonError("Unable to create withdrawal", 500);
  }
}
