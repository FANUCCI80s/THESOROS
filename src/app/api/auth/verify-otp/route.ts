import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { verifyOtpChallenge } from "@/lib/auth/otp";
import {
  createSession,
  publicUser,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { clientMeta, jsonOk, jsonError, zodErrorResponse } from "@/lib/api";
import { rateLimitOtp } from "@/lib/rate-limit";

/**
 * POST /api/auth/verify-otp
 * Verifies LOGIN OTP, creates session cookie, returns user + KYC routing hint.
 *
 * After OTP:
 * - KYC NOT_SUBMITTED / DECLINED → client should send user to Profile/KYC
 * - KYC PENDING → limited dashboard / pending state
 * - KYC APPROVED → full dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await rateLimitOtp(ip);
    if (!rl.allowed) {
      return jsonError("Too many OTP attempts. Try again later.", 429, {
        code: "RATE_LIMITED",
        retryAfterMs: rl.retryAfterMs,
      });
    }

    const body = await request.json();
    const data = verifyOtpSchema.parse(body);

    const result = await verifyOtpChallenge({
      challengeId: data.challengeId,
      code: data.code,
    });

    if (!result.ok) {
      return jsonError(result.error, 401);
    }

    const { user } = result.challenge;
    const meta = clientMeta(request);

    const session = await createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        emailVerified: true,
      },
    });

    await prisma.auditLog
      .create({
        data: {
          action: "LOGIN",
          actorId: user.id,
          details: {
            ip: meta.ipAddress,
            challengeId: data.challengeId,
          },
        },
      })
      .catch(() => {});

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt)
    );

    const kycStatus = user.kyc?.status ?? "NOT_SUBMITTED";

    // Client routing guidance (blueprint: KYC status determines post-OTP path)
    let redirectTo = "/dashboard";
    if (kycStatus === "NOT_SUBMITTED" || kycStatus === "DECLINED") {
      redirectTo = "/profile"; // KYC lives under Profile
    } else if (kycStatus === "PENDING") {
      redirectTo = "/dashboard";
    } else if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      redirectTo = "/admin/dashboard";
    }

    return jsonOk({
      message: "Verified successfully",
      user: publicUser(user),
      kycStatus,
      redirectTo,
    });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[auth/verify-otp]", err);
    return jsonError("Unable to verify code. Please try again.", 500);
  }
}
