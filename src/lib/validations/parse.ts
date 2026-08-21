import type { ZodSchema, ZodError } from "zod";
import { zodErrorResponse } from "@/lib/api";

/**
 * Parse a value with a Zod schema.
 * Returns { success: true, data } or { success: false, response } ready for Next.js.
 */
export function parseBody<T>(
  schema: ZodSchema<T>,
  body: unknown
):
  | { success: true; data: T }
  | { success: false; response: ReturnType<typeof zodErrorResponse> } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false, response: zodErrorResponse(result.error) };
  }
  return { success: true, data: result.data };
}

/**
 * Parse URL search params into a typed object.
 */
export function parseSearchParams<T>(
  schema: ZodSchema<T>,
  searchParams: URLSearchParams
):
  | { success: true; data: T }
  | { success: false; response: ReturnType<typeof zodErrorResponse> } {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  return parseBody(schema, raw);
}

export function formatZodError(error: ZodError): string {
  const issues = error.flatten();
  return (
    issues.formErrors[0] ||
    Object.values(issues.fieldErrors).flat()[0] ||
    "Validation failed"
  );
}
