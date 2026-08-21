

import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import {
  verifyPasswordOrDummy,
  needsRehash,
  upgradePasswordHash,
} from "@/lib/auth/password";
import { createOtpChallenge } from "@/lib/auth/otp";
import { jsonOk, jsonError, zodErrorResponse, clientMeta } from "@/lib/api";
import { rateLimitAuth } from "@/lib/rate-limit";

/**
 * POST /api/auth/login
 * Validates credentials, issues LOGIN OTP challenge.
 * Session is created only after /api/auth/verify-otp succeeds.
 */
export async function POST(request: NextRequest) {
  try {
    const { ipAddress } = clientMeta(request);
    const rl = await rateLimitAuth(ipAddress || "unknown", "login");
    if (!rl.allowed) {
      return jsonError("Too many login attempts. Try again later.", 429, {
        code: "RATE_LIMITED",
        retryAfterMs: rl.retryAfterMs,
      });
    }

    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Generic message to avoid account enumeration
    const invalidMsg = "Invalid email or password";

    // Always bcrypt.compare (dummy hash if no user) — similar timing
    const valid = await verifyPasswordOrDummy(
      data.password,
      user?.passwordHash
    );

    if (!user || !valid) {
      return jsonError(invalidMsg, 401);
    }

    if (user.status === "BANNED" || user.status === "SUSPENDED") {
      return jsonError("This account has been restricted. Contact support.", 403);
    }

    // Upgrade hash if cost factor was raised
    if (needsRehash(user.passwordHash)) {
      const next = await upgradePasswordHash(data.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: next },
      });
    }

    const otp = await createOtpChallenge({
      userId: user.id,
      purpose: "LOGIN",
    });

    return jsonOk({
      message: "Verification code sent. Enter the code to continue.",
      challengeId: otp.challengeId,
      expiresAt: otp.expiresAt.toISOString(),
      // Dev only — remove reliance in production UI
      ...(otp.debugCode ? { debugCode: otp.debugCode } : {}),
      user: {
        email: user.email,
        firstName: user.firstName,
      },
    });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[auth/login]", err);
    return jsonError("Unable to log in. Please try again.", 500);
  }
}
