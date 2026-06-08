import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/auth-options";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Settings — AI Interview Prep",
  description: "Manage your account settings.",
};

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your password and security preferences.
        </p>
      </div>

      <section>
        <h2 className="text-base font-medium mb-4">Security</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
