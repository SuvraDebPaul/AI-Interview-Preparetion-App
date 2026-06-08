import { Metadata } from "next";
import { prisma } from "@/server/db/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Verify Email — AI Interview Prep",
};

interface Props {
  searchParams: Promise<{ token?: string }>;
}

// token verify করে result return করে — JSX নেই এখানে
async function verifyToken(
  token: string,
): Promise<{ success: boolean; message: string } | "redirect"> {
  try {
    const user = await prisma.user.findUnique({
      where: { emailVerifyToken: token },
      select: { id: true, emailVerified: true, emailVerifyExpires: true },
    });

    if (!user) {
      return {
        success: false,
        // Don't say "register again" — the account may still exist with a cleared token.
        // User should go to login and use "Forgot password" or contact support.
        message:
          "This verification link is invalid or has already been used. Please sign in or request a new link.",
      };
    }

    if (user.emailVerified) {
      return "redirect";
    }

    // Check token expiry (24 hours)
    if (user.emailVerifyExpires && isBefore(user.emailVerifyExpires, new Date())) {
      // Clear the expired token but keep the account — user can request a new link
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifyToken: null, emailVerifyExpires: null },
      });
      return {
        success: false,
        message: "Verification link has expired. Please request a new one from the login page.",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    return "redirect";
  } catch {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  // Token নেই
  if (!token) {
    return (
      <VerifyResult success={false} message="No verification token provided." />
    );
  }

  // Verify করো — try/catch এর বাইরে JSX
  const result = await verifyToken(token);

  if (result === "redirect") {
    redirect("/login?verified=true");
  }

  // JSX try/catch এর বাইরে — safe
  return <VerifyResult success={result.success} message={result.message} />;
}

function VerifyResult({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center space-y-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto
            ${success ? "bg-green-100" : "bg-red-100"}`}
          >
            {success ? (
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
            ) : (
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <h3 className="font-semibold text-lg">
            {success ? "Email Verified!" : "Verification Failed"}
          </h3>

          <p className="text-sm text-muted-foreground">{message}</p>

          <Button asChild className="w-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
