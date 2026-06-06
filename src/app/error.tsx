"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Production-এ error tracking service-এ log করো (Sentry etc.)
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "An unexpected error occurred. Please try again."}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
