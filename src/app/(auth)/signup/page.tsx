"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/auth/client";
import { signupSchema } from "@/lib/validations/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrengthMeter } from "@/components/ui/password-strength";

const baseInputClass =
  "w-full rounded-xl border bg-black/40 px-3.5 py-2.5 sm:py-3 text-sm sm:text-base text-[#f4efe4] placeholder:text-white/35 outline-none transition-colors backdrop-blur-sm min-h-[44px]";
const inputOk =
  "border-white/15 focus:border-[#d7a94b] focus:ring-1 focus:ring-[#d7a94b]";
const inputErr =
  "border-red-400/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/50";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function validateSignup(form: FormState):
  | { ok: true; data: FormState }
  | { ok: false; fields: FieldErrors } {
  const result = signupSchema.safeParse({
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    password: form.password,
    confirmPassword: form.confirmPassword,
  });
  if (result.success) {
    return {
      ok: true,
      data: {
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        email: result.data.email,
        password: result.data.password,
        confirmPassword: result.data.confirmPassword ?? result.data.password,
      },
    };
  }
  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (
      key === "firstName" ||
      key === "lastName" ||
      key === "email" ||
      key === "password" ||
      key === "confirmPassword"
    ) {
      if (!fields[key]) fields[key] = issue.message;
    }
  }
  return { ok: false, fields };
}

