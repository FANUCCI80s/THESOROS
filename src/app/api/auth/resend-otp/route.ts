import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { resendOtpSchema } from "@/lib/validations/auth";
import { createOtpChallenge } from "@/lib/auth/otp";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";

/**
 * POST /api/auth/resend-otp
 * Invalidate previous challenge and issue a new LOGIN OTP for the same user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = resendOtpSchema.parse(body);

    const existing = await prisma.otpChallenge.findUnique({
      where: { id: data.challengeId },
      select: { userId: true, purpose: true },
    });

    if (!existing) {
      return jsonError("Invalid challenge. Please log in again.", 400);
    }

    const otp = await createOtpChallenge({
      userId: existing.userId,
      purpose: existing.purpose,
    });

    return jsonOk({
      message: "A new verification code has been sent.",
      challengeId: otp.challengeId,
      expiresAt: otp.expiresAt.toISOString(),
      ...(otp.debugCode ? { debugCode: otp.debugCode } : {}),
    });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[auth/resend-otp]", err);
    return jsonError("Unable to resend code. Please try again.", 500);
  }
}


