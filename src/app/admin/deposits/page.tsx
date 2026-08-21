"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

const mockDeposits = [
  {
    id: "d1",
    user: "alex@example.com",
    method: "MANUAL",
    amount: 5000,
    crypto: "USDT",
    network: "TRC20",
    status: "PENDING",
    proofUrl: "#",
    createdAt: "2026-08-17 18:42",
    walletAddress: "TXyz123…Demo",
  },
  {
    id: "d2",
    user: "sam.rivera@domain.io",
    method: "AUTOMATIC",
    amount: 2500,
    crypto: "USDT",
    network: "BEP20",
    status: "PENDING",
    proofUrl: "#",
    createdAt: "2026-08-17 16:10",
    walletAddress: null,
  },
  {
    id: "d3",
    user: "m.chen@email.com",
    method: "MANUAL",
    amount: 10000,
    crypto: "USDT",
    network: "ERC20",
    status: "APPROVED",
    proofUrl: "#",
    createdAt: "2026-08-16 11:05",
    walletAddress: "0xAbc…123",
  },
  {
    id: "d4",
    user: "jordan.lee@mail.com",
    method: "MANUAL",
    amount: 800,
    crypto: "BTC",
    network: "Bitcoin",
    status: "DECLINED",
    proofUrl: "#",
    createdAt: "2026-08-15 09:30",
    walletAddress: "bc1q…xyz",
    adminNote: "Proof does not match amount",
  },
];

export default function AdminDepositsPage() {
  const [filter, setFilter] = useState<"PENDING" | "ALL" | "APPROVED" | "DECLINED">("PENDING");
  const [selected, setSelected] = useState<typeof mockDeposits[0] | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const list = mockDeposits.filter(
    (d) => filter === "ALL" || d.status === filter
  );

  const handleAction = async (action: "APPROVE" | "DECLINE") => {
    if (!selected) return;
    setLoading(true);
    // TODO: API → create Transaction + update Account.availableBalance on APPROVE
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSelected(null);
    setNote("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          Deposits
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Review manual and automatic deposits. Approval creates the ledger entry and credits available balance.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["PENDING", "APPROVED", "DECLINED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === f
                ? "bg-gold-muted text-gold"
                : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
            )}
          >
            {f}
            {f === "PENDING" && (
              <span className="ml-1.5 text-xs opacity-70">
                ({mockDeposits.filter((d) => d.status === "PENDING").length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-2">
          {list.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelected(item);
                setNote("");
              }}
              className={cn(
                "w-full text-left card-premium p-4 transition-colors",
                selected?.id === item.id
                  ? "border-gold-border bg-gold-muted/30"
                  : "hover:border-gold-border/50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-xs text-foreground-subtle">{item.user}</p>
                </div>
                <StatusPill status={item.status} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-foreground-subtle">
                <span className="rounded bg-background-hover px-1.5 py-0.5">
                  {item.method}
                </span>
                <span>
                  {item.crypto} · {item.network}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-foreground-subtle">
                {item.createdAt}
              </p>
            </button>
          ))}
          {list.length === 0 && (
            <div className="card-premium px-5 py-10 text-center text-sm text-foreground-muted">
              No deposits in this filter.
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="card-premium p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-semibold text-gold">
                    {formatCurrency(selected.amount)}
                  </p>
                  <p className="text-sm text-foreground-muted mt-0.5">
                    {selected.user}
                  </p>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-foreground-subtle">Method</p>
                  <p className="text-foreground">{selected.method}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-subtle">Asset</p>
                  <p className="text-foreground">
                    {selected.crypto} · {selected.network}
                  </p>
                </div>
                {selected.walletAddress && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-foreground-subtle">Wallet shown to user</p>
                    <p className="font-mono text-xs text-foreground break-all">
                      {selected.walletAddress}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-foreground-subtle">Submitted</p>
                  <p className="text-foreground">{selected.createdAt}</p>
                </div>
              </div>

              {selected.adminNote && (
                <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                  Note: {selected.adminNote}
                </div>
              )}

              {/* Proof */}
              <div>
                <p className="text-xs text-foreground-subtle mb-2">Payment proof</p>
                <a
                  href={selected.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background-card px-4 py-3 text-sm text-foreground hover:border-gold-border transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View uploaded proof
                  <ExternalLink className="h-3.5 w-3.5 text-foreground-subtle" />
                </a>
              </div>

              {selected.status === "PENDING" && (
                <div className="border-t border-border pt-5 space-y-4">
                  <div className="flex gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      Approving will create a completed DEPOSIT transaction and
                      credit the user&apos;s Available Balance. This cannot be
                      undone without a compensating adjustment.
                    </p>
                  </div>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    placeholder="Optional admin note…"
                    className={cn(
                      "w-full rounded-lg border border-border bg-background-card px-3 py-2 text-sm text-foreground",
                      "placeholder:text-foreground-subtle focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                    )}
                  />

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="gold"
                      size="md"
                      isLoading={loading}
                      onClick={() => handleAction("APPROVE")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve & Credit
                    </Button>
                    <Button
                      variant="danger"
                      size="md"
                      disabled={loading}
                      onClick={() => handleAction("DECLINE")}
                    >
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-premium flex flex-col items-center justify-center py-20 text-foreground-muted">
              <p className="text-sm">Select a deposit to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-warning/15 text-warning",
    APPROVED: "bg-success/15 text-success",
    DECLINED: "bg-danger/15 text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium shrink-0",
        styles[status] || "bg-foreground-subtle/15 text-foreground-muted"
      )}
    >
      {status}
    </span>
  );
}
