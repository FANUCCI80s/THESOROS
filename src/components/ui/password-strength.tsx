"use client";

function scorePassword(password: string): number {
  if (!password) return 0;
  let s = 0;
  if (password.length >= 8) s++;
  if (password.length >= 12) s++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) s++;
  if (/\d/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return Math.min(4, s);
}

const LABELS = ["", "Weak", "Fair", "Good", "Strong"] as const;
const COLORS = [
  "",
  "bg-red-500",
  "bg-orange-400",
  "bg-[#d7a94b]",
  "bg-emerald-500",
] as const;

export function PasswordStrengthMeter({ password }: { password: string }) {
  const score = scorePassword(password);
  if (!password) return null;

  const hints: string[] = [];
  if (password.length < 8) hints.push("At least 8 characters");
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    hints.push("Upper & lower case");
  }
  if (!/\d/.test(password)) hints.push("Add a number");
  if (!/[^A-Za-z0-9]/.test(password)) hints.push("Add a symbol");

  return (
    <div
      className="mt-2 space-y-1.5"
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={4}
      aria-label={`Password strength: ${LABELS[score]}`}
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? COLORS[score] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className="text-[11px] text-white/50">
        <span className={score >= 3 ? "text-emerald-400/90" : "text-white/60"}>
          {LABELS[score]}
        </span>
        {hints.length > 0 && score < 4 ? ` · ${hints[0]}` : null}
      </p>
    </div>
  );
}