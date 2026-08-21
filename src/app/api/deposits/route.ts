import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require";
import { jsonOk, jsonError } from "@/lib/api";

/**
 * GET /api/deposits
 * List the authenticated user's deposits (newest first).
 * Query: ?status=PENDING|APPROVED|DECLINED&limit=20
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { user } = auth.ctx;

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") || undefined;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10) || 20,
      100
    );

    const deposits = await prisma.deposit.findMany({
      where: {
        userId: user.id,
        ...(status
          ? {
              status: status as
                | "PENDING"
                | "APPROVED"
                | "DECLINED"
                | "CANCELLED",
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        cryptocurrency: { select: { symbol: true, name: true } },
        network: { select: { name: true } },
      },
    });

    return jsonOk({
      deposits: deposits.map((d) => ({
        id: d.id,
        method: d.method,
        status: d.status,
        amount: d.amount.toString(),
        walletAddress: d.walletAddress,
        proofUrl: d.proofUrl,
        paymentReference: d.paymentReference,
        adminNote: d.adminNote,
        reviewedAt: d.reviewedAt?.toISOString() ?? null,
        createdAt: d.createdAt.toISOString(),
        cryptocurrency: d.cryptocurrency,
        network: d.network,
      })),
    });
  } catch (err) {
    console.error("[deposits/list]", err);
    return jsonError("Unable to load deposits", 500);
  }
}
