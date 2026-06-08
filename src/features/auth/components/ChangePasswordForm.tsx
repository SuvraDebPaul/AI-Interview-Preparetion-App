"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  ChangePassword,
} from "@/features/auth/schemas/auth.schema";
import { changePasswordAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ChangePasswordForm() {
  const [serverMessage, setServerMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePassword>({
    resolver: zodResolver(changePasswordSchema),
  });

  function onSubmit(values: ChangePassword) {
    setServerMessage(null);

    const formData = new FormData();
    formData.set("currentPassword", values.currentPassword);
    formData.set("newPassword", values.newPassword);
    formData.set("confirmPassword", values.confirmPassword);

    startTransition(async () => {
      const result = await changePasswordAction(formData);

      if (!result.success) {
        setServerMessage({ type: "error", text: result.error });
        return;
      }

      setServerMessage({ type: "success", text: result.message });
      reset();

      // Feature 3 — JWT invalidation: after password change, force re-login
      // Redis pw_changed key is already set by the action — sign out clears the client cookie
      setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 2000);
    });
  }

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-xl">Change Password</CardTitle>
        <CardDescription>
          After changing your password, you will be signed out of all sessions.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5">
          {/* Server message */}
          {serverMessage && (
            <div
              className={`text-sm px-3 py-2 rounded-md border ${
                serverMessage.type === "success"
                  ? "text-green-700 bg-green-50 border-green-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }`}
            >
              {serverMessage.text}
              {serverMessage.type === "success" && (
                <span className="block text-xs mt-0.5 opacity-75">
                  Signing you out…
                </span>
              )}
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <PasswordInput
              id="currentPassword"
              placeholder="Your current password"
              disabled={isPending}
              {...register("currentPassword")}
              className={
                errors.currentPassword
                  ? "border-red-400 focus-visible:ring-red-400"
                  : ""
              }
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              id="newPassword"
              placeholder="At least 8 chars, 1 uppercase, 1 number"
              disabled={isPending}
              {...register("newPassword")}
              className={
                errors.newPassword
                  ? "border-red-400 focus-visible:ring-red-400"
                  : ""
              }
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Repeat your new password"
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

        <CardFooter className="pb-6">
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending && (
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            )}
            {isPending ? "Changing password..." : "Change Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
