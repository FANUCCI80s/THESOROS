"use client";

import { useState } from "react";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function PasswordInput({
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className={`w-full pr-12 ${className}`}
      />

      <button
        type="button"
        onClick={() => setShowPassword((value) => !value)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50 transition hover:text-[#d7a94b]"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? "HIDE" : "SHOW"}
      </button>
    </div>
  );
}