import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient();
    const { token } = await params;
    const formData = await request.formData();

    // Get portal
    const { data: portal, error: portalError } = await supabase
      .from("submission_portals")
      .select("id, deadline, status")
      .eq("portal_token", token)
      .single();

    if (portalError || !portal) {
      return NextResponse.json(
        { error: "Portal not found" },
        { status: 404 }
      );
    }

    // Check if portal is closed
    if (new Date() > new Date(portal.deadline)) {
      return NextResponse.json(
        { error: "Portal has closed. No further submissions are accepted." },
        { status: 403 }
      );
    }

    const documentType = formData.get("documentType") as string;
    const file = formData.get("file") as File;
    const url = formData.get("url") as string;

    if (!documentType) {
      return NextResponse.json(
        { error: "Document type is required" },
        { status: 400 }
      );
    }

    if (!file && !url) {
      return NextResponse.json(
        { error: "Either file or URL must be provided" },
        { status: 400 }
      );
    }

    let documentUrl = url;
    let fileName = null;

    // If file is provided, upload to storage
    if (file) {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `portals/${portal.id}/${timestamp}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("submissions")
        .upload(filePath, file);

      if (uploadError) {
        console.error("[v0] File upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload file" },
          { status: 500 }
        );
      }

      fileName = safeFileName;
      documentUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/submissions/${filePath}`;
    }

    // Create submission document record
    const { data: submission, error: submitError } = await supabase
      .from("submission_documents")
      .insert({
        portal_id: portal.id,
        document_type: documentType,
        file_name: fileName,
        document_url: documentUrl,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (submitError) {
      console.error("[v0] Submission record error:", submitError);
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        documentType: submission.document_type,
        submittedAt: submission.submitted_at,
      },
    });
  } catch (error) {
    console.error("[v0] Document upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
