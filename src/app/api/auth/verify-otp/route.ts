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
 *
 * Verifies a LOGIN OTP, creates a session cookie,
 * and returns the authenticated user + KYC routing hint.
 *
 * After OTP:
 * - KYC NOT_SUBMITTED / DECLINED → Profile/KYC
 * - KYC PENDING → Dashboard
 * - KYC APPROVED → Dashboard
 * - ADMIN / SUPER_ADMIN → Admin Dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    const rl = await rateLimitOtp(ip);

    if (!rl.allowed) {
      return jsonError("Too many OTP attempts. Try again later.", 429, {
        code: "RATE_LIMITED",
        retryAfterMs: rl.retryAfterMs,
      });
    }

    const body = await request.json();
    const data = verifyOtpSchema.parse(body);

    /*
     * verifyOtpChallenge returns:
     *
     * {
     *   ok: true,
     *   userId: string,
     *   purpose: OtpPurpose
     * }
     *
     * It does not return the user object, so we fetch
     * the user after successful OTP verification.
     */
    const result = await verifyOtpChallenge({
      challengeId: data.challengeId,
      code: data.code,
    });

    if (!result.ok) {
      return jsonError(result.error, 401);
    }

    /*
     * Fetch the authenticated user and KYC information.
     */
    const user = await prisma.user.findUnique({
      where: {
        id: result.userId,
      },
      include: {
        kyc: true,
      },
    });

    if (!user) {
      return jsonError("User account not found.", 404);
    }

    const meta = clientMeta(request);

    /*
     * Create authenticated session.
     */
    const session = await createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    /*
     * Mark the user's email as verified and update login timestamp.
     */
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
        emailVerified: true,
      },
    });

    /*
     * Record successful login in the audit log.
     *
     * Audit logging should never prevent a successful login,
     * therefore failures are intentionally ignored.
     */
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

    /*
     * Set the authenticated session cookie.
     */
    const cookieStore = await cookies();

    cookieStore.set(
      SESSION_COOKIE,
      session.token,
      sessionCookieOptions(session.expiresAt)
    );

    /*
     * Determine KYC status.
     */
    const kycStatus = user.kyc?.status ?? "NOT_SUBMITTED";

    /*
     * Determine where the user should go after verification.
     */
    let redirectTo = "/dashboard";

    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      redirectTo = "/admin/dashboard";
    } else if (
      kycStatus === "NOT_SUBMITTED" ||
      kycStatus === "DECLINED"
    ) {
      redirectTo = "/profile";
    } else if (kycStatus === "PENDING") {
      redirectTo = "/dashboard";
    } else if (kycStatus === "APPROVED") {
      redirectTo = "/dashboard";
    }

    return jsonOk({
      message: "Verified successfully",
      user: publicUser(user),
      kycStatus,
      redirectTo,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return zodErrorResponse(err);
    }

    console.error("[auth/verify-otp]", err);

    return jsonError(
      "Unable to verify code. Please try again.",
      500
    );
  }
}