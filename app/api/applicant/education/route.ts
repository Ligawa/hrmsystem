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
    const { applicantId, institutionName, degreeLevel, fieldOfStudy, graduationYear } = body;

    if (!applicantId || !institutionName || !degreeLevel || !fieldOfStudy) {
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

    // Insert education record
    const { data: education, error: insertError } = await supabaseAdmin
      .from('applicant_education')
      .insert({
        applicant_id: applicant.id,
        institution_name: institutionName,
        degree_level: degreeLevel,
        field_of_study: fieldOfStudy,
        graduation_year: graduationYear,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      education,
    });
  } catch (error) {
    console.error('[v0] Education save error:', error);
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
    const educationId = searchParams.get('id');

    if (!educationId) {
      return NextResponse.json(
        { error: 'Missing education ID' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from('applicant_education')
      .delete()
      .eq('id', educationId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('[v0] Education delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
