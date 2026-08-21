import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isAdminPath,
  isAuthPath,
  isProtectedApiPath,
  isProtectedPath,
  isAdminApiPath,
} from "@/lib/auth/paths";

/**
 * Edge middleware — first gate.
 *
 * Validates presence of the session cookie only (opaque token lives in Postgres;
 * full Session lookup runs in Node via layout guards / API requireUser).
 *
 * Cookie name must match SESSION_COOKIE in src/lib/auth/session.ts
 */
const SESSION_COOKIE = "thesoros_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasSession = Boolean(token && token.length > 16);

  // --- Protected page routes ---
  if (isProtectedPath(pathname) || isAdminPath(pathname)) {
    if (!hasSession) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  // --- Auth pages: send logged-in users away ---
  if (isAuthPath(pathname) && hasSession) {
    // verify-otp is part of login flow — allow even with a stale cookie cleared later
    if (pathname.startsWith("/verify-otp")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // --- Protected APIs: require cookie (APIs still do full auth) ---
  if (isProtectedApiPath(pathname) || isAdminApiPath(pathname)) {
    if (!hasSession) {
      return NextResponse.json(
        { success: false, error: "Authentication required", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
