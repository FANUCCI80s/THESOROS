import { prisma } from "@/lib/prisma";
import { createHash, randomInt } from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export type OtpPurpose =
  | "LOGIN"
  | "PASSWORD_RESET"
  | "EMAIL_VERIFICATION";

type CreateOtpResult = {
  challengeId: string;
  expiresAt: Date;
  debugCode?: string;
};

/**
 * Hash an OTP before storing/comparing it.
 */
function hashOtp(code: string): string {
  return createHash("sha256")
    .update(code.trim())
    .digest("hex");
}

/**
 * Generate a cryptographically secure 6-digit OTP.
 */
export function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

/**
 * Create a new OTP challenge.
 *
 * Previous pending challenges for the same user/purpose
 * are invalidated before creating the new challenge.
 */
export async function createOtpChallenge(params: {
  userId: string;
  purpose: OtpPurpose;
}): Promise<CreateOtpResult> {
  const user = await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const code = generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  // Invalidate previous pending challenges.
  await prisma.otpChallenge.updateMany({
    where: {
      userId: params.userId,
      purpose: params.purpose,
      status: "PENDING",
    },
    data: {
      status: "EXPIRED",
    },
  });

  const challenge = await prisma.otpChallenge.create({
    data: {
      userId: params.userId,
      codeHash,
      purpose: params.purpose,
      status: "PENDING",
      expiresAt,
      attempts: 0,
    },
  });

  /*
   * Development-only fallback.
   *
   * We intentionally do NOT store the plaintext OTP.
   *
   * For now, until we build THÉSOROS's actual email delivery,
   * the server can expose the code in development.
   */
  const debugCode =
    process.env.NODE_ENV === "development"
      ? code
      : undefined;

  if (debugCode) {
    console.info(
      `[THÉSOROS OTP:DEV] purpose=${params.purpose} challengeId=${challenge.id} code=${code}`
    );
  } else {
    console.info(
      `[THÉSOROS OTP] challenge created: ${challenge.id}`
    );
  }

  return {
    challengeId: challenge.id,
    expiresAt,
    debugCode,
  };
}

/**
 * Verify an OTP challenge.
 */
export async function verifyOtpChallenge(params: {
  challengeId: string;
  code: string;
}): Promise<
  | {
      ok: true;
      userId: string;
      purpose: OtpPurpose;
    }
  | {
      ok: false;
      error: string;
    }
> {
  const challenge = await prisma.otpChallenge.findUnique({
    where: {
      id: params.challengeId,
    },
  });

  if (!challenge) {
    return {
      ok: false,
      error: "Invalid or expired verification code.",
    };
  }

  if (challenge.status !== "PENDING") {
    return {
      ok: false,
      error: "This code is no longer valid. Request a new one.",
    };
  }

  if (challenge.expiresAt.getTime() <= Date.now()) {
    await prisma.otpChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        status: "EXPIRED",
      },
    });

    return {
      ok: false,
      error: "This code has expired. Request a new one.",
    };
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    await prisma.otpChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return {
      ok: false,
      error: "Too many attempts. Request a new code.",
    };
  }

  const incomingHash = hashOtp(params.code);

  if (incomingHash !== challenge.codeHash) {
    const newAttempts = challenge.attempts + 1;

    await prisma.otpChallenge.update({
      where: {
        id: challenge.id,
      },
      data: {
        attempts: {
          increment: 1,
        },
        ...(newAttempts >= MAX_ATTEMPTS
          ? {
              status: "FAILED",
            }
          : {}),
      },
    });

    if (newAttempts >= MAX_ATTEMPTS) {
      return {
        ok: false,
        error: "Too many attempts. Request a new code.",
      };
    }

    return {
      ok: false,
      error: "Incorrect verification code.",
    };
  }

  await prisma.otpChallenge.update({
    where: {
      id: challenge.id,
    },
    data: {
      status: "VERIFIED",
      verifiedAt: new Date(),
    },
  });

  return {
    ok: true,
    userId: challenge.userId,
    purpose: challenge.purpose as OtpPurpose,
  };
}

/**
 * Expire old OTP challenges.
 *
 * Useful for maintenance/cleanup jobs.
 */
export async function expireOldOtpChallenges(): Promise<void> {
  await prisma.otpChallenge.updateMany({
    where: {
      status: "PENDING",
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

export { hashOtp, OTP_TTL_MS, MAX_ATTEMPTS };