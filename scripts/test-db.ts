/**
 * THÉSOROS — Neon + Prisma connection test
 *
 * Usage:
 *   npx tsx scripts/test-db.ts
 *
 * Requires DATABASE_URL in .env
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set in .env");
    process.exit(1);
  }

  // Mask password in logs
  const masked = connectionString.replace(/:([^:@]+)@/, ":****@");
  console.log("→ Connecting with:", masked);
  console.log("→ Adapter: @prisma/adapter-pg (Prisma 7)");

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    // Simple round-trip
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 AS ok`;
    console.log("✅ Query result:", result);

    // Optional: list tables if schema already pushed
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    console.log(`✅ Public tables (${tables.length}):`);
    if (tables.length === 0) {
      console.log("   (none yet — run: npx prisma db push)");
    } else {
      tables.forEach((t) => console.log("  -", t.tablename));
    }

    console.log("\n✅ Neon + Prisma connection OK");
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
