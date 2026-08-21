import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require";
import { automaticInitiateSchema } from "@/lib/validations/deposit";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";

/**
 * POST /api/deposits/automatic/initiate
 *
 * Blueprint flow (step 1–2):
 * PAY NOW → create deposit PENDING (no proof yet) → return external paymentUrl
 *
 * Balance is NOT credited here.
 * User returns later and submits proof via /api/deposits/automatic/proof.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth.ctx;

  try {
    const body = await request.json();
    const data = automaticInitiateSchema.parse(body);

    const config = await prisma.automaticDepositConfiguration.findFirst({
      where: {
        isActive: true,
        cryptocurrencyId: data.cryptocurrencyId,
        ...(data.configId ? { id: data.configId } : {}),
        ...(data.networkId ? { networkId: data.networkId } : {}),
      },
      include: {
        cryptocurrency: { select: { symbol: true, name: true } },
        network: { select: { name: true } },
      },
    });

    if (!config) {
      return jsonError(
        "No active automatic deposit configuration for this asset",
        400
      );
    }

    const crypto = await prisma.cryptocurrency.findFirst({
      where: { id: data.cryptocurrencyId, isActive: true },
    });
    if (!crypto) {
      return jsonError("Cryptocurrency is not available", 400);
    }

    // Deposit created as PENDING without proof — proof comes after external pay
    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        method: "AUTOMATIC",
        status: "PENDING",
        amount: data.amount,
        cryptocurrencyId: data.cryptocurrencyId,
        networkId: config.networkId ?? data.networkId ?? null,
        walletAddress: config.walletAddress,
        proofUrl: null,
        paymentReference: null,
      },
    });

    // Build return URL for provider (client may append depositId)
    const returnHint = `/deposit?method=automatic&depositId=${deposit.id}&step=proof`;

    return jsonOk(
      {
        message:
          "Continue to the payment page. After paying, return and upload proof. Deposit stays PENDING until admin approval.",
        depositId: deposit.id,
        paymentUrl: config.paymentUrl,
        returnHint,
        amount: data.amount,
        walletAddress: config.walletAddress,
        warningMessage: config.warningMessage,
        cryptocurrency: config.cryptocurrency,
        network: config.network,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[deposits/automatic/initiate]", err);
    return jsonError("Unable to initiate automatic deposit", 500);
  }
}
