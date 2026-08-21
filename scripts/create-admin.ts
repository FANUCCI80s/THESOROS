/**
 * Create or update the platform admin account.
 *
 *   npx tsx scripts/create-admin.ts
 *
 * Requires DATABASE_URL in .env
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const EMAIL = "admin@thesoros.com"; // stored lowercase (matches login normalize)
const PASSWORD = "4DM1N1$TR4T0R07KANAL";
const DISPLAY_EMAIL = "Admin@thesoros.com";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example → .env and add Neon credentials.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const passwordHash = await bcrypt.hash(PASSWORD, 12);

    const admin = await prisma.user.upsert({
      where: { email: EMAIL },
      update: {
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        firstName: "Platform",
        lastName: "Admin",
      },
      create: {
        email: EMAIL,
        passwordHash,
        firstName: "Platform",
        lastName: "Admin",
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        emailVerified: true,
        account: {
          create: {
            availableBalance: 0,
            investedBalance: 0,
            currency: "USD",
          },
        },
        kyc: {
          create: {
            status: "APPROVED",
            fullName: "Platform Admin",
            submittedAt: new Date(),
            reviewedAt: new Date(),
          },
        },
      },
      include: { account: true, kyc: true },
    });

    // Ensure account + kyc exist if user already existed without them
    if (!admin.account) {
      await prisma.account.create({
        data: {
          userId: admin.id,
          availableBalance: 0,
          investedBalance: 0,
          currency: "USD",
        },
      });
    }
    if (!admin.kyc) {
      await prisma.kyc.create({
        data: {
          userId: admin.id,
          status: "APPROVED",
          fullName: "Platform Admin",
          submittedAt: new Date(),
          reviewedAt: new Date(),
        },
      });
    }

    console.log("✅ Admin account ready");
    console.log(`   Email:    ${DISPLAY_EMAIL}`);
    console.log(`   Login as: ${EMAIL} (or ${DISPLAY_EMAIL} — normalized)`);
    console.log(`   Role:     SUPER_ADMIN`);
    console.log(`   Status:   ACTIVE`);
    console.log(`   KYC:      APPROVED`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
