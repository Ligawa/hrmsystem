import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE_LARGE = 10 * 1024 * 1024; // 10MB for documents
const MAX_FILE_SIZE_SMALL = 5 * 1024 * 1024; // 5MB for images
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the file from request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Determine if it's an image or document
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type);

    if (!isImage && !isDocument) {
      return NextResponse.json(
        { error: "File type not allowed. Please upload PDF, DOC, DOCX, JPG, PNG, or GIF" },
        { status: 400 }
      );
    }

    // Validate file size based on type
    const maxSize = isImage ? MAX_FILE_SIZE_SMALL : MAX_FILE_SIZE_LARGE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || (isImage ? 'jpg' : 'pdf');
    const filename = `${timestamp}-${randomString}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json(
      {
        success: true,
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        pathname: blob.pathname,
        contentType: blob.contentType,
        filename,
        size: file.size,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
