import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  deleteSessionByToken,
} from "@/lib/auth/session";
import { jsonOk } from "@/lib/api";

/**
 * POST /api/auth/logout
 * Clears session cookie and deletes server-side session row.
 */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await deleteSessionByToken(token).catch(() => {});
  }

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return jsonOk({ message: "Logged out" });
}
