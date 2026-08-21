/**
 * Ambient / global TypeScript declarations for THÉSOROS.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: "development" | "production" | "test";
    /** Neon pooled connection (app runtime) */
    DATABASE_URL?: string;
    /** Neon direct connection (Prisma CLI) */
    DIRECT_URL?: string;
    /** Public site URL */
    NEXT_PUBLIC_APP_URL?: string;
    /** Optional Redis for multi-instance rate limiting */
    REDIS_URL?: string;
    /** bcrypt cost factor 10–15 */
    BCRYPT_ROUNDS?: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    SMTP_FROM?: string;
    UPLOAD_DIR?: string;
    RATE_LIMIT_WINDOW_MS?: string;
    RATE_LIMIT_MAX?: string;
  }
}

export {};
