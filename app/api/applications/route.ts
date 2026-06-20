import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// GET applicant's applications or admin view
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const applicantId = searchParams.get('applicant_id');
    const jobReferenceNumber = searchParams.get('job_reference');
    const status = searchParams.get('status');

    let query = supabase
      .from('job_applications')
      .select(`
        *,
        jobs:job_id (
          title,
          job_reference_number,
          department,
          country,
          duty_station
        ),
        applicants:applicant_id (
          applicant_id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (applicantId) {
      query = query.eq('applicant_id', applicantId);
    }

    if (jobReferenceNumber) {
      query = query.eq('job_reference_number', jobReferenceNumber);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ applications: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// POST submit new application
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      applicant_id,
      job_id,
      cover_letter,
      resume_url,
      full_name,
      email,
      phone,
    } = body;

    if (!applicant_id || !job_id) {
      return NextResponse.json(
        { error: 'Applicant ID and Job ID are required' },
        { status: 400 }
      );
    }

    // Get the applicant UUID from the applicant_id string
    const { data: applicants, error: appError } = await supabase
      .from('applicants')
      .select('id')
      .eq('applicant_id', applicant_id)
      .single();

    if (appError || !applicants) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    const applicantUUID = applicants.id;

    // Check if applicant already applied for this job
    const { data: existingApp } = await supabase
      .from('job_applications')
      .select('id')
      .eq('applicant_id', applicantUUID)
      .eq('job_id', job_id)
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: 'You have already applied for this position' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          applicant_id: applicantUUID,
          job_id,
          cover_letter,
          resume_url,
          full_name,
          email,
          phone,
          status: 'pending',
          submission_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
