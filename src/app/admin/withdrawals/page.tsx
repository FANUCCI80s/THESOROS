"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertTriangle, Copy, Check } from "lucide-react";

const mockWithdrawals = [
  {
    id: "w1",
    user: "sam.rivera@domain.io",
    amount: 3200,
    crypto: "USDT",
    network: "TRC20",
    destination: "TDest123ExampleWalletAddressXYZ",
    status: "PENDING",
    createdAt: "2026-08-17 15:20",
  },
  {
    id: "w2",
    user: "alex@example.com",
    amount: 1500,
    crypto: "USDT",
    network: "ERC20",
    destination: "0xDest456ExampleEthereumAddress",
    status: "PENDING",
    createdAt: "2026-08-17 12:05",
  },
  {
    id: "w3",
    user: "m.chen@email.com",
    amount: 8000,
    crypto: "BTC",
    network: "Bitcoin",
    destination: "bc1qexampledestinationaddress",
    status: "APPROVED",
    createdAt: "2026-08-14 10:00",
    txHash: "abc123…txid",
  },
];

export default function AdminWithdrawalsPage() {
  const [filter, setFilter] = useState<"PENDING" | "ALL" | "APPROVED" | "DECLINED">("PENDING");
  const [selected, setSelected] = useState<typeof mockWithdrawals[0] | null>(null);
  const [txHash, setTxHash] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const list = mockWithdrawals.filter(
    (w) => filter === "ALL" || w.status === filter
  );

  const handleCopy = async () => {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.destination);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = async (action: "APPROVE" | "DECLINE") => {
    if (!selected) return;
    setLoading(true);
    // TODO: API → debit Available Balance + Transaction on APPROVE
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSelected(null);
    setTxHash("");
    setNote("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          Withdrawals
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Review and process crypto withdrawal requests. Approval debits available balance and records the transaction.
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
                ({mockWithdrawals.filter((w) => w.status === "PENDING").length})
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
                setTxHash("");
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
              <p className="mt-2 text-xs text-foreground-subtle">
                {item.crypto} · {item.network}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground-subtle">
                {item.createdAt}
              </p>
            </button>
          ))}
          {list.length === 0 && (
            <div className="card-premium px-5 py-10 text-center text-sm text-foreground-muted">
              No withdrawals in this filter.
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <div className="card-premium p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-semibold text-foreground">
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
                  <p className="text-xs text-foreground-subtle">Asset</p>
                  <p className="text-foreground">
                    {selected.crypto} · {selected.network}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-foreground-subtle">Requested</p>
                  <p className="text-foreground">{selected.createdAt}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-foreground-subtle mb-1.5">
                  Destination wallet
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={selected.destination}
                    className={cn(
                      "flex-1 h-10 rounded-lg border border-border bg-background-card px-3 font-mono text-xs text-foreground outline-none"
                    )}
                  />
                  <Button variant="secondary" size="md" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {selected.txHash && (
                <div>
                  <p className="text-xs text-foreground-subtle">Tx Hash</p>
                  <p className="font-mono text-xs text-foreground">{selected.txHash}</p>
                </div>
              )}

              {selected.status === "PENDING" && (
                <div className="border-t border-border pt-5 space-y-4">
                  <div className="flex gap-3 rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground-muted leading-relaxed">
                      Approving will debit the user&apos;s Available Balance and
                      create a WITHDRAWAL transaction. Ensure the on-chain
                      transfer has been (or will be) completed.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-foreground-subtle mb-1.5">
                      Blockchain Tx Hash (optional)
                    </label>
                    <input
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      className={cn(
                        "w-full h-10 rounded-lg border border-border bg-background-card px-3 font-mono text-sm text-foreground",
                        "focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                      )}
                      placeholder="Paste tx hash after sending"
                    />
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
                      Approve & Debit
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
              <p className="text-sm">Select a withdrawal to review</p>
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
    PROCESSING: "bg-info/15 text-info",
    COMPLETED: "bg-success/15 text-success",
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
