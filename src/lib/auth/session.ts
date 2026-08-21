import type { PublicUser } from "@/types";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "thesoros_session";
/** Session lifetime: 7 days */
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function sessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_TTL_MS);
}

export async function createSession(params: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const token = generateSessionToken();
  const session = await prisma.session.create({
    data: {
      userId: params.userId,
      token,
      expiresAt: sessionExpiresAt(),
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
  });
  return session;
}

export async function deleteSessionByToken(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

/**
 * Resolve the authenticated user from the session cookie.
 * Returns null if missing, expired, or user inactive.
 */
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          kyc: true,
          account: true,
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  const { user } = session;
  if (user.status === "BANNED" || user.status === "SUSPENDED") {
    return null;
  }

  return { session, user };
}

export function publicUser(user: {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  emailVerified: boolean;
  kyc?: { status: string } | null;
  account?: {
    availableBalance: { toString(): string } | number | string;
    investedBalance: { toString(): string } | number | string;
    currency: string;
  } | null;
}): PublicUser {
  const available = user.account?.availableBalance;
  const invested = user.account?.investedBalance;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role as PublicUser["role"],
    status: user.status as PublicUser["status"],
    emailVerified: user.emailVerified,
    kycStatus: (user.kyc?.status ?? "NOT_SUBMITTED") as PublicUser["kycStatus"],
    account: user.account
      ? {
          availableBalance: String(available ?? "0"),
          investedBalance: String(invested ?? "0"),
          currency: user.account.currency,
        }
      : null,
  } satisfies PublicUser;
}

/**
 * Cookie options for the session token.
 */
export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}
