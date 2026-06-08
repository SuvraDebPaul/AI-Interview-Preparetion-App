import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ── Startup env validation ─────────────────────────────────────
if (!process.env.NEXTAUTH_SECRET) throw new Error("Missing NEXTAUTH_SECRET");
if (!process.env.GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID");
if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");
if (!process.env.GITHUB_CLIENT_ID) throw new Error("Missing GITHUB_CLIENT_ID");
if (!process.env.GITHUB_CLIENT_SECRET) throw new Error("Missing GITHUB_CLIENT_SECRET");

// Valid bcrypt hash used as dummy when user is not found.
// Ensures bcrypt.compare() always runs ~same time → prevents email enumeration timing attack.
// Generated once: bcrypt.hashSync("__dummy__", 12)
const DUMMY_HASH = "$2b$12$KIXbpHDGBklLhvXLhzDnNOmZTaLHSMhxfgBMFkGdQgBaBKqXiXr4u";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          // Only fetch what is needed — never pull tokens or full user data
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            emailVerified: true,
          },
        });

        // Always run bcrypt even when user not found — prevents email
        // enumeration via response-time difference (~100ms vs <1ms)
        const passwordToCompare = user?.password ?? DUMMY_HASH;
        const isValid = await bcrypt.compare(
          credentials.password,
          passwordToCompare,
        );

        if (!user || !user.password || !isValid) return null;

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" }, // Credentials provider এর জন্য JWT লাগে
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Only runs on sign-in — set id once, never query DB again per request
      if (user) {
        token.id = user.id;
      }

      // Session update triggered manually (e.g. after profile edit)
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

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name ?? null;
        session.user.image = token.picture ?? null;
      }
      return session;
    },
  },
};
