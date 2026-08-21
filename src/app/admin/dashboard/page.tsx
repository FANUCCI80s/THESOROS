import Link from "next/link";
import {
  Users,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Placeholder metrics — replace with real aggregates later
const stats = {
  totalUsers: 1284,
  pendingKyc: 17,
  pendingDeposits: 9,
  pendingWithdrawals: 5,
  totalAvailableLiquidity: 2_450_000,
  totalInvested: 8_120_000,
  depositsToday: 42_500,
  withdrawalsToday: 18_200,
};

const recentActivity = [
  {
    id: "1",
    type: "DEPOSIT",
    user: "alex@example.com",
    amount: 5000,
    status: "PENDING",
    time: "12 min ago",
  },
  {
    id: "2",
    type: "KYC",
    user: "jordan.lee@mail.com",
    amount: null,
    status: "PENDING",
    time: "28 min ago",
  },
  {
    id: "3",
    type: "WITHDRAWAL",
    user: "sam.rivera@domain.io",
    amount: 3200,
    status: "PENDING",
    time: "1 hr ago",
  },
  {
    id: "4",
    type: "DEPOSIT",
    user: "m.chen@email.com",
    amount: 10000,
    status: "APPROVED",
    time: "2 hr ago",
  },
  {
    id: "5",
    type: "KYC",
    user: "priya.n@example.com",
    amount: null,
    status: "APPROVED",
    time: "3 hr ago",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold text-foreground">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Operational overview of THÉSOROS
        </p>
      </div>

      {/* Priority action cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PriorityCard
          href="/admin/kyc"
          title="Pending KYC"
          value={stats.pendingKyc}
          icon={ShieldCheck}
          tone="warning"
        />
        <PriorityCard
          href="/admin/deposits"
          title="Pending Deposits"
          value={stats.pendingDeposits}
          icon={ArrowDownLeft}
          tone="warning"
        />
        <PriorityCard
          href="/admin/withdrawals"
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals}
          icon={ArrowUpRight}
          tone="warning"
        />
        <PriorityCard
          href="/admin/users"
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          tone="neutral"
        />
      </div>

      {/* Financial overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Platform Available"
          value={formatCurrency(stats.totalAvailableLiquidity)}
          hint="Sum of user available balances"
        />
        <MetricCard
          label="Total Invested"
          value={formatCurrency(stats.totalInvested)}
          hint="Capital in active plans"
        />
        <MetricCard
          label="Deposits Today"
          value={formatCurrency(stats.depositsToday)}
          hint="Approved volume"
          positive
        />
        <MetricCard
          label="Withdrawals Today"
          value={formatCurrency(stats.withdrawalsToday)}
          hint="Approved volume"
        />
      </div>

      {/* Recent activity + quick links */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-medium tracking-wider uppercase text-foreground-muted">
              Recent Activity
            </h2>
            <Link
              href="/admin/deposits"
              className="text-xs text-gold hover:text-gold-light"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-background-hover/50 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background-hover">
                  {item.type === "DEPOSIT" && (
                    <ArrowDownLeft className="h-4 w-4 text-gold" />
                  )}
                  {item.type === "WITHDRAWAL" && (
                    <ArrowUpRight className="h-4 w-4 text-foreground-muted" />
                  )}
                  {item.type === "KYC" && (
                    <ShieldCheck className="h-4 w-4 text-info" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{item.user}</p>
                  <p className="text-xs text-foreground-subtle">
                    {item.type}
                    {item.amount != null && ` · ${formatCurrency(item.amount)}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <StatusPill status={item.status} />
                  <p className="mt-0.5 text-[11px] text-foreground-subtle">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-premium p-5">
            <h2 className="text-sm font-medium tracking-wider uppercase text-foreground-muted mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <QuickLink href="/admin/kyc" label="Review KYC queue" count={stats.pendingKyc} />
              <QuickLink href="/admin/deposits" label="Review deposits" count={stats.pendingDeposits} />
              <QuickLink href="/admin/withdrawals" label="Review withdrawals" count={stats.pendingWithdrawals} />
              <QuickLink href="/admin/plans" label="Manage investment plans" />
              <QuickLink href="/admin/crypto" label="Crypto & payment config" />
            </div>
          </div>

          <div className="card-premium p-5 border-l-2 border-l-gold/50">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Plan-based performance
                </p>
                <p className="mt-1 text-xs text-foreground-muted leading-relaxed">
                  Investment returns are driven by plan configuration, not live
                  market data. Markets remain a separate viewing experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityCard({
  href,
  title,
  value,
  icon: Icon,
  tone,
}: {
  href: string;
  title: string;
  value: number;
  icon: React.ElementType;
  tone: "warning" | "neutral";
}) {
  return (
    <Link href={href}>
      <div className="card-premium p-5 hover:border-gold-border transition-colors cursor-pointer h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-foreground-muted">{title}</span>
          <Icon
            className={
              tone === "warning" ? "h-4 w-4 text-warning" : "h-4 w-4 text-foreground-subtle"
            }
          />
        </div>
        <p
          className={
            tone === "warning" && value > 0
              ? "text-2xl font-semibold text-warning"
              : "text-2xl font-semibold text-foreground"
          }
        >
          {value}
        </p>
        {tone === "warning" && value > 0 && (
          <p className="mt-1 text-xs text-warning/80 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Requires attention
          </p>
        )}
      </div>
    </Link>
  );
}

function MetricCard({
  label,
  value,
  hint,
  positive,
}: {
  label: string;
  value: string;
  hint: string;
  positive?: boolean;
}) {
  return (
    <div className="card-premium p-5">
      <p className="text-sm text-foreground-muted mb-1">{label}</p>
      <p
        className={
          positive
            ? "text-xl font-semibold text-success"
            : "text-xl font-semibold text-foreground"
        }
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-foreground-subtle">{hint}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-warning/15 text-warning",
    APPROVED: "bg-success/15 text-success",
    DECLINED: "bg-danger/15 text-danger",
    COMPLETED: "bg-success/15 text-success",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
        map[status] || "bg-foreground-subtle/20 text-foreground-muted"
      }`}
    >
      {status}
    </span>
  );
}

function QuickLink({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground-muted hover:bg-background-hover hover:text-foreground transition-colors"
    >
      <span>{label}</span>
      {count != null && count > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warning/20 px-1.5 text-[11px] font-medium text-warning">
          {count}
        </span>
      )}
    </Link>
  );
}
