"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiPost, storeChallenge } from "@/lib/auth/client";
import { loginSchema } from "@/lib/validations/auth";
import { PasswordInput } from "@/components/ui/password-input";

const baseInputClass =
  "w-full rounded-xl border bg-black/40 px-3.5 py-2.5 sm:py-3 text-sm sm:text-base text-[#f4efe4] placeholder:text-white/35 outline-none transition-colors backdrop-blur-sm min-h-[44px]";

const inputOk =
  "border-white/15 focus:border-[#d7a94b] focus:ring-1 focus:ring-[#d7a94b]";
const inputErr =
  "border-red-400/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/50";

type FieldErrors = {
  email?: string;
  password?: string;
};

function validateLogin(form: {
  email: string;
  password: string;
}):
  | { ok: true; data: { email: string; password: string } }
  | { ok: false; fields: FieldErrors } {
  const result = loginSchema.safeParse({
    email: form.email.trim(),
    password: form.password,
  });

  if (result.success) {
    return { ok: true, data: result.data };
  }

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key === "email" || key === "password") {
      if (!fields[key]) fields[key] = issue.message;
    }
  }
  return { ok: false, fields };
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "1";
  const resetDone = searchParams.get("reset") === "1";
  const resetSent = searchParams.get("reset") === "sent";

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    registered
      ? "Account created. Please log in."
      : resetDone
        ? "Password updated. Please log in."
        : resetSent
          ? "If that email exists, a reset code was sent."
          : ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/Logo.png");
  const [logoHidden, setLogoHidden] = useState(false);
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  const clearServerError = () => setError("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearServerError();
    if (name === "email" || name === "password") {
      setFieldErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as "email" | "password";
    setTouched((prev) => ({ ...prev, [name]: true }));

    const result = validateLogin(form);
    if (!result.ok && result.fields[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: result.fields[name] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setTouched({ email: true, password: true });

    const parsed = validateLogin(form);
    if (!parsed.ok) {
      setFieldErrors(parsed.fields);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const result = await apiPost<{
        challengeId: string;
        debugCode?: string;
        message: string;
      }>("/api/auth/login", {
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      storeChallenge(result.challengeId);
      if (result.debugCode) {
        sessionStorage.setItem("thesoros_debug_otp", result.debugCode);
      }
      router.push("/verify-otp");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const emailInvalid = Boolean(touched.email && fieldErrors.email);
  const passwordInvalid = Boolean(touched.password && fieldErrors.password);

  return (
    <div className="w-full">
      {/* Single logo — only one on the page */}
      <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
        <Link href="/" className="inline-flex items-center justify-center">
          {!logoHidden && (
            <Image
              src={logoSrc}
              alt="THÉSOROS"
              width={200}
              height={64}
              className="login-logo h-10 w-auto sm:h-12 md:h-14 object-contain"
              priority
              sizes="(max-width: 640px) 140px, 200px"
              onError={() => {
                if (logoSrc === "/Logo.png") setLogoSrc("/logo.png");
                else if (logoSrc === "/logo.png") setLogoSrc("/Logo.webp");
                else setLogoHidden(true);
              }}
            />
          )}
        </Link>
        <h1 className="mt-5 sm:mt-6 font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold text-[#f4efe4]">
          Welcome back
        </h1>
        <p className="mt-2 text-sm sm:text-base text-white/60 px-2">
          Log in to your THÉSOROS account
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

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-5"
        noValidate
      >
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/65 mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={emailInvalid}
            aria-describedby={emailInvalid ? "email-error" : undefined}
            className={`${baseInputClass} ${emailInvalid ? inputErr : inputOk}`}
            placeholder="you@example.com"
          />
          {emailInvalid && (
            <p
              id="email-error"
              role="alert"
              className="mt-1.5 text-xs text-red-400"
            >
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/65"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs sm:text-sm text-[#d7a94b] hover:text-[#e8c547] shrink-0"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={passwordInvalid}
            aria-describedby={passwordInvalid ? "password-error" : undefined}
            className={`${baseInputClass} ${passwordInvalid ? inputErr : inputOk}`}
            placeholder="••••••••"
          />
          {passwordInvalid && (
            <p
              id="password-error"
              role="alert"
              className="mt-1.5 text-xs text-red-400"
            >
              {fieldErrors.password}
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="text-sm text-red-400 bg-red-500/10 border border-red-500/25 rounded-xl px-3 py-2.5"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full rounded-xl min-h-[48px] text-sm sm:text-base"
          isLoading={isLoading}
        >
          Continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/55">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[#d7a94b] hover:text-[#e8c547]">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[100svh] min-h-[100dvh] flex flex-col bg-[#050505]">
      {/*
        Responsive image strategy (background):
        1. Art direction  — different crops per breakpoint (Mobile / Tablet / Desktop)
        2. Format negotiation — AVIF → WebP → JPEG via type= on <source>
        3. Resolution switching — width descriptors in srcSet when variants exist
        4. sizes="100vw" — full-bleed hero/auth background
        5. Lazy vs eager — fetchPriority="high" + decoding="async" for LCP
        6. Color fallback — parent bg-[#050505] if all images fail
      */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <picture className="absolute inset-0 block h-full w-full">
          {/* —— Mobile (max-width: 767px) —— */}
          <source
            media="(max-width: 767px)"
            type="image/avif"
            srcSet="/background-mobile.avif"
          />
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet="
              /background-mobile.webp 800w,
              /background-mobile.webp 1200w
            "
            sizes="100vw"
          />
          <source
            media="(max-width: 767px)"
            type="image/jpeg"
            srcSet="
              /background-mobile.jpg 800w,
              /background-mobile.jpg 1200w
            "
            sizes="100vw"
          />

          {/* —— Tablet (768px – 1023px) —— */}
          <source
            media="(min-width: 768px) and (max-width: 1023px)"
            type="image/avif"
            srcSet="/background-tablet.avif"
          />
          <source
            media="(min-width: 768px) and (max-width: 1023px)"
            type="image/webp"
            srcSet="
              /background-tablet.webp 1024w,
              /background-tablet.webp 1600w
            "
            sizes="100vw"
          />
          <source
            media="(min-width: 768px) and (max-width: 1023px)"
            type="image/jpeg"
            srcSet="
              /background-tablet.jpg 1024w,
              /background-tablet.jpg 1600w
            "
            sizes="100vw"
          />

          {/* —— Desktop (≥ 1024px) —— */}
          <source
            media="(min-width: 1024px)"
            type="image/avif"
            srcSet="/background.avif"
          />
          <source
            media="(min-width: 1024px)"
            type="image/webp"
            srcSet="
              /background.webp 1280w,
              /background.webp 1920w,
              /background.webp 2560w
            "
            sizes="100vw"
          />
          <source
            media="(min-width: 1024px)"
            type="image/jpeg"
            srcSet="
              /background.jpg 1280w,
              /background.jpg 1920w,
              /background.jpg 2560w
            "
            sizes="100vw"
          />

          {/* Final fallback — required child of <picture> */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/background.jpg"
            alt=""
            width={1920}
            height={1080}
            sizes="100vw"
            className="h-full w-full object-cover object-center"
            fetchPriority="high"
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget;
              const chain = [
                "/background.jpg",
                "/background-tablet.jpg",
                "/background-tablet.jpg",
                "/background-mobile.jpg",
                "/background-mobile.jpg",
              ];
              const tried = new Set((img.dataset.tried || "").split(",").filter(Boolean));
              const next = chain.find((src) => !tried.has(src));
              if (next) {
                tried.add(next);
                img.dataset.tried = [...tried].join(",");
                img.src = next;
              } else {
                img.style.opacity = "0";
              }
            }}
          />
        </picture>

        <div className="pointer-events-none absolute inset-0 bg-black/65 sm:bg-black/55" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[24rem] sm:max-w-md rounded-2xl border border-[#d7a94b]/25 bg-black/55 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.45)] p-5 sm:p-7 md:p-8">
          <Suspense
            fallback={
              <div className="text-center text-white/50 text-sm py-12">
                Loading…
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <footer className="relative z-10 py-4 sm:py-5 text-center text-[10px] sm:text-xs text-white/35 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        © {new Date().getFullYear()} THÉSOROS. All rights reserved.
      </footer>
    </div>
  );
}
