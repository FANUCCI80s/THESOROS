import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/require";
import { changePasswordSchema } from "@/lib/validations/auth";
import {
  verifyPassword,
  hashPassword,
} from "@/lib/auth/password";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/api";
import { rateLimitAuth } from "@/lib/rate-limit";
import { clientMeta } from "@/lib/api";

/**
 * POST /api/auth/change-password
 * Requires current password; stores new hash via bcrypt (12 rounds).
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission("account:change_password");
  if ("error" in auth) return auth.error;

  try {
    const { ipAddress } = clientMeta(request);
    const rl = await rateLimitAuth(ipAddress || "unknown", "change-password");
    if (!rl.allowed) {
      return jsonError("Too many attempts. Try again later.", 429, {
        code: "RATE_LIMITED",
        retryAfterMs: rl.retryAfterMs,
      });
    }

    const body = await request.json();
    const data = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: auth.ctx.user.id },
      select: { id: true, passwordHash: true },
    });
    if (!user) return jsonError("User not found", 404);

    const ok = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!ok) {
      return jsonError("Current password is incorrect", 400);
    }

    const passwordHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return jsonOk({ message: "Password updated successfully" });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("[auth/change-password]", err);
    return jsonError("Unable to change password", 500);
  }
}
