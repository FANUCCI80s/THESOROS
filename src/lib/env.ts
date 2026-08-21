/**
 * Production env validation — fail fast on missing secrets.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`
    );
  }
  return value.trim();
}

function optional(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

export type AppEnv = {
  nodeEnv: string;
  isProd: boolean;
  databaseUrl: string;
  directUrl: string;
  appUrl: string;
  /** Optional SMTP / provider for OTP email */
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  uploadDir: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  redisUrl: string;
};

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;

  const nodeEnv = process.env.NODE_ENV || "development";
  const isProd = nodeEnv === "production";

  // In production, DATABASE_URL is mandatory; in dev allow missing until first DB call
  const databaseUrl = isProd
    ? required("DATABASE_URL")
    : optional("DATABASE_URL");
  const directUrl = optional("DIRECT_URL", databaseUrl);

  cached = {
    nodeEnv,
    isProd,
    databaseUrl,
    directUrl,
    appUrl: optional("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    smtpHost: optional("SMTP_HOST"),
    smtpPort: parseInt(optional("SMTP_PORT", "587"), 10) || 587,
    smtpUser: optional("SMTP_USER"),
    smtpPass: optional("SMTP_PASS"),
    smtpFrom: optional("SMTP_FROM", "noreply@thesoros.app"),
    uploadDir: optional("UPLOAD_DIR", "uploads"),
    rateLimitWindowMs: parseInt(optional("RATE_LIMIT_WINDOW_MS", "60000"), 10),
    rateLimitMax: parseInt(optional("RATE_LIMIT_MAX", "60"), 10),
    redisUrl: optional("REDIS_URL"),
  };

  return cached;
}

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== "production") return;
  required("DATABASE_URL");
  optional("DIRECT_URL", required("DATABASE_URL"));
}
