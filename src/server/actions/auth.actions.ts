"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { addDays, addHours, isBefore } from "date-fns";
import { getServerSession } from "next-auth";
import { Redis } from "@upstash/redis";
import { prisma } from "@/server/db/prisma";
import { authOptions } from "@/server/auth/auth-options";
import { Prisma } from "@/generated/prisma/client";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/features/auth/services/auth-email.service";
import {
  registerSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  resendVerificationSchema,
} from "@/features/auth/schemas/auth.schema";
import { logger } from "@/lib/logger";

const redis = Redis.fromEnv();

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string; code?: string };

// ── Register ─────────────────────────────────────────────────
export async function registerAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, password } = parsed.data;
  // Feature 1 — Email normalization
  const email = parsed.data.email.toLowerCase().trim();
  const imageUrl = formData.get("imageUrl") as string | null;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyExpires = addDays(new Date(), 1);

    // Create user first — rely on DB P2002 constraint for duplicate check
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerifyToken,
        emailVerifyExpires,
        image: imageUrl || null,
      },
    });

    // Send verification email — rollback user on failure
    try {
      await sendVerificationEmail(email, emailVerifyToken);
    } catch (emailError) {
      await prisma.user.delete({ where: { id: user.id } });
      logger.error("Verification email failed — user rolled back", {
        userId: user.id,
        error: emailError,
      });
      return {
        success: false,
        error: "Failed to send verification email. Please try again.",
      };
    }

    logger.info("User registered", { userId: user.id, email });
    return { success: true, message: "Account created! Check your email to verify." };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "Email already registered." };
    }
    logger.error("Register failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }
}

// ── Resend Verification Email ────────────────────────────────
// Feature 2 — Resend verification email
// Same message whether user exists or not — anti-enumeration
export async function resendVerificationAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = { email: formData.get("email") };

  const parsed = resendVerificationSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const SAFE_MSG = "If your account is unverified, a new link has been sent.";

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    });

    // User not found or already verified — same message (anti-enumeration)
    if (!user || user.emailVerified) {
      return { success: true, message: SAFE_MSG };
    }

    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyExpires = addDays(new Date(), 1);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpires },
    });

    try {
      await sendVerificationEmail(email, emailVerifyToken);
    } catch (emailError) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerifyToken: null, emailVerifyExpires: null },
      });
      logger.error("Resend verification email failed", { userId: user.id, error: emailError });
      return { success: false, error: "Failed to send email. Please try again." };
    }

    logger.info("Verification email resent", { userId: user.id });
    return { success: true, message: SAFE_MSG };
  } catch (error) {
    logger.error("Resend verification failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }
}

// ── Forgot Password ──────────────────────────────────────────
export async function forgotPasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = { email: formData.get("email") };

  const parsed = forgetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Feature 1 — Email normalization
  const email = parsed.data.email.toLowerCase().trim();
  const SAFE_MSG = "If this email exists, a reset link has been sent.";

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    // Same message always — anti-enumeration
    if (!user || !user.password) {
      return { success: true, message: SAFE_MSG };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = addHours(new Date(), 1);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpires: resetExpires },
    });

    // Rollback token on email failure
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: null, passwordResetExpires: null },
      });
      logger.error("Password reset email failed — token rolled back", {
        userId: user.id,
        error: emailError,
      });
      return { success: false, error: "Failed to send reset email. Please try again." };
    }

    logger.info("Password reset email sent", { userId: user.id });
    return { success: true, message: SAFE_MSG };
  } catch (error) {
    logger.error("Forgot password failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }
}

// ── Reset Password ───────────────────────────────────────────
export async function resetPasswordAction(
  token: string,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
      select: { id: true, passwordResetExpires: true },
    });

    if (!user || !user.passwordResetExpires) {
      return { success: false, error: "Invalid or expired reset link." };
    }

    if (isBefore(user.passwordResetExpires, new Date())) {
      return {
        success: false,
        error: "Reset link has expired. Please request a new one.",
        code: "TOKEN_EXPIRED",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: now, // Feature 3 — JWT invalidation
      },
    });

    // Feature 3 — Signal to jwt callback that this user's old tokens are invalid
    // Redis key stores Unix timestamp; jwt callback compares against token.iat
    await redis.set(`pw_changed:${user.id}`, Math.floor(now.getTime() / 1000), {
      ex: 30 * 24 * 60 * 60, // 30 days TTL (max session lifetime)
    });

    logger.info("Password reset successful", { userId: user.id });
    return { success: true, message: "Password reset successful!" };
  } catch (error) {
    logger.error("Reset password failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }
}

// ── Change Password (logged-in user) ────────────────────────
// Feature 5 — Password change requires current session
export async function changePasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated.", code: "UNAUTHENTICATED" };
  }

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { currentPassword, newPassword } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user?.password) {
      return {
        success: false,
        error: "Password change is not available for accounts signed in with Google or GitHub.",
      };
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      return { success: false, error: "Current password is incorrect." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const now = new Date();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: now, // Feature 3 — JWT invalidation
      },
    });

    // Feature 3 — Invalidate all existing sessions for this user
    await redis.set(`pw_changed:${user.id}`, Math.floor(now.getTime() / 1000), {
      ex: 30 * 24 * 60 * 60,
    });

    logger.info("Password changed", { userId: user.id });
    return {
      success: true,
      message: "Password changed successfully. Please sign in again.",
    };
  } catch (error) {
    logger.error("Change password failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }
}
