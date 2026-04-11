import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { generateRandomString } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user to verify they are logged in
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      applicationId,
      deadline,
      requiredDocuments,
    } = await request.json();

    if (!applicationId || !deadline) {
      return NextResponse.json(
        { error: "applicationId and deadline are required" },
        { status: 400 }
      );
    }

    // Generate unique portal token
    const portalToken = generateRandomString(32);

    // Create submission portal
    const { data: portal, error } = await supabase
      .from("submission_portals")
      .insert({
        application_id: applicationId,
        portal_token: portalToken,
        deadline: deadline,
        required_documents: requiredDocuments || [],
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("[v0] Portal creation error:", error);
      return NextResponse.json(
        { error: "Failed to create portal" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      portalId: portal.id,
      portalToken: portal.portal_token,
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${portal.portal_token}`,
    });
  } catch (error) {
    console.error("[v0] Portal creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
