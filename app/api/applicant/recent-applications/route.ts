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

    // First, get the UUID from the applicant string ID
    const { data: applicants, error: applicantError } = await supabase
      .from('applicants')
      .select('id')
      .eq('applicant_id', applicantId)
      .limit(1);

    if (applicantError || !applicants || applicants.length === 0) {
      console.error('[v0] Applicant not found:', applicantId, applicantError);
      return NextResponse.json({
        applications: [],
        count: 0,
      });
    }

    const applicantUUID = applicants[0].id;

    // Fetch recent job applications
    const { data: applications, error: appsError } = await supabase
      .from('job_applications')
      .select('id, status, submission_date, job_id')
      .eq('applicant_id', applicantUUID)
      .order('submission_date', { ascending: false })
      .limit(limit);

    if (appsError) {
      console.error('[v0] Failed to fetch recent applications:', appsError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Fetch job details for all applications
    const jobIds = (applications || []).map((app: any) => app.job_id).filter(Boolean);
    let jobsMap: Record<string, any> = {};

    if (jobIds.length > 0) {
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, location, duty_station, job_reference_number, contract_type')
        .in('id', jobIds);

      if (!jobsError && jobs) {
        jobsMap = Object.fromEntries(jobs.map((job: any) => [job.id, job]));
      }
    }

    // Format the response
    const formattedApplications = (applications || []).map((app: any) => {
      const job = jobsMap[app.job_id] || {};
      return {
        id: app.id,
        status: app.status,
        submissionDate: app.submission_date,
        jobTitle: job.title || 'Job Position',
        location: job.location || job.duty_station || 'Location TBA',
        jobReferenceNumber: job.job_reference_number,
        contractType: job.contract_type,
      };
    });

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
