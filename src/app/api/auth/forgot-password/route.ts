import { NextRequest } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { withErrorHandler, successResponse } from "@/lib/api-handler";
import { ValidationError } from "@/lib/error";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { email } = await req.json();

  if (!email) {
    throw new ValidationError("Email is required");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Security: always return same message — don't reveal if email exists
  if (!user || !user.password) {
    logger.warn("Forgot password: email not found or OAuth user", { email });
    return successResponse(
      null,
      "If this email exists, a reset link has been sent.",
    );
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  });

  await sendPasswordResetEmail(email, resetToken);

  logger.info("Password reset email sent", { userId: user.id, email });

  return successResponse(
    null,
    "If this email exists, a reset link has been sent.",
  );
});
