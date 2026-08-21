import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { requireUser } from "@/lib/auth/require";
import { jsonOk, jsonError } from "@/lib/api";
import { getEnv } from "@/lib/env";
import { rateLimitUpload } from "@/lib/rate-limit";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * POST /api/uploads
 * multipart form field: "file"
 * Returns { url } suitable for proofUrl / KYC fileUrl.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimitUpload(auth.ctx.user.id, ip);
  if (!rl.allowed) {
    return jsonError("Upload rate limit exceeded. Try again shortly.", 429, {
      code: "RATE_LIMITED",
      retryAfterMs: rl.retryAfterMs,
    });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || typeof file === "string") {
      return jsonError("file field is required", 400);
    }

    const blob = file as File;
    if (!ALLOWED_MIME.has(blob.type)) {
      return jsonError(
        "Unsupported file type. Use JPEG, PNG, WebP, GIF, or PDF.",
        400
      );
    }

    if (blob.size > MAX_BYTES) {
      return jsonError("File too large (max 8 MB)", 400);
    }

    const env = getEnv();
    const ext =
      blob.type === "application/pdf"
        ? "pdf"
        : blob.type.split("/")[1]?.replace("jpeg", "jpg") || "bin";
    const name = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
    const dir = path.join(process.cwd(), "public", env.uploadDir);
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const diskPath = path.join(dir, name);
    await writeFile(diskPath, buffer);

    const url = `/${env.uploadDir}/${name}`;

    return jsonOk(
      {
        url,
        fileName: blob.name,
        mimeType: blob.type,
        size: blob.size,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[uploads]", err);
    return jsonError("Upload failed", 500);
  }
}
