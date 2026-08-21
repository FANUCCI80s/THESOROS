"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  User,
} from "lucide-react";

const mockSubmissions = [
  {
    id: "kyc1",
    userId: "u2",
    name: "Jordan Lee",
    email: "jordan.lee@mail.com",
    status: "PENDING",
    submittedAt: "2026-08-17 14:22",
    fullName: "Jordan Lee",
    nationality: "United States",
    country: "United States",
    documents: [
      { type: "PASSPORT", fileName: "passport_front.pdf" },
      { type: "PROOF_OF_ADDRESS", fileName: "utility_bill.pdf" },
      { type: "SELFIE", fileName: "selfie.jpg" },
    ],
  },
  {
    id: "kyc2",
    userId: "u6",
    name: "Taylor Kim",
    email: "taylor.k@example.com",
    status: "PENDING",
    submittedAt: "2026-08-16 09:15",
    fullName: "Taylor Kim",
    nationality: "South Korea",
    country: "South Korea",
    documents: [
      { type: "NATIONAL_ID", fileName: "id_card.pdf" },
      { type: "SELFIE", fileName: "selfie_tk.jpg" },
    ],
  },
  {
    id: "kyc3",
    userId: "u4",
    name: "Priya Nair",
    email: "priya.n@example.com",
    status: "DECLINED",
    submittedAt: "2026-07-28 11:40",
    fullName: "Priya Nair",
    nationality: "India",
    country: "India",
    rejectionReason: "Document image quality insufficient",
    documents: [
      { type: "PASSPORT", fileName: "passport_scan.pdf" },
    ],
  },
];

export default function AdminKycPage() {
  const [filter, setFilter] = useState<"PENDING" | "ALL" | "APPROVED" | "DECLINED">("PENDING");
  const [selected, setSelected] = useState<typeof mockSubmissions[0] | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const list = mockSubmissions.filter(
    (s) => filter === "ALL" || s.status === filter
  );

  const handleApprove = async () => {
    if (!selected) return;
    setActionLoading(true);
    // TODO: API call → update Kyc status + AuditLog
    await new Promise((r) => setTimeout(r, 600));
    setActionLoading(false);
    setSelected(null);
  };

  const handleDecline = async () => {
    if (!selected || !declineReason.trim()) return;
    setActionLoading(true);
    // TODO: API call
    await new Promise((r) => setTimeout(r, 600));
    setActionLoading(false);
    setSelected(null);
    setDeclineReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          KYC Review
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Review identity submissions and approve or decline
        </p>
      </div>

      {/* Filter tabs */}
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
                ({mockSubmissions.filter((s) => s.status === "PENDING").length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-2">
          {list.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelected(item);
                setDeclineReason("");
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
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-foreground-subtle">{item.email}</p>
                </div>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-2 text-xs text-foreground-subtle">
                Submitted {item.submittedAt}
              </p>
            </button>
          ))}
          {list.length === 0 && (
            <div className="card-premium px-5 py-10 text-center text-sm text-foreground-muted">
              No submissions in this filter.
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="card-premium p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-medium text-foreground">
                    {selected.fullName}
                  </h2>
                  <p className="text-sm text-foreground-muted">{selected.email}</p>
                </div>
                <StatusPill status={selected.status} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-xs text-foreground-subtle">Nationality</p>
                  <p className="text-foreground">{selected.nationality}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-subtle">Country</p>
                  <p className="text-foreground">{selected.country}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground-subtle">Submitted</p>
                  <p className="text-foreground">{selected.submittedAt}</p>
                </div>
              </div>

              {selected.rejectionReason && (
                <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                  Previous rejection: {selected.rejectionReason}
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="text-sm font-medium text-foreground-muted mb-3">
                  Documents
                </h3>
                <div className="space-y-2">
                  {selected.documents.map((doc) => (
                    <div
                      key={doc.fileName}
                      className="flex items-center justify-between rounded-lg border border-border bg-background-card px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-foreground-subtle" />
                        <div>
                          <p className="text-sm text-foreground">{doc.type.replace(/_/g, " ")}</p>
                          <p className="text-xs text-foreground-subtle">
                            {doc.fileName}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {selected.status === "PENDING" && (
                <div className="border-t border-border pt-5 space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="gold"
                      size="md"
                      isLoading={actionLoading}
                      onClick={handleApprove}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="md"
                      disabled={actionLoading}
                      onClick={() => {
                        // show decline form if not already
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground-subtle mb-1.5">
                      Decline reason (required if declining)
                    </label>
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      rows={2}
                      className={cn(
                        "w-full rounded-lg border border-border bg-background-card px-3 py-2 text-sm text-foreground",
                        "placeholder:text-foreground-subtle focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                      )}
                      placeholder="Provide a clear reason for the user…"
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="mt-2"
                      disabled={!declineReason.trim() || actionLoading}
                      isLoading={actionLoading}
                      onClick={handleDecline}
                    >
                      Confirm Decline
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-premium flex flex-col items-center justify-center py-20 text-foreground-muted">
              <User className="h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">Select a submission to review</p>
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
