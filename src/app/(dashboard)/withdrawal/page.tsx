"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WithdrawalPage() {
  const [amount, setAmount] = useState("");
  const [crypto, setCrypto] = useState("");
  const [network, setNetwork] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: create withdrawal request → PENDING
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-4 py-12">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold">
          Withdrawal Requested
        </h1>
        <p className="text-foreground-muted text-sm">
          Your withdrawal is <span className="text-gold">PENDING</span> admin
          review. You will be notified once it is processed.
        </p>
        <Button variant="secondary" onClick={() => setSubmitted(false)}>
          Request another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          Withdrawal
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Request a crypto withdrawal from your available balance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-premium p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            Amount
          </label>
          <input
            type="number"
            min="0"
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
            Cryptocurrency
          </label>
          <select
            required
            value={crypto}
            onChange={(e) => setCrypto(e.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            <option value="USDT">USDT</option>
            <option value="BTC">BTC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            Network
          </label>
          <select
            required
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            <option value="TRC20">TRC20</option>
            <option value="ERC20">ERC20</option>
            <option value="BEP20">BEP20</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            Destination wallet address
          </label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={cn(inputClass, "font-mono text-sm")}
            placeholder="Enter wallet address"
          />
        </div>

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Submit Withdrawal Request
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
