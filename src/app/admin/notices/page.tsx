"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Bell, Send } from "lucide-react";

type Tab = "notices" | "messages";

const mockNotices = [
  {
    id: "n1",
    title: "Scheduled maintenance",
    content: "Platform maintenance on Aug 20, 02:00–04:00 UTC.",
    isActive: true,
    createdAt: "2026-08-15",
  },
  {
    id: "n2",
    title: "New GOLD plan terms",
    content: "Updated return parameters for the GOLD investment plan.",
    isActive: true,
    createdAt: "2026-08-10",
  },
];

export default function AdminNoticesPage() {
  const [tab, setTab] = useState<Tab>("notices");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          Notices & Messages
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Publish platform notices and send direct messages to users
        </p>
      </div>

      <div className="flex gap-2 border-b border-border pb-1">
        <button
          onClick={() => setTab("notices")}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
            tab === "notices"
              ? "bg-gold-muted text-gold border-b-2 border-gold"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          Platform Notices
        </button>
        <button
          onClick={() => setTab("messages")}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
            tab === "messages"
              ? "bg-gold-muted text-gold border-b-2 border-gold"
              : "text-foreground-muted hover:text-foreground"
          )}
        >
          Direct Messages
        </button>
      </div>

      {tab === "notices" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" size="sm">
              <Plus className="h-4 w-4" />
              New Notice
            </Button>
          </div>
          <div className="space-y-3">
            {mockNotices.map((n) => (
              <div key={n.id} className="card-premium p-5">
                <div className="flex items-start gap-3">
                  <Bell className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{n.title}</h3>
                      {n.isActive && (
                        <span className="text-[11px] text-success">Active</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground-muted">{n.content}</p>
                    <p className="mt-2 text-xs text-foreground-subtle">{n.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className="max-w-lg card-premium p-6 space-y-4">
          <h2 className="text-sm font-medium text-foreground-muted">
            Send message to user
          </h2>
          <div>
            <label className="block text-xs text-foreground-subtle mb-1.5">
              User email
            </label>
            <input
              type="email"
              className={inputClass}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-foreground-subtle mb-1.5">
              Title
            </label>
            <input type="text" className={inputClass} placeholder="Message title" />
          </div>
          <div>
            <label className="block text-xs text-foreground-subtle mb-1.5">
              Message
            </label>
            <textarea
              rows={4}
              className={cn(inputClass, "h-auto py-2")}
              placeholder="Write your message…"
            />
          </div>
          <Button variant="gold" size="md">
            <Send className="h-4 w-4" />
            Send Message
          </Button>
          <p className="text-xs text-foreground-subtle">
            The message appears in the user&apos;s dashboard notification area
            (UNREAD → READ).
          </p>
        </div>
      )}
    </div>
  );
}

const inputClass = cn(
  "w-full h-10 rounded-lg border border-border bg-background-card px-3 text-sm text-foreground",
  "placeholder:text-foreground-subtle",
  "focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors"
);
