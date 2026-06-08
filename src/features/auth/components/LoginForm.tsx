"use client";

import { useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

function sanitizeCallbackUrl(url: string): string {
  return url.startsWith("/") && !url.startsWith("//") ? url : "/dashboard";
}

interface Props {
  verified: boolean;
  callbackUrl: string;
}

type AuthErrorCode = "INVALID_CREDENTIALS" | "EMAIL_NOT_VERIFIED" | "ACCOUNT_LOCKED" | null;

// ── Inline SVG icons ───────────────────────────────────────────
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function LoginForm({ verified, callbackUrl }: Props) {
  const router = useRouter();
  const [authError, setAuthError] = useState<AuthErrorCode>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPending, startTransition] = useTransition();
  const oAuthProvider = useAuthStore((s) => s.oAuthProvider);
  const resetOAuthProvider = useAuthStore((s) => s.resetOAuthProvider);
  const setOAuthProvider = useAuthStore((s) => s.setOAuthProvider);
  const safeCallbackUrl = sanitizeCallbackUrl(callbackUrl);

  useEffect(() => { resetOAuthProvider(); }, [resetOAuthProvider]);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(values: LoginInput) {
    setAuthError(null);
    resetOAuthProvider();
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      });
      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") setAuthError("EMAIL_NOT_VERIFIED");
        else if (result.error === "ACCOUNT_LOCKED") setAuthError("ACCOUNT_LOCKED");
        else setAuthError("INVALID_CREDENTIALS");
        return;
      }
      router.push(safeCallbackUrl);
      router.refresh();
    });
  }

  const isDisabled = isPending || oAuthProvider !== null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* ── Status banners ─────────────────────────────────── */}
      {verified && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2.5 rounded-lg">
          ✓ Email verified! You can now sign in.
        </div>
      )}
      {authError === "INVALID_CREDENTIALS" && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
          Invalid email or password. Please try again.
        </div>
      )}
      {authError === "EMAIL_NOT_VERIFIED" && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2.5 rounded-lg space-y-1">
          <p className="font-medium">Email not verified</p>
          <p>Check your inbox or{" "}
            <Link href={`/resend-verification?email=${encodeURIComponent(getValues("email") ?? "")}`} className="underline font-medium hover:text-amber-900">
              resend the verification email →
            </Link>
          </p>
        </div>
      )}
      {authError === "ACCOUNT_LOCKED" && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
          <p className="font-medium">Account temporarily locked</p>
          <p className="mt-0.5">Too many failed attempts. Try again in 15 minutes or{" "}
            <Link href="/forgot-password" className="underline font-medium">reset your password</Link>.
          </p>
        </div>
      )}

      {/* ── Email ───────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <MailIcon />
          </span>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            disabled={isDisabled}
            {...register("email")}
            className={`pl-9 h-11 ${errors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* ── Password ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </Label>
        <PasswordInput
          id="password"
          placeholder="Enter your password"
          disabled={isDisabled}
          leftIcon={<LockIcon />}
          {...register("password")}
          className={`h-11 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* ── Remember me + Forgot password ───────────────────── */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isDisabled}
            className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer disabled:opacity-50"
          />
          <span className="text-sm text-muted-foreground">Remember me</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
          Forgot password?
        </Link>
      </div>

      {/* ── Submit ──────────────────────────────────────────── */}
      <Button type="submit" className="w-full h-11 font-semibold" disabled={isDisabled}>
        {isPending ? <><Spinner /><span className="ml-2">Signing in...</span></> : "Continue preparation"}
      </Button>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-muted-foreground">or continue with</span>
        </div>
      </div>

      {/* ── OAuth — side by side ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 font-medium"
          disabled={isDisabled}
          onClick={() => { setOAuthProvider("google"); signIn("google", { callbackUrl: safeCallbackUrl }); }}
        >
          {oAuthProvider === "google" ? <Spinner /> : <GoogleIcon />}
          {oAuthProvider === "google" ? "Connecting..." : "Google"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 font-medium"
          disabled={isDisabled}
          onClick={() => { setOAuthProvider("github"); signIn("github", { callbackUrl: safeCallbackUrl }); }}
        >
          {oAuthProvider === "github" ? <Spinner /> : <GitHubIcon />}
          {oAuthProvider === "github" ? "Connecting..." : "GitHub"}
        </Button>
      </div>

      {/* ── Sign up link ─────────────────────────────────────── */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}
