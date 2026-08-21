import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/require";
import { purchaseInvestmentSchema } from "@/lib/validations/investment";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";
import {
  withLedgerTransaction,
  lockAccount,
  applyLedgerEntry,
  isLedgerError,
} from "@/lib/ledger";

/** GET /api/investments — own investments + available plans */
export async function GET() {
  const auth = await requirePermission("investment:read_own");
  if ("error" in auth) return auth.error;

  const [investments, plans] = await Promise.all([
    prisma.investment.findMany({
      where: { userId: auth.ctx.user.id },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    }),
    prisma.investmentPlan.findMany({
      where: { status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return jsonOk({
    investments: investments.map((i) => ({
      id: i.id,
      status: i.status,
      principal: i.principal.toString(),
      currentValue: i.currentValue.toString(),
      profit: i.profit.toString(),
      performancePct: i.performancePct.toString(),
      startDate: i.startDate.toISOString(),
      maturityDate: i.maturityDate.toISOString(),
      plan: i.plan
        ? {
            id: i.plan.id,
            name: i.plan.name,
            durationDays: i.plan.durationDays,
            returnPercentage: i.plan.returnPercentage.toString(),
          }
        : null,
    })),
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      minAmount: p.minAmount.toString(),
      maxAmount: p.maxAmount?.toString() ?? null,
      durationDays: p.durationDays,
      returnPercentage: p.returnPercentage.toString(),
      assetsIncluded: p.assetsIncluded,
    })),
  });
}

/**
 * POST /api/investments — purchase plan (plan-based performance, not market).
 * Moves funds available → invested via ledger.
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission("investment:purchase");
  if ("error" in auth) return auth.error;
  const userId = auth.ctx.user.id;

  try {
    const body = await request.json();
    const data = purchaseInvestmentSchema.parse(body);

    const plan = await prisma.investmentPlan.findFirst({
      where: { id: data.planId, status: "ACTIVE" },
    });
    if (!plan) return jsonError("Investment plan not available", 400);

    const amount = new Prisma.Decimal(data.amount);
    if (amount.lt(plan.minAmount)) {
      return jsonError(`Minimum amount is ${plan.minAmount.toString()}`, 400);
    }
    if (plan.maxAmount && amount.gt(plan.maxAmount)) {
      return jsonError(`Maximum amount is ${plan.maxAmount.toString()}`, 400);
    }

    const returnPct = new Prisma.Decimal(plan.returnPercentage.toString());
    const expectedProfit = amount.mul(returnPct).div(100);
    const currentValue = amount.add(expectedProfit);
    const start = new Date();
    const maturity = new Date(start);
    maturity.setDate(maturity.getDate() + plan.durationDays);

    const result = await withLedgerTransaction(prisma, async (tx) => {
      const account = await lockAccount(tx, userId);
      if (account.availableBalance.lt(amount)) {
        throw new Error("Insufficient available balance");
      }

      const investment = await tx.investment.create({
        data: {
          userId,
          planId: plan.id,
          principal: amount,
          currentValue,
          profit: expectedProfit,
          performancePct: returnPct,
          status: "ACTIVE",
          startDate: start,
          maturityDate: maturity,
        },
      });

      await applyLedgerEntry(tx, account, {
        userId,
        type: "INVESTMENT_PURCHASE",
        direction: "move_available_to_invested",
        amount,
        investmentId: investment.id,
        description: `Investment purchase · ${plan.name}`,
        referencePrefix: "INV",
        metadata: { planId: plan.id, planName: plan.name },
      });

      return investment;
    });

    return jsonOk(
      {
        message: "Investment activated",
        investment: {
          id: result.id,
          status: result.status,
          principal: result.principal.toString(),
          currentValue: result.currentValue.toString(),
          profit: result.profit.toString(),
          maturityDate: result.maturityDate.toISOString(),
          planName: plan.name,
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
    console.error("[investments]", err);
    return jsonError("Unable to purchase investment", 500);
  }
}
