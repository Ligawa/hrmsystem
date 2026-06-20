import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');

    if (!applicantId) {
      return NextResponse.json(
        { error: 'Missing applicantId' },
        { status: 400 }
      );
    }

    // Get applicant by applicant_id
    const { data: applicant, error: appError } = await supabaseAdmin
      .from('applicants')
      .select('id')
      .eq('applicant_id', applicantId)
      .maybeSingle();

    if (appError || !applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    // Fetch job applications with job details
    const { data: applications, error } = await supabaseAdmin
      .from('job_applications')
      .select(`
        id,
        job_id,
        application_status,
        submission_date,
        cover_letter
      `)
      .eq('applicant_id', applicant.id)
      .order('submission_date', { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch job details for each application
    const applicationsWithDetails = await Promise.all(
      (applications || []).map(async (app) => {
        // For now, return basic info since jobs table structure may vary
        return {
          id: app.id,
          jobId: app.job_id,
          status: app.application_status,
          submissionDate: app.submission_date,
          coverLetter: app.cover_letter,
        };
      })
    );

    return NextResponse.json({
      applications: applicationsWithDetails,
    });
  } catch (error) {
    console.error('[v0] Applications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
