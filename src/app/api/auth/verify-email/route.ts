import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-handler";
import { ValidationError, NotFoundError } from "@/lib/error";
import { logger } from "@/lib/logger";

export const GET = withErrorHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    throw new ValidationError("Verification token is required");
  }

  const user = await prisma.user.findUnique({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    throw new NotFoundError("Invalid or expired verification token");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerifyToken: null,
    },
  });

  logger.info("Email verified", { userId: user.id, email: user.email });

  return NextResponse.redirect(new URL("/login?verified=true", req.url));
});
