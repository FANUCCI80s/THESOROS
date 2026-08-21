"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiPost, loadChallenge, clearChallenge } from "@/lib/auth/client";

const baseInputClass =
  "w-full rounded-xl border bg-black/40 px-3.5 py-2.5 sm:py-3 text-sm sm:text-base text-[#f4efe4] placeholder:text-white/35 outline-none transition-colors backdrop-blur-sm min-h-[44px] tracking-[0.35em] text-center font-medium";
const inputOk =
  "border-white/15 focus:border-[#d7a94b] focus:ring-1 focus:ring-[#d7a94b]";
const inputErr =
  "border-red-400/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/50";

const BG_FALLBACKS = [
  "/Background.jpg",
  "/background.jpg",
  "/Background-Tablet.jpg",
  "/Background-Mobile.jpg",
];

function VerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState("/Logo.png");
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    const id = getStoredChallenge();
    if (!id) {
      router.replace("/login");
      return;
    }
    setChallengeId(id);
    // Clear any leftover debug OTP from older builds
    try {
      sessionStorage.removeItem("thesoros_debug_otp");
    } catch {
      /* ignore */
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!challengeId) {
      setError("Session expired. Please log in again.");
      return;
    }
    const trimmed = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(trimmed)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiPost<{
        redirectTo?: string;
        message?: string;
      }>("/api/auth/verify-otp", {
        challengeId,
        code: trimmed,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      clearChallenge();
      router.push(result.redirectTo || "/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!challengeId) return;
    setError("");
    setInfo("");
    setIsResending(true);
    try {
      const result = await apiPost<{
        challengeId?: string;
        message?: string;
      }>("/api/auth/resend-otp", { challengeId });

      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.challengeId) {
        try {
          sessionStorage.setItem("thesoros_challenge", result.challengeId);
        } catch {
          /* ignore */
        }
        setChallengeId(result.challengeId);
      }
      setInfo("A new code was sent to your email.");
      setCode("");
    } catch {
      setError("Could not resend code. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
        {!logoFailed && (
          <Link href="/" className="inline-flex">
            <Image
              src={logoSrc}
              alt="THÉSOROS"
              width={200}
              height={64}
              className="h-10 w-auto sm:h-12 object-contain"
              priority
              onError={() => {
                if (logoSrc === "/Logo.png") setLogoSrc("/logo.png");
                else setLogoFailed(true);
              }}
            />
          </Link>
        )}
        <h1 className="mt-5 sm:mt-6 font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold text-[#f4efe4]">
          Check your email
        </h1>
        <p className="mt-2 text-sm sm:text-base text-white/60 px-2">
          Enter the 6-digit verification code we sent you.
        </p>
      </div>

      {info && (
        <p
          role="status"
          className="mb-4 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2.5 text-center"
        >
          {info}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-white/65 mb-1.5 text-center"
          >
            Verification code
          </label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            className={`${baseInputClass} ${error ? inputErr : inputOk}`}
            placeholder="••••••"
            aria-invalid={Boolean(error)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5 text-center"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full rounded-xl min-h-[48px]"
          isLoading={isLoading}
        >
          Verify
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-[#d7a94b] hover:text-[#e8c547] disabled:opacity-50"
        >
          {isResending ? "Sending…" : "Resend code"}
        </button>
        <p className="text-sm text-white/45">
          <Link href="/login" className="text-white/60 hover:text-[#d7a94b]">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  const [bgFailed, setBgFailed] = useState(false);

  const onBgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const current = img.getAttribute("src") || "";
    const idx = BG_FALLBACKS.indexOf(current);
    const next = idx >= 0 ? BG_FALLBACKS[idx + 1] : undefined;
    if (next) {
      img.src = next;
      return;
    }
    setBgFailed(true);
    img.style.display = "none";
  };

  return (
    <div className="relative min-h-[100svh] min-h-[100dvh] flex flex-col bg-[#050505]">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {!bgFailed && (
          <picture>
            <source
              media="(max-width: 767px)"
              type="image/jpeg"
              srcSet="/Background-Mobile.jpg"
            />
            <source
              media="(min-width: 768px) and (max-width: 1023px)"
              type="image/jpeg"
              srcSet="/Background-Tablet.jpg"
            />
            <source
              media="(min-width: 1024px)"
              type="image/jpeg"
              srcSet="/Background.jpg"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Background.jpg"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              onError={onBgError}
            />
          </picture>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/90" />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-[#d7a94b]/25 bg-black/55 backdrop-blur-xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.45)]">
          <Suspense
            fallback={
              <div className="text-center text-white/50 text-sm py-12">
                Loading…
              </div>
            }
          >
            <VerifyForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
