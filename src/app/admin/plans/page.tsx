"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Layers } from "lucide-react";

const mockPlans = [
  {
    id: "p1",
    name: "SILVER",
    minAmount: 1000,
    maxAmount: 9999,
    durationDays: 30,
    returnPercentage: 8,
    status: "ACTIVE",
    sortOrder: 1,
  },
  {
    id: "p2",
    name: "GOLD",
    minAmount: 10000,
    maxAmount: 49999,
    durationDays: 90,
    returnPercentage: 15,
    status: "ACTIVE",
    sortOrder: 2,
  },
  {
    id: "p3",
    name: "PLATINUM",
    minAmount: 50000,
    maxAmount: 249999,
    durationDays: 180,
    returnPercentage: 25,
    status: "ACTIVE",
    sortOrder: 3,
  },
  {
    id: "p4",
    name: "DIAMOND",
    minAmount: 250000,
    maxAmount: null,
    durationDays: 365,
    returnPercentage: 40,
    status: "ACTIVE",
    sortOrder: 4,
  },
  {
    id: "p5",
    name: "STARTER",
    minAmount: 500,
    maxAmount: 999,
    durationDays: 14,
    returnPercentage: 4,
    status: "INACTIVE",
    sortOrder: 0,
  },
];

export default function AdminPlansPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
            Investment Plans
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Admin-defined plans drive all investment performance. Markets are separate.
          </p>
        </div>
        <Button variant="gold" size="md" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          New Plan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockPlans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "card-premium p-5 relative",
              plan.status === "INACTIVE" && "opacity-60"
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-muted text-gold">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{plan.name}</h3>
                  <StatusPill status={plan.status} />
                </div>
              </div>
              <button className="rounded-lg p-1.5 text-foreground-subtle hover:bg-background-hover hover:text-foreground">
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Min investment</span>
                <span className="text-foreground font-medium">
                  {formatCurrency(plan.minAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Max investment</span>
                <span className="text-foreground font-medium">
                  {plan.maxAmount ? formatCurrency(plan.maxAmount) : "Unlimited"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Duration</span>
                <span className="text-foreground font-medium">
                  {plan.durationDays} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Return</span>
                <span className="text-gold font-semibold">
                  {plan.returnPercentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md card-premium p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-foreground">New Investment Plan</h2>
            <PlanForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function PlanForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    minAmount: "",
    maxAmount: "",
    durationDays: "",
    returnPercentage: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: API create InvestmentPlan
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-foreground-subtle mb-1">Plan name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputClass}
          placeholder="e.g. GOLD"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-foreground-subtle mb-1">Min amount</label>
          <input
            type="number"
            required
            value={form.minAmount}
            onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-foreground-subtle mb-1">Max amount</label>
          <input
            type="number"
            value={form.maxAmount}
            onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-foreground-subtle mb-1">Duration (days)</label>
          <input
            type="number"
            required
            value={form.durationDays}
            onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-foreground-subtle mb-1">Return %</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.returnPercentage}
            onChange={(e) => setForm({ ...form, returnPercentage: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-foreground-subtle mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className={cn(inputClass, "h-auto py-2")}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="gold" className="flex-1" isLoading={loading}>
          Create Plan
        </Button>
      </div>
    </form>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
        status === "ACTIVE"
          ? "bg-success/15 text-success"
          : "bg-foreground-subtle/15 text-foreground-muted"
      )}
    >
      {status}
    </span>
  );
}

const inputClass = cn(
  "w-full h-10 rounded-lg border border-border bg-background-card px-3 text-sm text-foreground",
  "placeholder:text-foreground-subtle",
  "focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
);
