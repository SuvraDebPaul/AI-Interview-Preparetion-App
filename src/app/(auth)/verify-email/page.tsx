"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No token provided.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        if (res.redirected || res.ok) {
          setStatus("success");
          setMessage("Email verified! You can now log in.");
        } else {
          setStatus("error");
          setMessage("Invalid or expired verification link.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>
            {status === "loading" && "Verifying..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{message}</p>
          {status === "success" && (
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
          )}
          {status === "error" && (
            <Button variant="outline" asChild>
              <Link href="/register">Back to Register</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
