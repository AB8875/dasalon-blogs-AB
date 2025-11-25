import { type NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary-compat";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await cloudinary.uploader.upload(buffer, {
      folder,
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
