import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — AI Interview Prep",
  description: "Sign in to your account and continue your interview practice.",
};

interface Props {
  searchParams: Promise<{ verified?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const { verified, callbackUrl } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        <LoginForm
          verified={verified === "true"}
          callbackUrl={callbackUrl ?? "/dashboard"}
        />
      </div>
    </div>
  );
}
