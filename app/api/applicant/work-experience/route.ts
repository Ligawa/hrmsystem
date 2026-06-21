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

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { applicantId, jobTitle, organization, employmentType, startDate, endDate, description } = body;

    if (!applicantId || !jobTitle || !organization || !employmentType || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get applicant by applicant_id (public ID)
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

    // Insert work experience record
    const { data: workExperience, error: insertError } = await supabaseAdmin
      .from('applicant_work_experience')
      .insert({
        applicant_id: applicant.id,
        job_title: jobTitle,
        organization: organization,
        employment_type: employmentType,
        start_date: startDate,
        end_date: endDate || null,
        description: description || null,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      workExperience,
    });
  } catch (error) {
    console.error('[v0] Work experience save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('id');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Missing experience ID' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('applicant_work_experience')
      .delete()
      .eq('id', experienceId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[v0] Work experience delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
