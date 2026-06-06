import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AppError, NotFoundError, ValidationError } from "@/lib/error";
import { logger } from "@/lib/logger";
import { successResponse } from "@/lib/api-handler";

export const POST = async (req: NextRequest) => {
  const { token, password } = await req.json();

  if (!token || !password) {
    throw new ValidationError("Token and password are required");
  }

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
  });

  if (!user || !user.passwordResetExpires) {
    throw new NotFoundError("Invalid or expired reset token");
  }

  if (user.passwordResetExpires < new Date()) {
    throw new AppError(
      "Reset link has expired. Please request a new one.",
      410, // 410 Gone — resource expired
      "TOKEN_EXPIRED",
    );
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
  logger.info("User Updated Sucessfully", {
    userId: user.id,
  });

  return successResponse(null, "Password reset successful!");
};
