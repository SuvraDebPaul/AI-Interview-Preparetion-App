import type { ReactNode } from "react";

// Each page owns its own full layout — this wrapper is intentionally transparent.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
