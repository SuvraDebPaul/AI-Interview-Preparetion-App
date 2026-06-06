import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("API Key:", process.env.CLOUDINARY_API_KEY);
  console.log("API Key:", process.env.CLOUDINARY_API_SECRET);
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No File Provided" }, { status: 400 });
    }
    // File size check — 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 2MB" },
        { status: 400 },
      );
    }
    // File type check
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes) {
      return NextResponse.json(
        { error: "Only JPG, PNG, or WebP allowed" },
        { status: 400 },
      );
    }
    // File → Buffer → Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Cloudinary-> upload
    const result = await cloudinary.uploader.upload(base64, {
      folder: "ai-interview-preparetion/avatars",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    console.log("Cloudinary result:", result.secure_url);
    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
