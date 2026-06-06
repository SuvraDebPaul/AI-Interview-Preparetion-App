import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { successResponse, withErrorHandler } from "@/lib/api-handler";
import { ConflictError, ValidationError } from "@/lib/error";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const { name, email, password, imageUrl } = await req.json();

  // Validation — throws ValidationError automatically caught by handler
  if (!name || !email || !password) {
    throw new ValidationError("Name, email and password are required");
  }

  if (password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const emailVerifyToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailVerifyToken,
      image: imageUrl || null,
    },
  });

  await sendVerificationEmail(email, emailVerifyToken);

  logger.info("User registered", { userId: user.id, email });

  return successResponse(
    { userId: user.id },
    "Account created! Check your email to verify.",
    201,
  );
});
