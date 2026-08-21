/**
 * Route path helpers for middleware and guards.
 */

/** Must be logged in */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/deposit",
  "/withdrawal",
  "/transactions",
  "/profile",
] as const;

/** Must be ADMIN or SUPER_ADMIN */
export const ADMIN_PREFIXES = ["/admin"] as const;

/** Auth pages — redirect away if already logged in */
export const AUTH_PREFIXES = [
  "/login",
  "/signup",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
] as const;

/** Always public */
export const PUBLIC_PATHS = ["/", "/api/health"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isAdminPath(pathname: string): boolean {
  return ADMIN_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

/** API routes that require a session (not public health/auth entrypoints) */
export function isProtectedApiPath(pathname: string): boolean {
  if (!isApiPath(pathname)) return false;
  if (pathname.startsWith("/api/health")) return false;
  if (pathname.startsWith("/api/auth/signup")) return false;
  if (pathname.startsWith("/api/auth/login")) return false;
  if (pathname.startsWith("/api/auth/verify-otp")) return false;
  if (pathname.startsWith("/api/auth/resend-otp")) return false;
  // logout & me still need cookie handling but can be called without —
  // logout should work with or without; me returns 401
  if (pathname.startsWith("/api/auth/logout")) return false;
  return true;
}

export function isAdminApiPath(pathname: string): boolean {
  return pathname.startsWith("/api/admin/");
}
