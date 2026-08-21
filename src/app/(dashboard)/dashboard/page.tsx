import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Placeholder data — will be replaced by real server data later
const mockData = {
  userName: "Alex",
  availableBalance: 12500.0,
  investedBalance: 45000.0,
  portfolioValue: 57500.0,
  investmentStatus: "GOLD" as string | null, // null = NOT INVESTED
  recentActivity: [
    {
      id: "1",
      type: "DEPOSIT",
      amount: 5000,
      status: "APPROVED",
      date: "2026-08-15",
    },
    {
      id: "2",
      type: "INVESTMENT_PURCHASE",
      amount: 20000,
      status: "COMPLETED",
      date: "2026-08-10",
    },
  ],
};

export default function DashboardPage() {
  const {
    userName,
    availableBalance,
    investedBalance,
    portfolioValue,
    investmentStatus,
  } = mockData;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold text-foreground">
          Welcome back, {userName}
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          {investmentStatus
            ? `Active plan: ${investmentStatus}`
            : "No active investment plan"}
        </p>
      </div>

      {/* Balances */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BalanceCard
          title="Available Balance"
          value={availableBalance}
          icon={Wallet}
          accent="gold"
        />
        <BalanceCard
          title="Invested Balance"
          value={investedBalance}
          icon={TrendingUp}
          accent="default"
        />
        <BalanceCard
          title="Portfolio Value"
          value={portfolioValue}
          icon={PieChart}
          accent="default"
        />
      </div>

      {/* Investment Status */}
      <div className="card-premium p-6">
        <h2 className="text-sm font-medium tracking-wider uppercase text-foreground-muted mb-3">
          Investment Status
        </h2>
        {investmentStatus ? (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-gold-muted px-3 py-1 text-sm font-medium text-gold">
              {investmentStatus}
            </span>
            <span className="text-sm text-foreground-muted">
              Plan-based performance is active
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-lg font-medium text-foreground">NOT INVESTED</p>
              <p className="text-sm text-foreground-muted mt-1">
                Choose a plan to start growing your capital.
              </p>
            </div>
            <Button variant="gold" size="md">
              View Plans
            </Button>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/deposit">
          <div className="card-premium p-5 flex items-center gap-4 hover:border-gold-border transition-colors cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gold-muted text-gold">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Deposit</h3>
              <p className="text-sm text-foreground-muted">
                Add crypto to your available balance
              </p>
            </div>
          </div>
        </Link>
        <Link href="/withdrawal">
          <div className="card-premium p-5 flex items-center gap-4 hover:border-gold-border transition-colors cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-background-hover text-foreground-muted">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Withdraw</h3>
              <p className="text-sm text-foreground-muted">
                Request a crypto withdrawal
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

function BalanceCard({
  title,
  value,
  icon: Icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  accent: "gold" | "default";
}) {
  return (
    <div className="card-premium p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-foreground-muted">{title}</span>
        <div
          className={
            accent === "gold"
              ? "text-gold"
              : "text-foreground-subtle"
          }
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p
        className={
          accent === "gold"
            ? "text-2xl font-semibold text-gold"
            : "text-2xl font-semibold text-foreground"
        }
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}
