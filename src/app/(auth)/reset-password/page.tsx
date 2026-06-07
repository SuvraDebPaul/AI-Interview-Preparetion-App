import { Metadata } from "next";
import { notFound } from "next/navigation";
import ResetPasswordForm from "./_components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password — AI Interview Prep",
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  // Token না থাকলে 404
  if (!token) notFound();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Set new password
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose a strong password for your account.
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
