import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/auth-options";
import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Forgot Password — AI Interview Prep",
  description: "Reset your password via email.",
};

export default async function ForgotPasswordPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Forgot password?
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
