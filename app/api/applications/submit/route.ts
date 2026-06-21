import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * POST /api/applications/submit
 * Handles secure submission of job applications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_id, full_name, email, phone, cover_letter, resume_url, status, submission_deadline } = body;

    // Validation
    if (!job_id || !full_name || !email) {
      return NextResponse.json(
        {
          error: 'Missing required fields: job_id, full_name, and email',
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Initialize Supabase with service role
    const supabase = await createServiceRoleClient();
    if (!supabase) {
      console.error('[v0] Supabase client not available');
      return NextResponse.json(
        { error: 'Database service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Create job application record in Supabase
    const submittedAt = new Date().toISOString();
    const { data: application, error: submitError } = await supabase
      .from('job_applications')
      .insert([
        {
          job_id,
          full_name,
          email,
          phone: phone || null,
          cover_letter: cover_letter || null,
          resume_url: resume_url || null,
          status: status || 'pending',
          submission_deadline: submission_deadline || null,
          applied_at: submittedAt,
        },
      ])
      .select()
      .single();

    if (submitError) {
      console.error('[v0] Supabase insert error:', submitError);
      return NextResponse.json(
        { error: 'Failed to save application. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[v0] Application submitted:', {
      email,
      full_name,
      job_id,
      applicationId: application.id,
      timestamp: submittedAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        id: application.id,
        applicationId: application.id,
        submittedAt: submittedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications/submit
 * Retrieves all submissions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // In production, verify admin authentication here
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service temporarily unavailable' },
        { status: 503 }
      );
    }

    const { data: applications, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('[v0] Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        applications: applications || [],
        totalApplications: applications?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
