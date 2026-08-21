


import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { jsonOk, jsonError, zodErrorResponse, clientMeta } from "@/lib/api";
import { rateLimitAuth } from "@/lib/rate-limit";

/**
 * POST /api/auth/signup
 * Create user + Account + Kyc (NOT_SUBMITTED). Does not log the user in.
 * Client should redirect to /login after success.
 */
export async function POST(request: NextRequest) {
  try {
    const { ipAddress } = clientMeta(request);
    const rl = await rateLimitAuth(ipAddress || "unknown", "signup");
    if (!rl.allowed) {
      return jsonError("Too many signup attempts. Try again later.", 429, {
        code: "RATE_LIMITED",
        retryAfterMs: rl.retryAfterMs,
      });
    }

    const body = await request.json();
    const data = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: "USER",
          status: "ACTIVE",
          emailVerified: false,
        },
      });

      await tx.account.create({
        data: {
          userId: created.id,
          availableBalance: 0,
          investedBalance: 0,
          currency: "USD",
        },
      });

      await tx.kyc.create({
        data: {
          userId: created.id,
          status: "NOT_SUBMITTED",
        },
      });

      await tx.auditLog.create({
        data: {
          action: "USER_CREATED",
          actorId: created.id,
          details: { email: created.email },
        },
      }).catch(() => {
        // Audit is best-effort if schema requires more fields
      });

      return created;
    });

    return jsonOk(
      {
        message: "Account created. Please log in to continue.",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[auth/signup]", err);
    return jsonError("Unable to create account. Please try again.", 500);
  }
}
