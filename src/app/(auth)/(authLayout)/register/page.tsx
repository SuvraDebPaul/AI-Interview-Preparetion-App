import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/auth-options";
import { redirect } from "next/navigation";
import { AuthBackground } from "@/features/auth/components/AuthBackground";
import { RegisterLeftPanel } from "@/features/auth/components/RegisterLeftPanel";
import RegisterRightSidePanel from "@/features/auth/components/RegisterRightSidePanel";

export const metadata: Metadata = {
  title: "Create Account — AI Interview Prep",
  description: "Sign up and start practising AI-powered interview questions.",
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="max-h-screen flex-1 relative flex flex-col lg:grid lg:grid-cols-[44%_56%]">
      {/* Background */}
      <AuthBackground imageUrl="/bg.png" />
      {/* LeftSide Panel */}
      <RegisterLeftPanel />
      {/* Right panel — white card floats over the gradient */}
      <RegisterRightSidePanel />
    </div>
  );
}