const BG_FALLBACKS = [
  "/background.jpg",
  "/background.jpg",
  "/background-tablet.jpg",
  "/background-mobile.jpg",
  "/background-tablet.jpg",
  "/background-mobile.jpg",
  "/background-tablet.jpg",
  "/background-mobile.jpg",
  "/background-tablet.jpg",
  "/background-mobile.jpg",
  "/background-tablet.jpg",
  "/background-mobile.jpg",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logoSrc, setLogoSrc] = useState("/Logo.png");
  const [logoFailed, setLogoFailed] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    if (name in form) {
      setFieldErrors((prev) => {
        if (!prev[name as keyof FieldErrors]) return prev;
        const next = { ...prev };
        delete next[name as keyof FieldErrors];
        return next;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof FormState;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const result = validateSignup(form);
    if (!result.ok && result.fields[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: result.fields[name as keyof FieldErrors],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    const parsed = validateSignup(form);
    if (!parsed.ok) {
      setFieldErrors(parsed.fields);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);
    try {
      const result = await apiPost<{ message: string }>("/api/auth/signup", {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        password: parsed.data.password,
        confirmPassword: parsed.data.confirmPassword,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/login?registered=1");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onBgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const current = img.getAttribute("src") || "";
    const idx = BG_FALLBACKS.indexOf(current);
    const next = idx >= 0 ? BG_FALLBACKS[idx + 1] : BG_FALLBACKS[0];
    if (next) {
      img.src = next;
      return;
    }
    setBgFailed(true);
    img.style.display = "none";
  };

  const invalid = (key: keyof FieldErrors) =>
    Boolean(touched[key] && fieldErrors[key]);

  return (
    <div className="relative min-h-[100svh] min-h-[100dvh] flex flex-col bg-[#050505]">
      {/* Responsive backgrounds via <picture> */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {!bgFailed && (
          <picture>
            <source
              media="(max-width: 767px)"
              type="image/avif"
              srcSet="/Background-Mobile.avif"
            />
            <source
              media="(max-width: 767px)"
              type="image/webp"
              srcSet="/Background-Mobile.webp 800w"
              sizes="100vw"
            />
            <source
              media="(max-width: 767px)"
              type="image/jpeg"
              srcSet="/Background-Mobile.jpg 800w, /background-mobile.jpg 800w"
              sizes="100vw"
            />
            <source
              media="(min-width: 768px) and (max-width: 1023px)"
              type="image/avif"
              srcSet="/Background-Tablet.avif"
            />
            <source
              media="(min-width: 768px) and (max-width: 1023px)"
              type="image/webp"
              srcSet="/Background-Tablet.webp 1280w"
              sizes="100vw"
            />
            <source
              media="(min-width: 768px) and (max-width: 1023px)"
              type="image/jpeg"
              srcSet="/Background-Tablet.jpg 1280w, /background-tablet.jpg 1280w"
              sizes="100vw"
            />
            <source
              media="(min-width: 1024px)"
              type="image/avif"
              srcSet="/Background.avif"
            />
            <source
              media="(min-width: 1024px)"
              type="image/webp"
              srcSet="/Background.webp 1920w"
              sizes="100vw"
            />
            <source
              media="(min-width: 1024px)"
              type="image/jpeg"
              srcSet="/Background.jpg 1920w, /background.jpg 1920w"
              sizes="100vw"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Background.jpg"
              alt=""
              width={1920}
              height={1080}
              sizes="100vw"
              fetchPriority="high"
              decoding="async"
              onError={onBgError}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </picture>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/90 md:bg-none md:[background:linear-gradient(105deg,rgba(5,5,5,0.94)_0%,rgba(5,5,5,0.82)_42%,rgba(5,5,5,0.55)_70%,rgba(5,5,5,0.75)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45" />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="w-full max-w-[24rem] sm:max-w-md rounded-2xl border border-[#d7a94b]/25 bg-black/55 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.45)] p-5 sm:p-7 md:p-8">
          <div className="mb-6 sm:mb-8 flex flex-col items-center text-center">
            {!logoFailed && (
              <Link href="/" className="inline-flex items-center justify-center">
                <Image
                  src={logoSrc}
                  alt="THÉSOROS"
                  width={200}
                  height={64}
                  className="h-10 w-auto sm:h-12 object-contain"
                  priority
                  sizes="(max-width: 640px) 140px, 200px"
                  onError={() => {
                    if (logoSrc === "/Logo.png") setLogoSrc("/logo.png");
                    else if (logoSrc === "/logo.png") setLogoSrc("/Logo.webp");
                    else setLogoFailed(true);
                  }}
                />
              </Link>
            )}
            <h1 className="mt-5 sm:mt-6 font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold text-[#f4efe4]">
              Create Account
            </h1>
            <p className="mt-2 text-sm sm:text-base text-white/60 px-2">
              Join THÉSOROS and begin your wealth journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-white/65 mb-1.5"
                >
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={invalid("firstName")}
                  className={`${baseInputClass} ${invalid("firstName") ? inputErr : inputOk}`}
                  placeholder="John"
                />
                {invalid("firstName") && (
                  <p role="alert" className="mt-1.5 text-xs text-red-400">
                    {fieldErrors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-white/65 mb-1.5"
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={invalid("lastName")}
                  className={`${baseInputClass} ${invalid("lastName") ? inputErr : inputOk}`}
                  placeholder="Doe"
                />
                {invalid("lastName") && (
                  <p role="alert" className="mt-1.5 text-xs text-red-400">
                    {fieldErrors.lastName}
                  </p>
                )}
              </div>
            </div>

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
                aria-invalid={invalid("email")}
                className={`${baseInputClass} ${invalid("email") ? inputErr : inputOk}`}
                placeholder="you@example.com"
              />
              {invalid("email") && (
                <p role="alert" className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/65 mb-1.5"
              >
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={invalid("password")}
                className={`${baseInputClass} ${invalid("password") ? inputErr : inputOk}`}
                placeholder="Min. 8 characters"
              />
              <PasswordStrengthMeter password={form.password} />
              {invalid("password") && (
                <p role="alert" className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-white/65 mb-1.5"
              >
                Confirm password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={invalid("confirmPassword")}
                className={`${baseInputClass} ${invalid("confirmPassword") ? inputErr : inputOk}`}
                placeholder="Repeat password"
              />
              {invalid("confirmPassword") && (
                <p role="alert" className="mt-1.5 text-xs text-red-400">
                  {fieldErrors.confirmPassword}
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
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/55">
            Already have an account?{" "}
            <Link href="/login" className="text-[#d7a94b] hover:text-[#e8c547]">
              Log in
            </Link>
          </p>
        </div>
      </main>

      <footer className="relative z-10 py-4 sm:py-5 text-center text-[10px] sm:text-xs text-white/35 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        © {new Date().getFullYear()} THÉSOROS. All rights reserved.
      </footer>
    </div>
  );
}
