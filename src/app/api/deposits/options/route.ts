import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/require";
import { jsonOk, jsonError } from "@/lib/api";

/**
 * GET /api/deposits/options
 * Active cryptocurrencies, networks, and admin-configured manual/automatic deposit options.
 * Nothing is hardcoded — all values come from DB configuration.
 */
export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  try {
    const [cryptocurrencies, manualConfigs, automaticConfigs] =
      await Promise.all([
        prisma.cryptocurrency.findMany({
          where: { isActive: true },
          orderBy: { symbol: "asc" },
          include: {
            networks: {
              where: { status: "ACTIVE" },
              orderBy: { name: "asc" },
              select: {
                id: true,
                name: true,
                chainId: true,
              },
            },
          },
        }),
        prisma.manualDepositConfiguration.findMany({
          where: { isActive: true },
          include: {
            cryptocurrency: { select: { id: true, symbol: true, name: true } },
            network: { select: { id: true, name: true } },
          },
        }),
        prisma.automaticDepositConfiguration.findMany({
          where: { isActive: true },
          include: {
            cryptocurrency: { select: { id: true, symbol: true, name: true } },
            network: { select: { id: true, name: true } },
          },
        }),
      ]);

    return jsonOk({
      cryptocurrencies: cryptocurrencies.map((c) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        networks: c.networks,
      })),
      manual: manualConfigs.map((cfg) => ({
        id: cfg.id,
        cryptocurrencyId: cfg.cryptocurrencyId,
        networkId: cfg.networkId,
        walletAddress: cfg.walletAddress,
        qrCodeUrl: cfg.qrCodeUrl,
        warningMessage: cfg.warningMessage,
        cryptocurrency: cfg.cryptocurrency,
        network: cfg.network,
      })),
      automatic: automaticConfigs.map((cfg) => ({
        id: cfg.id,
        cryptocurrencyId: cfg.cryptocurrencyId,
        networkId: cfg.networkId,
        paymentUrl: cfg.paymentUrl,
        walletAddress: cfg.walletAddress,
        qrCodeUrl: cfg.qrCodeUrl,
        warningMessage: cfg.warningMessage,
        cryptocurrency: cfg.cryptocurrency,
        network: cfg.network,
      })),
    });
  } catch (err) {
    console.error("[deposits/options]", err);
    return jsonError("Unable to load deposit options", 500);
  }
}
