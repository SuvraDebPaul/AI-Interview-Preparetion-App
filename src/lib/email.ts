import { Resend } from "resend";
import { logger } from "@/lib/logger";

if (!process.env.RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");
if (!process.env.EMAIL_FROM) throw new Error("Missing EMAIL_FROM");
if (!process.env.NEXTAUTH_URL) throw new Error("Missing NEXTAUTH_URL");

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM;
const APP_URL = process.env.NEXTAUTH_URL;

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Verify your email — AI Interview Prep",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;border-radius:6px;text-decoration:none;">
          Verify Email
        </a>
        <p style="color:#666;font-size:13px;margin-top:16px;">
          Link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    logger.error("Verification email failed", { to: email, error: error.message });
    throw new Error(error.message);
  }

  logger.info("Verification email sent", { to: email, emailId: data?.id });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Reset your password — AI Interview Prep",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password.</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;border-radius:6px;text-decoration:none;">
          Reset Password
        </a>
        <p style="color:#666;font-size:13px;margin-top:16px;">
          Link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
  if (error) {
    logger.error("Password reset email failed", { to: email, error: error.message });
    throw new Error(error.message);
  }

  logger.info("Password reset email sent", { to: email, emailId: data?.id });
}
