"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Coins, Plus, Pencil, Link2 } from "lucide-react";

type Tab = "manual" | "automatic" | "assets";

const mockManual = [
  {
    id: "m1",
    crypto: "USDT",
    network: "TRC20",
    walletAddress: "TXyz123ExampleTronWalletAddress",
    warning: "Send only USDT-TRC20. Other assets will be lost.",
    isActive: true,
  },
  {
    id: "m2",
    crypto: "USDT",
    network: "ERC20",
    walletAddress: "0xAbcExampleEthWalletAddress",
    warning: "Send only USDT-ERC20.",
    isActive: true,
  },
  {
    id: "m3",
    crypto: "BTC",
    network: "Bitcoin",
    walletAddress: "bc1qExampleBitcoinAddress",
    warning: "Send only BTC on the Bitcoin network.",
    isActive: true,
  },
];

const mockAutomatic = [
  {
    id: "a1",
    crypto: "USDT",
    paymentUrl: "https://pay.example-provider.com/thesoros/usdt",
    walletAddress: "TXyz123ExampleTronWalletAddress",
    warning: "Complete payment on the external page, then return and upload proof.",
    isActive: true,
  },
];

const mockAssets = [
  { symbol: "USDT", name: "Tether", networks: ["TRC20", "ERC20", "BEP20"], active: true },
  { symbol: "BTC", name: "Bitcoin", networks: ["Bitcoin"], active: true },
  { symbol: "ETH", name: "Ethereum", networks: ["ERC20"], active: false },
];

export default function AdminCryptoPage() {
  const [tab, setTab] = useState<Tab>("manual");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          Crypto & Payments
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Configure supported assets, networks, and deposit methods. These values are never hardcoded in the frontend.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        {(
          [
            { id: "manual", label: "Manual Deposit Config" },
            { id: "automatic", label: "Automatic Deposit Config" },
            { id: "assets", label: "Assets & Networks" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-gold-muted text-gold border-b-2 border-gold"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "manual" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4" />
              Add Manual Config
            </Button>
          </div>
          <div className="space-y-3">
            {mockManual.map((cfg) => (
              <div key={cfg.id} className="card-premium p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {cfg.crypto}
                      </span>
                      <span className="rounded bg-background-hover px-2 py-0.5 text-xs text-foreground-muted">
                        {cfg.network}
                      </span>
                      {cfg.isActive ? (
                        <span className="text-[11px] text-success">Active</span>
                      ) : (
                        <span className="text-[11px] text-foreground-subtle">Inactive</span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-foreground-muted break-all">
                      {cfg.walletAddress}
                    </p>
                    {cfg.warning && (
                      <p className="text-xs text-foreground-subtle">{cfg.warning}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "automatic" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4" />
              Add Automatic Config
            </Button>
          </div>
          <div className="space-y-3">
            {mockAutomatic.map((cfg) => (
              <div key={cfg.id} className="card-premium p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {cfg.crypto}
                      </span>
                      {cfg.isActive ? (
                        <span className="text-[11px] text-success">Active</span>
                      ) : (
                        <span className="text-[11px] text-foreground-subtle">Inactive</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-foreground-muted">
                      <Link2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{cfg.paymentUrl}</span>
                    </div>
                    {cfg.walletAddress && (
                      <p className="font-mono text-xs text-foreground-subtle break-all">
                        {cfg.walletAddress}
                      </p>
                    )}
                    {cfg.warning && (
                      <p className="text-xs text-foreground-subtle">{cfg.warning}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground-subtle">
            When a user clicks <strong className="text-foreground-muted">PAY NOW</strong>, the
            configured payment URL opens in a new tab. After payment they return,
            upload proof, and click PAID — the deposit stays PENDING until admin approval.
          </p>
        </div>
      )}

      {tab === "assets" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4" />
              Add Asset
            </Button>
          </div>
          <div className="card-premium overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-foreground-subtle">
                  <th className="px-5 py-3.5 font-medium">Symbol</th>
                  <th className="px-5 py-3.5 font-medium">Name</th>
                  <th className="px-5 py-3.5 font-medium">Networks</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockAssets.map((a) => (
                  <tr key={a.symbol} className="hover:bg-background-hover/40">
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-gold" />
                        {a.symbol}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-foreground-muted">{a.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {a.networks.map((n) => (
                          <span
                            key={n}
                            className="rounded bg-background-hover px-1.5 py-0.5 text-[11px] text-foreground-muted"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-[11px] font-medium",
                          a.active ? "text-success" : "text-foreground-subtle"
                        )}
                      >
                        {a.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
