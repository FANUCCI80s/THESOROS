/**
 * Browser-side helpers for auth API calls.
 */

import type { ApiFailure } from "@/types";

export type ApiResult<T extends Record<string, unknown>> =
  | ({ success: true } & T)
  | ApiFailure;

export async function apiPost<T extends Record<string, unknown>>(
  path: string,
  body: unknown
): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok || data.success === false) {
    return {
      success: false,
      error: (data.error as string) || "Request failed",
      fields: data.fields as ApiFailure["fields"],
      code: data.code as string | undefined,
      retryable: data.retryable as boolean | undefined,
      retryAfterMs: data.retryAfterMs as number | undefined,
    };
  }

  return { success: true, ...data } as ApiResult<T>;
}

export async function apiGet<T extends Record<string, unknown>>(
  path: string
): Promise<ApiResult<T>> {
  const res = await fetch(path, {
    method: "GET",
    credentials: "include",
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok || data.success === false) {
    return {
      success: false,
      error: (data.error as string) || "Request failed",
      code: data.code as string | undefined,
    };
  }

  return { success: true, ...data } as ApiResult<T>;
}

const CHALLENGE_KEY = "thesoros_otp_challenge";

export function storeChallenge(challengeId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHALLENGE_KEY, challengeId);
}

export function loadChallenge(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(CHALLENGE_KEY);
}

export function clearChallenge() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CHALLENGE_KEY);
}


