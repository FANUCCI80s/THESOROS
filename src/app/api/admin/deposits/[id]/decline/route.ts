import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/require";
import { adminDepositActionSchema } from "@/lib/validations/deposit";
import {
  withLedgerTransaction,
  lockDeposit,
  ledgerErrorToHttp,
} from "@/lib/ledger";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/deposits/[id]/decline
 * Locks deposit row so approve/decline cannot race.
 * No balance change.
 */
export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requirePermission("deposits:review");
  if ("error" in auth) return auth.error;
  const admin = auth.ctx.user;

  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const data = adminDepositActionSchema.parse(body);

    const result = await withLedgerTransaction(prisma, async (tx) => {
      const locked = await lockDeposit(tx, id);

      if (locked.status !== "PENDING") {
        throw new Error(
          `Only PENDING deposits can be declined (current: ${locked.status})`
        );
      }

      const updated = await tx.deposit.update({
        where: { id },
        data: {
          status: "DECLINED",
          reviewedAt: new Date(),
          reviewedById: admin.id,
          adminNote: data.adminNote ?? undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "DEPOSIT_DECLINED",
          actorId: admin.id,
          entityType: "Deposit",
          entityId: id,
          details: {
            amount: locked.amount.toString(),
            method: locked.method,
            userId: locked.userId,
            note: data.adminNote,
          },
        },
      });

      return updated;
    });

    return jsonOk({
      message: "Deposit declined. No balance change.",
      deposit: {
        id: result.id,
        status: result.status,
        amount: result.amount.toString(),
        adminNote: result.adminNote,
        reviewedAt: result.reviewedAt?.toISOString(),
      },
    });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);

    if (err instanceof Error) {
      const msg = err.message;
      if (msg.includes("PENDING") || msg.includes("already")) {
        return jsonError(msg, 409);
      }
    }

    const mapped = ledgerErrorToHttp(err);
    if (mapped.body.code !== "UNKNOWN") {
      console.warn("[admin/deposits/decline]", mapped.body.code, mapped.body.error);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }

    console.error("[admin/deposits/decline]", err);
    return jsonError(
      err instanceof Error ? err.message : "Unable to decline deposit",
      500
    );
  }
}
