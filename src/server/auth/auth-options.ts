import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { Redis } from "@upstash/redis";
import { prisma } from "@/server/db/prisma";
import bcrypt from "bcryptjs";

// ── Startup env validation ─────────────────────────────────────
if (!process.env.NEXTAUTH_SECRET) throw new Error("Missing NEXTAUTH_SECRET");
if (!process.env.GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID");
if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");
if (!process.env.GITHUB_CLIENT_ID) throw new Error("Missing GITHUB_CLIENT_ID");
if (!process.env.GITHUB_CLIENT_SECRET) throw new Error("Missing GITHUB_CLIENT_SECRET");
if (!process.env.UPSTASH_REDIS_REST_URL) throw new Error("Missing UPSTASH_REDIS_REST_URL");
if (!process.env.UPSTASH_REDIS_REST_TOKEN) throw new Error("Missing UPSTASH_REDIS_REST_TOKEN");

const redis = Redis.fromEnv();

// Valid bcrypt hash used as dummy when user is not found.
// Ensures bcrypt.compare() always runs ~same time → prevents email enumeration timing attack.
const DUMMY_HASH = "$2b$12$KIXbpHDGBklLhvXLhzDnNOmZTaLHSMhxfgBMFkGdQgBaBKqXiXr4u";

// Per-account rate limiting constants
const ACCOUNT_LOCK_MAX = 5;           // 5 failed attempts
const ACCOUNT_LOCK_WINDOW = 15 * 60; // 15 minutes in seconds

// Session duration constants
const SESSION_SHORT = 24 * 60 * 60;       // 1 day  (no remember me)
const SESSION_LONG  = 30 * 24 * 60 * 60;  // 30 days (remember me)

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Safe because Google verifies email ownership.
      // Allows existing credentials users to also sign in with Google
      // (same email → accounts get linked instead of error).
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:      { label: "Email",       type: "email"    },
        password:   { label: "Password",    type: "password" },
        rememberMe: { label: "Remember me", type: "checkbox" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Feature 1 — Email normalization
        const normalizedEmail = credentials.email.toLowerCase().trim();

        // Feature 4 — Per-account rate limiting (Upstash Redis)
        // Tracks failed attempts per email — separate from IP-based limit in proxy.ts
        const failKey = `login_failed:${normalizedEmail}`;
        const failCount = (await redis.get<number>(failKey)) ?? 0;
        if (failCount >= ACCOUNT_LOCK_MAX) {
          throw new Error("ACCOUNT_LOCKED");
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            emailVerified: true,
          },
        });

        // Always run bcrypt even when user not found — prevents timing attack
        const passwordToCompare = user?.password ?? DUMMY_HASH;
        const isValid = await bcrypt.compare(credentials.password, passwordToCompare);

        if (!user || !user.password || !isValid) {
          // Track failed attempt only for existing users (VPN bypass of IP limit)
          if (user) {
            await redis.incr(failKey);
            await redis.expire(failKey, ACCOUNT_LOCK_WINDOW);
          }
          return null;
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Success — reset failure counter
        await redis.del(failKey);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          // Feature 7 — Remember me: pass through to jwt callback
          rememberMe: credentials.rememberMe === "true",
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: SESSION_LONG, // Global max — per-user exp overrides this in jwt callback
  },

  pages: { signIn: "/login" },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // ── Sign-in: set token fields from user object ─────────
      if (user) {
        token.id = user.id;

        // Feature 7 — Remember me: short vs long session
        const rememberMe = user.rememberMe ?? false;
        token.rememberMe = rememberMe;
        token.exp = Math.floor(Date.now() / 1000) + (rememberMe ? SESSION_LONG : SESSION_SHORT);
      }

      // ── Session update (e.g. after profile edit) ───────────
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, name: true, image: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      // ── Feature 3 — JWT invalidation after password change ─
      // Uses Upstash Redis: set when password changes, checked here.
      // Redis key stores Unix timestamp of password change.
      // If token was issued before that timestamp → force re-login.
      if (token.id && !user) {
        const pwChangedAt = await redis.get<number>(`pw_changed:${token.id}`);
        const tokenIat = token.iat as number | undefined;
        if (pwChangedAt && tokenIat && pwChangedAt > tokenIat) {
          // Password changed after this JWT was issued → invalidate
          // Setting exp to 0 makes getToken() return null (safe for proxy + getServerSession)
          return { ...token, exp: 0 };
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id    = token.id;
        session.user.name  = token.name  ?? null;
        session.user.image = token.picture ?? null;
      }
      return session;
    },
  },
};
