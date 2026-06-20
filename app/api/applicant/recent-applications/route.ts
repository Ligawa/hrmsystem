import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '3'), 10); // Max 10, default 3

    if (!applicantId) {
      return NextResponse.json(
        { error: 'Missing applicantId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Fetch recent job applications with job details
    const { data: applications, error } = await supabase
      .from('job_applications')
      .select(`
        id,
        status,
        submission_date,
        jobs (
          id,
          title,
          location,
          duty_station,
          job_reference_number,
          contract_type
        )
      `)
      .eq('applicant_id', applicantId)
      .order('submission_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[v0] Failed to fetch recent applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedApplications = (applications || []).map((app: any) => ({
      id: app.id,
      status: app.status,
      submissionDate: app.submission_date,
      jobTitle: app.jobs?.title || 'Job Position',
      location: app.jobs?.location || app.jobs?.duty_station || 'Location TBA',
      jobReferenceNumber: app.jobs?.job_reference_number,
      contractType: app.jobs?.contract_type,
    }));

    return NextResponse.json({
      applications: formattedApplications,
      count: formattedApplications.length,
    });
  } catch (error) {
    console.error('[v0] Recent applications API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
