import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { ZodError } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { logger } from "@/lib/logger";

// ── Error Response Shape ────────────────────────────────────
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
    stack?: string;
  };
}

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// ── Format Error → JSON Response ───────────────────────────
function handleError(error: unknown): NextResponse<ErrorResponse> {
  // 1. Known operational error (our AppError)
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          ...(process.env.NODE_ENV === "development" && {
            stack: error.stack,
          }),
        },
      },
      { status: error.statusCode },
    );
  }

  // 2. Prisma known errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. duplicate email)
    if (error.code === "P2002") {
      const field = (error.meta?.target as string[])?.[0] ?? "field";
      return NextResponse.json(
        {
          success: false,
          error: {
            message: `${field} already exists`,
            code: "DUPLICATE_ENTRY",
            statusCode: 409,
          },
        },
        { status: 409 },
      );
    }

    // Record not found
    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Record not found",
            code: "NOT_FOUND",
            statusCode: 404,
          },
        },
        { status: 404 },
      );
    }
  }

  // 3. Prisma validation error
  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Invalid data provided",
          code: "VALIDATION_ERROR",
          statusCode: 400,
        },
      },
      { status: 400 },
    );
  }

  // 4. Zod validation error (if you use Zod)
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Validation failed";
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: "VALIDATION_ERROR",
          statusCode: 400,
          ...(process.env.NODE_ENV === "development" && {
            details: error.issues,
          }),
        },
      },
      { status: 400 },
    );
  }

  // 5. Unknown/unexpected error — log it, hide details from client
  logger.error("[UNHANDLED ERROR]", error);

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        statusCode: 500,
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : String(error),
        }),
      },
    },
    { status: 500 },
  );
}

// ── Success Response Helper ─────────────────────────────────
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
): NextResponse<SuccessResponse<T>> {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) },
    { status },
  );
}

// ── The Main Wrapper — Express এর catchAsync এর equivalent ──
type RouteHandler = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error);
    }
  };
}
