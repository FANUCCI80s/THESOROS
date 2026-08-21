import type { DecimalString } from "./api";

export type UploadResponse = {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export type RateLimitMeta = {
  code?: "RATE_LIMITED";
  retryAfterMs?: number;
  remaining?: number;
  backend?: "redis" | "memory";
};

/** Dashboard financial overview (blueprint) */
export type FinancialOverview = {
  availableBalance: DecimalString;
  investedBalance: DecimalString;
  portfolioValue: DecimalString;
  investmentStatus: "NOT_INVESTED" | string;
  currency: string;
};
