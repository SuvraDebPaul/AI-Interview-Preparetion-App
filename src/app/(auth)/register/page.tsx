import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import RegisterForm from "./_components/RegisterForm";

//SEO - Server Component
export const metadata: Metadata = {
  title: "Create Account - AI Interview Preparetion App",
  description: "Sign up and start practicing AI Powered Insterview Questions",
};

export default async function RegisterPage() {
  //Already logged-in -> Go to Dashboard
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Static header — server renders this */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Create account</h1>
          <p className="text-muted-foreground mt-2">
            Start your AI interview prep journey
          </p>
        </div>

        {/* Interactive form — client component */}
        <RegisterForm />
      </div>
    </div>
  );
}
