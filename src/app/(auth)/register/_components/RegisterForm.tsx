"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth.schema";
import { registerAction } from "@/serverActions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ImageUpload from "@/components/shared/ImageUpload";
import clsx from "clsx";

export default function RegisterForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  // react-hook-form + zod → client-side validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  // File select → শুধু state-এ রাখো, upload হবে না
  async function handleImageChange(file: File | null) {
    setImageFile(file);
  }
  // Form submit
  // react-hook-form প্রথমে client validate করে
  // pass হলে Server Action call হয়
  function onSubmit(values: RegisterInput) {
    setServerError("");

    startTransition(async () => {
      // Step 1: image থাকলে এখন upload করো
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const text = await res.text();
        const data = JSON.parse(text);

        if (!res.ok) {
          setServerError(data.error?.message || "Image upload failed");
          return;
        }

        imageUrl = data.data.url;
      }
      // Step 2: register action
      const formData = new FormData();
      formData.set("name", values.name);
      formData.set("email", values.email);
      formData.set("password", values.password);
      formData.set("confirmPassword", values.confirmPassword);
      formData.set("imageUrl", imageUrl);

      const result = await registerAction(formData);

      if (result.success) setSuccess(result.message);
      else setServerError(result.error);
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
          <h3 className="font-semibold text-lg">Check your email!</h3>
          <p className="text-sm text-muted-foreground">{success}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {/* handleSubmit → client zod validate → onSubmit → server action */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-6 space-y-5 mb-6">
          {/* Server error */}
          {serverError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {serverError}
            </div>
          )}

          {/* Image upload */}
          <div className="flex flex-col items-center gap-1">
            <ImageUpload onChange={handleImageChange} />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Your Full Name"
              disabled={isPending}
              {...register("name")}
              className={clsx(
                "h-9 text-sm",
                errors.name ? "border-red-400 focus-visible:ring-red-400" : "",
              )}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isPending}
              {...register("email")}
              className={clsx(
                "h-9 text-sm",
                errors.email ? "border-red-400 focus-visible:ring-red-400" : "",
              )}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              disabled={isPending}
              {...register("password")}
              className={clsx(
                "h-9 text-sm",
                errors.password
                  ? "border-red-400 focus-visible:ring-red-400"
                  : "",
              )}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              disabled={isPending}
              {...register("confirmPassword")}
              className={clsx(
                "h-9 text-sm",
                errors.confirmPassword
                  ? "border-red-400 focus-visible:ring-red-400"
                  : "",
              )}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button
            type="submit"
            className={clsx("w-full", isPending ? "animate-spin" : "")}
            disabled={isPending}
          >
            {isPending
              ? imageFile
                ? "Uploading & creating account..."
                : "Creating account..."
              : "Create account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
