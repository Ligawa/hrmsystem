import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await createClient();
    const token = params.token;

    // Fetch portal details
    const { data: portal, error } = await supabase
      .from("submission_portals")
      .select(
        `
        id,
        portal_token,
        deadline,
        required_documents,
        status,
        created_at,
        applications!inner (
          id,
          applicant_name,
          job_title,
          applicant_email
        )
      `
      )
      .eq("portal_token", token)
      .single();

    if (error || !portal) {
      return NextResponse.json(
        { error: "Portal not found" },
        { status: 404 }
      );
    }

    // Check if portal is closed (past deadline)
    const deadline = new Date(portal.deadline);
    const now = new Date();
    const isClosed = now > deadline;

    return NextResponse.json({
      portal: {
        ...portal,
        isClosed,
        timeRemaining: Math.max(0, deadline.getTime() - now.getTime()),
      },
    });
  } catch (error) {
    console.error("[v0] Portal fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
