"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  ResetPassword,
} from "@/lib/validations/auth.schema";
import { resetPasswordAction } from "@/serverActions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface Props {
  token: string;
}

export default function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
  });

  function onSubmit(values: ResetPassword) {
    setServerError("");

    const formData = new FormData();
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);

    startTransition(async () => {
      const result = await resetPasswordAction(token, formData);

      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setServerError(result.error);
      }
    });
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-green-600"
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
          <h3 className="font-semibold text-lg">Password updated!</h3>
          <p className="text-sm text-muted-foreground">{success}</p>
          <p className="text-xs text-muted-foreground">
            Redirecting to login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-6 space-y-5">
          {serverError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {serverError}
              {serverError.includes("expired") && (
                <Link
                  href="/forgot-password"
                  className="block mt-1 text-primary hover:underline"
                >
                  Request a new reset link →
                </Link>
              )}
            </div>
          )}

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              disabled={isPending}
              {...register("password")}
              className={
                errors.password
                  ? "border-red-400 focus-visible:ring-red-400"
                  : ""
              }
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              disabled={isPending}
              {...register("confirmPassword")}
              className={
                errors.confirmPassword
                  ? "border-red-400 focus-visible:ring-red-400"
                  : ""
              }
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset password"}
          </Button>

          <Link
            href="/login"
            className="text-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
