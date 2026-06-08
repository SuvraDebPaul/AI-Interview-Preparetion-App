import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/auth-options";
import { redirect } from "next/navigation";
import { ResendVerificationForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Resend Verification — AI Interview Prep",
  description: "Resend your email verification link.",
};

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function ResendVerificationPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const { email } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Verify your email
          </h1>
          <p className="text-muted-foreground mt-2">
            Didn&apos;t receive a verification email? We&apos;ll send a new one.
          </p>
        </div>
        <ResendVerificationForm defaultEmail={email ?? ""} />
      </div>
    </div>
  );
}
