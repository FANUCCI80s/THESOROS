/**
 * THÉSOROS seed script
 *
 * Usage (after db push):
 *   npm run db:seed
 *
 * Seeds a default admin user and sample investment plans.
 * Safe to re-run: uses upsert where possible.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("→ Seeding THÉSOROS…");

  const passwordHash = await bcrypt.hash("4DM1N1$TR4T0R07KANAL", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@thesoros.com" },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    },
    create: {
      email: "admin@thesoros.com",
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
  });
  console.log("  ✓ Admin user:", admin.email);

  const plans = [
    {
      name: "SILVER",
      minAmount: 1000,
      maxAmount: 9999,
      durationDays: 30,
      returnPercentage: 8,
      sortOrder: 1,
      description: "Entry-level plan with steady returns.",
    },
    {
      name: "GOLD",
      minAmount: 10000,
      maxAmount: 49999,
      durationDays: 90,
      returnPercentage: 15,
      sortOrder: 2,
      description: "Balanced growth over a quarterly horizon.",
    },
    {
      name: "PLATINUM",
      minAmount: 50000,
      maxAmount: 249999,
      durationDays: 180,
      returnPercentage: 25,
      sortOrder: 3,
      description: "Higher allocation, longer duration.",
    },
    {
      name: "DIAMOND",
      minAmount: 250000,
      maxAmount: null,
      durationDays: 365,
      returnPercentage: 40,
      sortOrder: 4,
      description: "Premium annual plan.",
    },
  ];

  for (const p of plans) {
    const existing = await prisma.investmentPlan.findFirst({
      where: { name: p.name },
    });
    if (existing) {
      await prisma.investmentPlan.update({
        where: { id: existing.id },
        data: {
          minAmount: p.minAmount,
          maxAmount: p.maxAmount,
          durationDays: p.durationDays,
          returnPercentage: p.returnPercentage,
          sortOrder: p.sortOrder,
          description: p.description,
          status: "ACTIVE",
        },
      });
    } else {
      await prisma.investmentPlan.create({
        data: {
          name: p.name,
          minAmount: p.minAmount,
          maxAmount: p.maxAmount,
          durationDays: p.durationDays,
          returnPercentage: p.returnPercentage,
          sortOrder: p.sortOrder,
          description: p.description,
          status: "ACTIVE",
        },
      });
    }
    console.log("  ✓ Plan:", p.name);
  }

  // Sample crypto assets
  const usdt = await prisma.cryptocurrency.upsert({
    where: { symbol: "USDT" },
    update: { isActive: true },
    create: { symbol: "USDT", name: "Tether", isActive: true },
  });
  const btc = await prisma.cryptocurrency.upsert({
    where: { symbol: "BTC" },
    update: { isActive: true },
    create: { symbol: "BTC", name: "Bitcoin", isActive: true },
  });

  for (const net of ["TRC20", "ERC20", "BEP20"]) {
    await prisma.cryptoNetwork.upsert({
      where: {
        cryptocurrencyId_name: { cryptocurrencyId: usdt.id, name: net },
      },
      update: { status: "ACTIVE" },
      create: {
        cryptocurrencyId: usdt.id,
        name: net,
        status: "ACTIVE",
      },
    });
  }
  await prisma.cryptoNetwork.upsert({
    where: {
      cryptocurrencyId_name: { cryptocurrencyId: btc.id, name: "Bitcoin" },
    },
    update: { status: "ACTIVE" },
    create: {
      cryptocurrencyId: btc.id,
      name: "Bitcoin",
      status: "ACTIVE",
    },
  });
  console.log("  ✓ Cryptocurrencies & networks");

  // Manual deposit wallets (replace with real addresses in production)
  const trc = await prisma.cryptoNetwork.findFirst({
    where: { cryptocurrencyId: usdt.id, name: "TRC20" },
  });
  if (trc) {
    await prisma.manualDepositConfiguration.upsert({
      where: {
        cryptocurrencyId_networkId: {
          cryptocurrencyId: usdt.id,
          networkId: trc.id,
        },
      },
      update: {
        walletAddress: "TXyzReplaceWithRealTronUsdtWallet",
        isActive: true,
        warningMessage:
          "Send only USDT on TRC20. Other assets may be lost permanently.",
      },
      create: {
        cryptocurrencyId: usdt.id,
        networkId: trc.id,
        walletAddress: "TXyzReplaceWithRealTronUsdtWallet",
        isActive: true,
        warningMessage:
          "Send only USDT on TRC20. Other assets may be lost permanently.",
      },
    });
  }

  await prisma.automaticDepositConfiguration.createMany({
    data: [
      {
        cryptocurrencyId: usdt.id,
        networkId: trc?.id,
        paymentUrl: "https://example-payment-provider.com/pay",
        walletAddress: "TXyzReplaceWithRealTronUsdtWallet",
        isActive: true,
        warningMessage:
          "Complete payment externally, then return to upload proof.",
      },
    ],
    skipDuplicates: true,
  }).catch(() => {});

  console.log("  ✓ Deposit configurations (replace wallet addresses!)");

  console.log("\n✅ Seed complete");
  console.log("   Admin login: Admin@thesoros.com / (seed password)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
