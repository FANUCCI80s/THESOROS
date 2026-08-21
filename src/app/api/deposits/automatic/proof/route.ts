import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require";
import { automaticProofSchema } from "@/lib/validations/deposit";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";

/**
 * POST /api/deposits/automatic/proof
 *
 * Blueprint flow (return → proof → PAID → PENDING):
 * After external payment, user uploads proof.
 * Status remains PENDING for admin review.
 * Balance is still NOT credited.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth.ctx;

  try {
    const body = await request.json();
    const data = automaticProofSchema.parse(body);

    const deposit = await prisma.deposit.findFirst({
      where: {
        id: data.depositId,
        userId: user.id,
        method: "AUTOMATIC",
      },
    });

    if (!deposit) {
      return jsonError("Deposit not found", 404);
    }

    if (deposit.status !== "PENDING") {
      return jsonError(
        `Cannot attach proof to a deposit with status ${deposit.status}`,
        400
      );
    }

    if (deposit.proofUrl) {
      return jsonError("Proof already submitted for this deposit", 400);
    }

    const updated = await prisma.deposit.update({
      where: { id: deposit.id },
      data: {
        proofUrl: data.proofUrl,
        paymentReference: data.paymentReference ?? deposit.paymentReference,
      },
      include: {
        cryptocurrency: { select: { symbol: true, name: true } },
        network: { select: { name: true } },
      },
    });

    return jsonOk({
      message:
        "Proof received. Deposit remains PENDING until an administrator approves it.",
      deposit: {
        id: updated.id,
        method: updated.method,
        status: updated.status,
        amount: updated.amount.toString(),
        proofUrl: updated.proofUrl,
        paymentReference: updated.paymentReference,
        createdAt: updated.createdAt.toISOString(),
        cryptocurrency: updated.cryptocurrency,
        network: updated.network,
      },
    });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[deposits/automatic/proof]", err);
    return jsonError("Unable to attach proof", 500);
  }
}
