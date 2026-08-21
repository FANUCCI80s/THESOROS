import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * THÉSOROS Prisma Client (Prisma 7 + Neon via @prisma/adapter-pg)
 *
 * Runtime uses DATABASE_URL (prefer Neon pooled / -pooler hostname).
 * CLI (migrate, db push, studio) uses DIRECT_URL via prisma.config.ts.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env (Neon pooled connection string recommended for the app)."
    );
  }

  // Prisma 7 recommended: pass connectionString to PrismaPg
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
