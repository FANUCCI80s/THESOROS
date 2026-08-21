import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 CLI configuration for THÉSOROS + Neon.
 *
 * Prefer DIRECT_URL (non-pooled) for migrate / db push / studio.
 * Fall back to DATABASE_URL so `prisma generate` still works when
 * only the pooled URL is set (e.g. CI typecheck).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
