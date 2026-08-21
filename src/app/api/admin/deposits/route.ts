import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/require";
import { jsonOk, jsonError } from "@/lib/api";

/**
 * GET /api/admin/deposits
 * Requires permission: deposits:review
 */
export async function GET(request: NextRequest) {
  const auth = await requirePermission("deposits:review");
  if ("error" in auth) return auth.error;

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") || undefined;
    const method = searchParams.get("method") || undefined;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10) || 50,
      200
    );

    const deposits = await prisma.deposit.findMany({
      where: {
        ...(status
          ? {
              status: status as
                | "PENDING"
                | "APPROVED"
                | "DECLINED"
                | "CANCELLED",
            }
          : {}),
        ...(method ? { method: method as "MANUAL" | "AUTOMATIC" } : {}),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
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
        reviewedById: d.reviewedById,
        createdAt: d.createdAt.toISOString(),
        user: d.user,
        cryptocurrency: d.cryptocurrency,
        network: d.network,
      })),
    });
  } catch (err) {
    console.error("[admin/deposits]", err);
    return jsonError("Unable to load deposits", 500);
  }
}
