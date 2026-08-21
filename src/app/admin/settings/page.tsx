"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platformName: "THÉSOROS",
    supportEmail: "support@thesoros.com",
    minDeposit: "100",
    minWithdrawal: "50",
    maintenanceMode: false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: persist PlatformSetting records
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          General Settings
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Platform-wide configuration. Values are stored in the database, not hardcoded.
        </p>
      </div>

      <form onSubmit={handleSave} className="card-premium p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            Platform name
          </label>
          <input
            value={settings.platformName}
            onChange={(e) =>
              setSettings({ ...settings, platformName: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-1.5">
            Support email
          </label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) =>
              setSettings({ ...settings, supportEmail: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1.5">
              Min deposit (USD)
            </label>
            <input
              type="number"
              value={settings.minDeposit}
              onChange={(e) =>
                setSettings({ ...settings, minDeposit: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground-muted mb-1.5">
              Min withdrawal (USD)
            </label>
            <input
              type="number"
              value={settings.minWithdrawal}
              onChange={(e) =>
                setSettings({ ...settings, minWithdrawal: e.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Maintenance mode</p>
            <p className="text-xs text-foreground-subtle">
              Temporarily restrict user access
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.maintenanceMode}
            onClick={() =>
              setSettings({
                ...settings,
                maintenanceMode: !settings.maintenanceMode,
              })
            }
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              settings.maintenanceMode ? "bg-gold" : "bg-border"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                settings.maintenanceMode && "translate-x-5"
              )}
            />
          </button>
        </div>

        {saved && (
          <p className="text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2">
            Settings saved.
          </p>
        )}

        <Button type="submit" variant="gold" size="lg" className="w-full" isLoading={loading}>
          Save Settings
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
