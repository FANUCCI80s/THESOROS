import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require";
import { manualDepositSchema } from "@/lib/validations/deposit";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";

/**
 * POST /api/deposits/manual
 *
 * Flow:
 * 1. User selects crypto + network + amount
 * 2. User sends crypto to admin-configured wallet
 * 3. User uploads proof → this endpoint creates Deposit status=PENDING
 * 4. Balance is NOT credited until admin approves
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth.ctx;

  try {
    const body = await request.json();
    const data = manualDepositSchema.parse(body);

    const config = await prisma.manualDepositConfiguration.findFirst({
      where: {
        cryptocurrencyId: data.cryptocurrencyId,
        networkId: data.networkId,
        isActive: true,
      },
    });

    if (!config) {
      return jsonError(
        "No active manual deposit configuration for this asset/network",
        400
      );
    }

    const crypto = await prisma.cryptocurrency.findFirst({
      where: { id: data.cryptocurrencyId, isActive: true },
    });
    if (!crypto) {
      return jsonError("Cryptocurrency is not available", 400);
    }

    const network = await prisma.cryptoNetwork.findFirst({
      where: {
        id: data.networkId,
        cryptocurrencyId: data.cryptocurrencyId,
        status: "ACTIVE",
      },
    });
    if (!network) {
      return jsonError("Network is not available", 400);
    }

    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        method: "MANUAL",
        status: "PENDING",
        amount: data.amount,
        cryptocurrencyId: data.cryptocurrencyId,
        networkId: data.networkId,
        walletAddress: config.walletAddress,
        proofUrl: data.proofUrl,
        paymentReference: data.paymentReference ?? null,
      },
      include: {
        cryptocurrency: { select: { symbol: true, name: true } },
        network: { select: { name: true } },
      },
    });

    return jsonOk(
      {
        message:
          "Deposit submitted and is PENDING admin review. Balance will update after approval.",
        deposit: serializeDeposit(deposit),
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[deposits/manual]", err);
    return jsonError("Unable to create deposit", 500);
  }
}

function serializeDeposit(d: {
  id: string;
  method: string;
  status: string;
  amount: { toString(): string };
  walletAddress: string | null;
  proofUrl: string | null;
  paymentReference: string | null;
  createdAt: Date;
  cryptocurrency?: { symbol: string; name: string };
  network?: { name: string } | null;
}) {
  return {
    id: d.id,
    method: d.method,
    status: d.status,
    amount: d.amount.toString(),
    walletAddress: d.walletAddress,
    proofUrl: d.proofUrl,
    paymentReference: d.paymentReference,
    createdAt: d.createdAt.toISOString(),
    cryptocurrency: d.cryptocurrency,
    network: d.network,
  };
}
