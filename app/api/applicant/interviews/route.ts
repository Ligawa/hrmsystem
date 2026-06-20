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

    // Get applicant's job applications
    const { data: applications, error: appListError } = await supabaseAdmin
      .from('job_applications')
      .select('id')
      .eq('applicant_id', applicant.id);

    if (appListError || !applications) {
      throw appListError;
    }

    const applicationIds = applications.map(app => app.id);

    if (applicationIds.length === 0) {
      return NextResponse.json({
        interviews: [],
      });
    }

    // Fetch interviews for all applications
    const { data: interviews, error } = await supabaseAdmin
      .from('interviews')
      .select('*')
      .in('application_id', applicationIds)
      .order('scheduled_date', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      interviews: interviews || [],
    });
  } catch (error) {
    console.error('[v0] Interviews fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
