import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, ...flatten(data) }, init);
}

export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { success: false, error: message, ...extra },
    { status }
  );
}

function flatten<T>(data: T): T | Record<string, unknown> {
  if (data !== null && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return { data };
}

export function zodErrorResponse(error: ZodError) {
  const issues = error.flatten();
  const first =
    issues.formErrors[0] ||
    Object.values(issues.fieldErrors).flat()[0] ||
    "Validation failed";
  return jsonError(String(first), 400, { fields: issues.fieldErrors });
}

export function clientMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  const userAgent = request.headers.get("user-agent");
  return { ipAddress, userAgent };
}
