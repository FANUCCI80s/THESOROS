"use client";

import { useState } from "react";
import { Search, MoreHorizontal, UserCheck, UserX, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

const mockUsers = [
  {
    id: "1",
    name: "Alex Morgan",
    email: "alex@example.com",
    role: "USER",
    status: "ACTIVE",
    kyc: "APPROVED",
    available: 12500,
    invested: 45000,
    joined: "2026-03-12",
  },
  {
    id: "2",
    name: "Jordan Lee",
    email: "jordan.lee@mail.com",
    role: "USER",
    status: "ACTIVE",
    kyc: "PENDING",
    available: 0,
    invested: 0,
    joined: "2026-08-10",
  },
  {
    id: "3",
    name: "Sam Rivera",
    email: "sam.rivera@domain.io",
    role: "USER",
    status: "ACTIVE",
    kyc: "APPROVED",
    available: 8200,
    invested: 15000,
    joined: "2026-05-22",
  },
  {
    id: "4",
    name: "Priya Nair",
    email: "priya.n@example.com",
    role: "USER",
    status: "SUSPENDED",
    kyc: "DECLINED",
    available: 500,
    invested: 0,
    joined: "2026-07-01",
  },
  {
    id: "5",
    name: "Admin User",
    email: "admin@thesoros.com",
    role: "ADMIN",
    status: "ACTIVE",
    kyc: "APPROVED",
    available: 0,
    invested: 0,
    joined: "2026-01-15",
  },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = mockUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
            Users
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Manage accounts, roles, and status
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={cn(inputClass, "w-full sm:w-40")}
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-premium overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-foreground-subtle">
              <th className="px-5 py-3.5 font-medium">User</th>
              <th className="px-5 py-3.5 font-medium">Role</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">KYC</th>
              <th className="px-5 py-3.5 font-medium text-right">Available</th>
              <th className="px-5 py-3.5 font-medium text-right">Invested</th>
              <th className="px-5 py-3.5 font-medium">Joined</th>
              <th className="px-5 py-3.5 font-medium w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-background-hover/40 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-foreground-subtle">{user.email}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      user.role === "ADMIN" || user.role === "SUPER_ADMIN"
                        ? "bg-gold-muted text-gold"
                        : "bg-foreground-subtle/15 text-foreground-muted"
                    )}
                  >
                    {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
                      <Shield className="h-3 w-3" />
                    )}
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-5 py-3.5">
                  <KycBadge status={user.kyc} />
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-foreground">
                  {formatCurrency(user.available)}
                </td>
                <td className="px-5 py-3.5 text-right font-mono text-foreground-muted">
                  {formatCurrency(user.invested)}
                </td>
                <td className="px-5 py-3.5 text-foreground-subtle text-xs">
                  {user.joined}
                </td>
                <td className="px-5 py-3.5">
                  <button className="rounded-lg p-1.5 text-foreground-subtle hover:bg-background-hover hover:text-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-sm text-foreground-muted">
            No users match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-success/15 text-success",
    SUSPENDED: "bg-warning/15 text-warning",
    BANNED: "bg-danger/15 text-danger",
    PENDING_VERIFICATION: "bg-info/15 text-info",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        styles[status] || "bg-foreground-subtle/15 text-foreground-muted"
      )}
    >
      {status}
    </span>
  );
}

function KycBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-success/15 text-success",
    PENDING: "bg-warning/15 text-warning",
    DECLINED: "bg-danger/15 text-danger",
    NOT_SUBMITTED: "bg-foreground-subtle/15 text-foreground-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        styles[status] || "bg-foreground-subtle/15 text-foreground-muted"
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

const inputClass = cn(
  "h-10 rounded-lg border border-border bg-background-card px-3 text-sm text-foreground",
  "placeholder:text-foreground-subtle",
  "focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
);
