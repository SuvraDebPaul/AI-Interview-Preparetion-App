"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  RegisterInput,
} from "@/features/auth/schemas/auth.schema";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { registerAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { LoaderCircle, Lock, Mail, User } from "lucide-react";

// ── Inline SVG icons ───────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export default function RegisterForm() {
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const oAuthProvider = useAuthStore((s) => s.oAuthProvider);
  const resetOAuthProvider = useAuthStore((s) => s.resetOAuthProvider);
  const setOAuthProvider = useAuthStore((s) => s.setOAuthProvider);

  const isDisabled = isPending || oAuthProvider !== null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onSubmit(values: RegisterInput) {
    setServerError("");
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("email", values.email);
      formData.set("password", values.password);
      formData.set("confirmPassword", values.confirmPassword);
      if (avatarFile) {
        // Convert to base64 data URL so the server action can store it directly
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result as string);
          reader.readAsDataURL(avatarFile);
        });
        formData.set("imageUrl", dataUrl);
      }
      const result = await registerAction(formData);
      if (result.success) setSuccess(result.message);
      else setServerError(result.error);
    });
  }

  // ── Success state ───────────────────────────────────────────
  if (success) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-xl text-foreground">
            Check your email!
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">{success}</p>
        </div>
        <Link
          href="/login"
          className="text-sm text-primary font-semibold hover:underline block"
        >
          Back to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ── Server error ────────────────────────────────────── */}
      {serverError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">
          {serverError}
        </div>
      )}

      {/* ── OAuth — side by side ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 font-medium"
          disabled={isDisabled}
          onClick={() => {
            resetOAuthProvider();
            setOAuthProvider("google");
            signIn("google", { callbackUrl: "/dashboard" });
          }}
        >
          {oAuthProvider === "google" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {oAuthProvider === "google" ? "Connecting..." : "Google"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 gap-2 font-medium"
          disabled={isDisabled}
          onClick={() => {
            resetOAuthProvider();
            setOAuthProvider("github");
            signIn("github", { callbackUrl: "/dashboard" });
          }}
        >
          {oAuthProvider === "github" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <GitHubIcon />
          )}
          {oAuthProvider === "github" ? "Connecting..." : "GitHub"}
        </Button>
      </div>

      {/* ── Divider ─────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-muted-foreground">
            or sign up with
          </span>
        </div>
      </div>

      {/* ── Avatar upload ───────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2 pb-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
          disabled={isDisabled}
        />
        <button
          type="button"
          disabled={isDisabled}
          onClick={() => fileInputRef.current?.click()}
          className="relative w-20 h-20 rounded-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Upload profile photo"
        >
          {avatarPreview ? (
            <Image
              src={avatarPreview}
              alt="Avatar preview"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1 transition-colors group-hover:bg-primary/10 group-hover:border-primary/60">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary/60"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-[9px] font-medium text-primary/60 leading-tight text-center px-1">
                Upload
              </span>
            </div>
          )}

          {avatarPreview && (
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          )}
        </button>
        <div className="flex items-center gap-2 text-center">
          <span className="text-xs text-muted-foreground">Profile photo</span>
          <span className="text-xs text-muted-foreground/60">·</span>
          <span className="text-xs text-muted-foreground/60">Optional</span>
          {avatarPreview && (
            <>
              <span className="text-xs text-muted-foreground/60">·</span>
              <button
                type="button"
                onClick={removeAvatar}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
      {/* ── Full name ───────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium">
          Full name
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <User size={18} />
          </span>
          <Input
            id="name"
            placeholder="Enter your full name"
            disabled={isDisabled}
            {...register("name")}
            className={`pl-9 h-11 ${errors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* ── Email ───────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium">
          Email address
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Mail size={18} />
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
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* ── Password ────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium">
          Password
        </Label>
        <PasswordInput
          id="password"
          placeholder="Create a password"
          disabled={isDisabled}
          leftIcon={<Lock size={18} />}
          {...register("password")}
          className={`h-11 ${errors.password ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* ── Confirm password ────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm password
        </Label>
        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm your password"
          disabled={isDisabled}
          leftIcon={<Lock size={18} />}
          {...register("confirmPassword")}
          className={`h-11 ${errors.confirmPassword ? "border-red-400 focus-visible:ring-red-400" : ""}`}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      {/* ── Submit ──────────────────────────────────────────── */}
      <Button
        type="submit"
        className="w-full h-11 font-semibold"
        disabled={isDisabled}
      >
        {isPending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            <span className="ml-2">Creating account...</span>
          </>
        ) : (
          "Start practicing"
        )}
      </Button>

      {/* ── Sign in link ─────────────────────────────────────── */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
