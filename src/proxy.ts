import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ── Upstash Rate Limiter ──────────────────────────────────────
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: false,
  prefix: "login_ratelimit",
});

// ── Proxy ─────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting — only for credentials login ────────────
  if (pathname === "/api/auth/callback/credentials") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "anonymous";

    const { success, reset } = await ratelimit.limit(ip);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: "Too many login attempts. Please wait before trying again." },
        {
          status: 429,
          headers: {
            // RFC 6585 — tells client when to retry
            "Retry-After": String(retryAfter),
            "X-RateLimit-Reset": String(reset),
          },
        },
      );
    }

    // Allowed — pass through, do NOT fall into auth guard
    return NextResponse.next();
  }

  // ── Auth guard — only for protected page routes ───────────
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected pages
    "/dashboard/:path*",
    "/interview/:path*",
    // Rate-limited login endpoint
    "/api/auth/callback/credentials",
  ],
};
