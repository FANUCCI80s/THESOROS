import { getSessionUser } from "@/lib/auth/session";
import { jsonError } from "@/lib/api";
import {
  hasPermission,
  hasAnyPermission,
  isAdminRole,
  type Permission,
} from "@/lib/auth/rbac";
import type { UserRole } from "@/types";

/**
 * Require an authenticated session.
 */
export async function requireUser() {
  const ctx = await getSessionUser();
  if (!ctx) {
    return { error: jsonError("Authentication required", 401) } as const;
  }
  return { ctx } as const;
}

/**
 * Require ADMIN or SUPER_ADMIN role (admin console access).
 */
export async function requireAdmin() {
  const result = await requireUser();
  if ("error" in result) return result;

  if (!isAdminRole(result.ctx.user.role)) {
    return {
      error: jsonError("Admin access required", 403, {
        code: "FORBIDDEN_ROLE",
      }),
    } as const;
  }

  return result;
}

/**
 * Require SUPER_ADMIN only (e.g. balance adjust, platform settings).
 */
export async function requireSuperAdmin() {
  const result = await requireUser();
  if ("error" in result) return result;

  if (result.ctx.user.role !== "SUPER_ADMIN") {
    return {
      error: jsonError("Super admin access required", 403, {
        code: "FORBIDDEN_ROLE",
      }),
    } as const;
  }

  return result;
}

/**
 * Require a specific permission for the current user's role.
 */
export async function requirePermission(permission: Permission) {
  const result = await requireUser();
  if ("error" in result) return result;

  const role = result.ctx.user.role as UserRole;
  if (!hasPermission(role, permission)) {
    return {
      error: jsonError("You do not have permission for this action", 403, {
        code: "FORBIDDEN_PERMISSION",
        permission,
      }),
    } as const;
  }

  return result;
}

/**
 * Require at least one of the listed permissions.
 */
export async function requireAnyPermission(permissions: Permission[]) {
  const result = await requireUser();
  if ("error" in result) return result;

  const role = result.ctx.user.role as UserRole;
  if (!hasAnyPermission(role, permissions)) {
    return {
      error: jsonError("You do not have permission for this action", 403, {
        code: "FORBIDDEN_PERMISSION",
      }),
    } as const;
  }

  return result;
}
