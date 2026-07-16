"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";

function AuthBrandLogo() {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-300/80 bg-white/50 px-4 py-1.5 shadow-sm backdrop-blur-sm">
      <span className="text-sm font-semibold tracking-wide text-slate-800">Crextio</span>
    </div>
  );
}

function SoftInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-full border border-slate-200/80 bg-white px-5 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#f9df6d]/40"
      />
    </div>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative flex h-full flex-col justify-between bg-gradient-to-br from-[#f3f0e8] via-[#f7f2df] to-[#f9df6d]/35 px-8 py-10 sm:px-12 lg:px-14">
      <div>
        <AuthBrandLogo />

        <div className="mt-14 max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl">
            Sign in
          </h1>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Welcome back — sign in to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 max-w-md space-y-5">
          <SoftInput
            id="email"
            label="Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={setEmail}
          />

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-600">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-full border border-slate-200/80 bg-white px-5 pr-12 text-sm text-slate-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-[#f9df6d]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 h-12 w-full rounded-2xl bg-brand-accent text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-[#f9df6d]/60 focus:ring-offset-2"
          >
            Submit
          </button>

          <SocialAuthButtons />
        </form>
      </div>

      <div className="mt-10 flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="#" className="font-medium text-slate-700 underline underline-offset-4">
            Sign up
          </Link>
        </p>
        <Link href="#" className="font-medium text-slate-700 underline underline-offset-4">
          Terms &amp; Conditions
        </Link>
      </div>
    </div>
  );
}
