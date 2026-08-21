"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { AlertTriangle, Scale } from "lucide-react";

export default function AdminBalancesPage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !amount || !reason.trim()) return;
    setLoading(true);
    // TODO: API → Balance adjustment Transaction (BALANCE_ADJUSTMENT) + update Account
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setAmount("");
    setReason("");
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          Balance Management
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Manual adjustments create an auditable BALANCE_ADJUSTMENT transaction.
          Never edit balances without a ledger record.
        </p>
      </div>

      <div className="flex gap-3 rounded-lg border border-warning/25 bg-warning/5 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
        <p className="text-xs text-foreground-muted leading-relaxed">
          Every adjustment is logged with actor, amount, direction, and reason.
          Use this only for corrections, promotions, or authorized credits.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-premium p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            User email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            Direction
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDirection("CREDIT")}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                direction === "CREDIT"
                  ? "border-gold bg-gold-muted text-gold"
                  : "border-border text-foreground-muted hover:border-gold-border"
              )}
            >
              Credit (+)
            </button>
            <button
              type="button"
              onClick={() => setDirection("DEBIT")}
              className={cn(
                "flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors",
                direction === "DEBIT"
                  ? "border-danger/50 bg-danger/10 text-danger"
                  : "border-border text-foreground-muted hover:border-danger/30"
              )}
            >
              Debit (−)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            Amount (USD)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            Reason (required for audit)
          </label>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={cn(
              "w-full rounded-lg border border-border bg-background-card px-3 py-2 text-sm text-foreground",
              "placeholder:text-foreground-subtle focus:border-gold focus:ring-1 focus:ring-gold outline-none"
            )}
            placeholder="Describe why this adjustment is being made…"
          />
        </div>

        {success && (
          <p className="text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2">
            Adjustment recorded successfully.
          </p>
        )}

        <Button
          type="submit"
          variant={direction === "CREDIT" ? "gold" : "danger"}
          size="lg"
          className="w-full"
          isLoading={loading}
        >
          <Scale className="h-4 w-4" />
          {direction === "CREDIT" ? "Credit Balance" : "Debit Balance"}
        </Button>
      </form>
    </div>
  );
}

const inputClass = cn(
  "w-full h-11 rounded-lg border border-border bg-background-card px-3.5 text-sm text-foreground",
  "placeholder:text-foreground-subtle",
  "focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
);
