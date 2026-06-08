"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import {
  registerSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth.schema";
import { logger } from "@/lib/logger";

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

  const { name, email, password } = parsed.data;
  const imageUrl = formData.get("imageUrl") as string | null;

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Step 1: Create user first — unverified
    // Rely on DB unique constraint (P2002) instead of a findUnique check
    // to prevent race conditions on concurrent registrations
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

    // Step 2: Send verification email
    // If this fails, clean up the created user so they can register again
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

    return {
      success: true,
      message: "Account created! Check your email to verify.",
    };
  } catch (error) {
    // DB unique constraint → duplicate email
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

// ── Forgot Password ──────────────────────────────────────────
export async function forgotPasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = { email: formData.get("email") };

  const parsed = forgetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    // Security: same message always
    if (!user || !user.password) {
      return {
        success: true,
        message: "If this email exists, a reset link has been sent.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // If email fails, clear the token — don't leave a stranded token in DB
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
      return {
        success: false,
        error: "Failed to send reset email. Please try again.",
      };
    }

    logger.info("Password reset email sent", { userId: user.id });

    return {
      success: true,
      message: "If this email exists, a reset link has been sent.",
    };
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

    if (user.passwordResetExpires < new Date()) {
      return {
        success: false,
        error: "Reset link has expired. Please request a new one.",
        code: "TOKEN_EXPIRED",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    logger.info("Password reset successful", { userId: user.id });

    return { success: true, message: "Password reset successful!" };
  } catch (error) {
    logger.error("Reset password failed", error);
    return { success: false, error: "Something went wrong. Try again." };
  }
}
