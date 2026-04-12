import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch application by email
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select(`
        id,
        applicant_name,
        applicant_email,
        job_id,
        status,
        created_at,
        jobs (
          id,
          title,
          location,
          level
        ),
        submission_portals (
          token,
          expires_at
        )
      `)
      .eq('applicant_email', email.toLowerCase())
      .single();

    if (fetchError || !application) {
      console.error('[v0] Application fetch error:', fetchError);
      return NextResponse.json(
        { error: 'No application found with this email address' },
        { status: 404 }
      );
    }

    // Build submission portal URL if portal exists
    let submissionPortalUrl = null;
    if (application.submission_portals && application.submission_portals.length > 0) {
      const portal = application.submission_portals[0];
      if (new Date(portal.expires_at) > new Date()) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wvio.org';
        submissionPortalUrl = `${baseUrl}/portal/${portal.token}`;
      }
    }

    return NextResponse.json({
      id: application.id,
      applicantName: application.applicant_name,
      applicantEmail: application.applicant_email,
      jobTitle: application.jobs?.title || 'Unknown Position',
      status: application.status,
      createdAt: application.created_at,
      submissionPortalUrl,
    });
  } catch (error) {
    console.error('[v0] Track application error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve application data' },
      { status: 500 }
    );
  }
}
