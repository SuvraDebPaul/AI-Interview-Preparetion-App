import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { withErrorHandler, successResponse } from "@/lib/api-handler";
import { ValidationError, AppError } from "@/lib/error";
import { logger } from "@/lib/logger";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const POST = withErrorHandler(async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    throw new ValidationError("No file provided");
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new ValidationError("Image must be under 2MB");
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError("Only JPG, PNG, or WebP allowed");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "ai-interview-prep/avatars",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  if (!result.secure_url) {
    throw new AppError("Upload failed — no URL returned", 500, "UPLOAD_FAILED");
  }

  logger.info("Image uploaded", { publicId: result.public_id });

  return successResponse(
    { url: result.secure_url },
    "Image uploaded successfully",
  );
});
