"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  Layers,
  Coins,
  UsersRound,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/kyc", label: "KYC", icon: ShieldCheck },
      { href: "/admin/deposits", label: "Deposits", icon: ArrowDownLeft },
      { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpRight },
      { href: "/admin/balances", label: "Balance Management", icon: Scale },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/plans", label: "Investment Plans", icon: Layers },
      { href: "/admin/crypto", label: "Crypto & Payments", icon: Coins },
      { href: "/admin/team", label: "Team", icon: UsersRound },
      { href: "/admin/notices", label: "Notices & Messages", icon: Bell },
      { href: "/admin/settings", label: "General Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="px-4 py-5 border-b border-border">
        <Link href="/admin/dashboard" className="block">
          <span className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-gold">
            THÉSOROS
          </span>
          <span className="mt-0.5 block text-[10px] font-medium tracking-[0.2em] uppercase text-foreground-subtle">
            Admin Console
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-medium tracking-wider uppercase text-foreground-subtle">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-gold-muted text-gold"
                        : "text-foreground-muted hover:bg-background-hover hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <Link
          href="/dashboard"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-foreground-subtle hover:text-foreground-muted transition-colors"
        >
          ← User dashboard
        </Link>
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted hover:bg-background-hover hover:text-foreground transition-colors"
          onClick={() => {
            window.location.href = "/login";
          }}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-background-card border border-border p-2 text-foreground-muted"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-background-elevated border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
