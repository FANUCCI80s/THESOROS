"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  // Placeholder — will be loaded from session + KYC record
  const user = {
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@example.com",
  };
  const kycStatus = "NOT_SUBMITTED" as
    | "NOT_SUBMITTED"
    | "PENDING"
    | "APPROVED"
    | "DECLINED";

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          Profile
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Account information and KYC verification
        </p>
      </div>

      {/* Personal info */}
      <section className="card-premium p-6 space-y-4">
        <h2 className="text-sm font-medium tracking-wider uppercase text-foreground-muted">
          Personal Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-foreground-subtle">First name</p>
            <p className="text-foreground">{user.firstName}</p>
          </div>
          <div>
            <p className="text-xs text-foreground-subtle">Last name</p>
            <p className="text-foreground">{user.lastName}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-foreground-subtle">Email</p>
            <p className="text-foreground">{user.email}</p>
          </div>
        </div>
      </section>

      {/* KYC */}
      <section className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium tracking-wider uppercase text-foreground-muted">
            KYC Verification
          </h2>
          <StatusBadge status={kycStatus} />
        </div>

        {kycStatus === "NOT_SUBMITTED" && (
          <div className="space-y-4">
            <p className="text-sm text-foreground-muted">
              Complete identity verification to unlock full platform access.
            </p>
            <Button variant="gold" size="md">
              Start KYC
            </Button>
          </div>
        )}

        {kycStatus === "PENDING" && (
          <p className="text-sm text-foreground-muted">
            Your documents are under review. You will be notified once a
            decision is made.
          </p>
        )}

        {kycStatus === "APPROVED" && (
          <p className="text-sm text-success">
            Your identity has been verified. Full access is enabled.
          </p>
        )}

        {kycStatus === "DECLINED" && (
          <div className="space-y-3">
            <p className="text-sm text-danger">
              Verification was declined. Please review the reason and resubmit.
            </p>
            <Button variant="secondary" size="md">
              Resubmit KYC
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "DECLINED";
}) {
  const styles = {
    NOT_SUBMITTED: "bg-foreground-subtle/20 text-foreground-muted",
    PENDING: "bg-warning/15 text-warning",
    APPROVED: "bg-success/15 text-success",
    DECLINED: "bg-danger/15 text-danger",
  };
  const labels = {
    NOT_SUBMITTED: "Not submitted",
    PENDING: "Pending",
    APPROVED: "Approved",
    DECLINED: "Declined",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
