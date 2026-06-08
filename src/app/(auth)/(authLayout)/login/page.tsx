import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/auth-options";
import { redirect } from "next/navigation";
import { AuthBackground } from "@/features/auth/components/AuthBackground";
import { LoginLeftPanel } from "@/features/auth/components/LoginLeftPanel";
import LoginRightSidePanel from "@/features/auth/components/LoginRightSidePanel";

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
    <div className="min-h-screen flex-1 relative flex flex-col lg:grid lg:grid-cols-[44%_56%]">
      {/* ── Fixed viewport background — never shows white on scroll ── */}
      <AuthBackground />
      {/* Left Side Panel */}
      <LoginLeftPanel />
      {/* Right panel — white card floats over the gradient */}
      <LoginRightSidePanel verified={verified} callbackUrl={callbackUrl} />
    </div>
  );
}
