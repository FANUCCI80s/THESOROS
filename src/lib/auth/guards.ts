import { redirect } from "next/navigation";
import { getSessionUser, publicUser } from "@/lib/auth/session";
import {
  canAccessAdminSection,
  hasPermission,
  isAdminRole,
  type Permission,
} from "@/lib/auth/rbac";
import type { PublicUser } from "@/types";

export type GuardContext = {
  user: PublicUser;
  sessionId: string;
};

/**
 * Server Component / layout guard: require a valid DB session.
 */
export async function requirePageSession(
  options?: { next?: string }
): Promise<GuardContext> {
  const ctx = await getSessionUser();
  if (!ctx) {
    const q = options?.next
      ? `?next=${encodeURIComponent(options.next)}`
      : "";
    redirect(`/login${q}`);
  }

  return {
    user: publicUser(ctx.user),
    sessionId: ctx.session.id,
  };
}

/**
 * Require ADMIN or SUPER_ADMIN for admin layouts.
 */
export async function requirePageAdmin(
  options?: { next?: string }
): Promise<GuardContext> {
  const guard = await requirePageSession(options);
  if (!isAdminRole(guard.user.role)) {
    redirect("/dashboard");
  }
  return guard;
}

/**
 * Require a specific permission in a Server Component / page.
 */
export async function requirePagePermission(
  permission: Permission,
  options?: { fallback?: string }
): Promise<GuardContext> {
  const guard = await requirePageSession();
  if (!hasPermission(guard.user.role, permission)) {
    redirect(options?.fallback ?? "/dashboard");
  }
  return guard;
}

/**
 * Gate an admin section (users, deposits, settings, …).
 */
export async function requireAdminSection(
  section: string,
  options?: { fallback?: string }
): Promise<GuardContext> {
  const guard = await requirePageAdmin();
  if (!canAccessAdminSection(guard.user.role, section)) {
    redirect(options?.fallback ?? "/admin/dashboard");
  }
  return guard;
}

/**
 * Soft KYC gate for deposit / withdrawal pages.
 */
export async function requireApprovedKyc(
  options?: { strict?: boolean }
): Promise<GuardContext> {
  const guard = await requirePageSession();
  const status = guard.user.kycStatus;

  if (status === "NOT_SUBMITTED" || status === "DECLINED") {
    redirect("/profile?kyc=required");
  }

  if (options?.strict && status === "PENDING") {
    redirect("/dashboard?kyc=pending");
  }

  return guard;
}
