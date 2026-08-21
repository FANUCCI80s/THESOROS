import { getSessionUser, publicUser } from "@/lib/auth/session";
import { jsonOk, jsonError } from "@/lib/api";

/**
 * GET /api/auth/me
 * Returns the authenticated user from the session cookie.
 */
export async function GET() {
  try {
    const ctx = await getSessionUser();
    if (!ctx) {
      return jsonError("Not authenticated", 401);
    }

    return jsonOk({
      user: publicUser(ctx.user),
    });
  } catch (err) {
    console.error("[auth/me]", err);
    return jsonError("Unable to load session", 500);
  }
}
