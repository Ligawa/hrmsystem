import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');

    if (!applicantId) {
      return NextResponse.json(
        { error: 'Missing applicantId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Fetch pending assessments for the applicant
    // Join with job_applications to get assessment info linked to applications
    const { data: assessments, error } = await supabase
      .from('job_applications')
      .select(`
        id,
        status,
        submission_date,
        jobs (
          id,
          title,
          job_reference_number
        )
      `)
      .eq('applicant_id', applicantId)
      .in('status', ['Assessment Pending', 'assessment_pending', 'under_review'])
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('[v0] Failed to fetch pending assessments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      );
    }

    // Format the response
    const formattedAssessments = (assessments || []).map((app: any) => ({
      id: app.id,
      jobTitle: app.jobs?.title || 'Assessment Pending',
      jobReferenceNumber: app.jobs?.job_reference_number,
      dueDate: new Date(app.submission_date).toISOString(), // This would ideally be a separate field
      status: 'pending',
      type: 'Written Assessment', // Default type
    }));

    return NextResponse.json({
      assessments: formattedAssessments,
      count: formattedAssessments.length,
      hasPending: formattedAssessments.length > 0,
    });
  } catch (error) {
    console.error('[v0] Pending assessments API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
