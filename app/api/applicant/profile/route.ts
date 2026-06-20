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

    // Fetch basic applicant info
    const { data: applicant, error: appError } = await supabaseAdmin
      .from('applicants')
      .select('*')
      .eq('applicant_id', applicantId)
      .maybeSingle();

    if (appError || !applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    // Fetch personal details
    const { data: personalDetails } = await supabaseAdmin
      .from('applicant_personal_details')
      .select('*')
      .eq('applicant_id', applicant.id)
      .maybeSingle();

    // Fetch professional details
    const { data: professionalDetails } = await supabaseAdmin
      .from('applicant_professional_details')
      .select('*')
      .eq('applicant_id', applicant.id)
      .maybeSingle();

    // Fetch education
    const { data: education } = await supabaseAdmin
      .from('applicant_education')
      .select('*')
      .eq('applicant_id', applicant.id);

    // Fetch work experience
    const { data: workExperience } = await supabaseAdmin
      .from('applicant_work_experience')
      .select('*')
      .eq('applicant_id', applicant.id)
      .order('start_date', { ascending: false });

    return NextResponse.json({
      ...applicant,
      personalDetails: personalDetails || {},
      professionalDetails: professionalDetails || {},
      education: education || [],
      workExperience: workExperience || [],
    });
  } catch (error) {
    console.error('[v0] Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
