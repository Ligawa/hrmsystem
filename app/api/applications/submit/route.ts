import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/applications/submit
 * Handles secure submission of applicant documents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, videoLink, documents } = body;

    // Validation
    if (!email || !videoLink || !documents || documents.length === 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields: email, videoLink, and at least one document',
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Initialize Supabase
    const supabase = await createClient();
    if (!supabase) {
      console.error('[v0] Supabase client not available');
      return NextResponse.json(
        { error: 'Database service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Check for duplicate submissions
    const { data: existingSubmission } = await supabase
      .from('application_submissions')
      .select('id')
      .eq('email', email)
      .single();

    if (existingSubmission) {
      return NextResponse.json(
        {
          error: 'Application already submitted with this email. Please contact HR if you need to resubmit.',
        },
        { status: 409 }
      );
    }

    // Create submission record in Supabase
    const submittedAt = new Date().toISOString();
    const { data: submission, error: submitError } = await supabase
      .from('application_submissions')
      .insert([
        {
          email,
          video_link: videoLink,
          documents: documents,
          submitted_at: submittedAt,
          status: 'submitted',
        },
      ])
      .select()
      .single();

    if (submitError) {
      console.error('[v0] Supabase insert error:', submitError);
      return NextResponse.json(
        { error: 'Failed to save submission. Please try again.' },
        { status: 500 }
      );
    }

    console.log('[v0] Application submitted:', {
      email,
      documentCount: documents.length,
      submissionId: submission.id,
      timestamp: submittedAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        submissionId: submission.id,
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

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service temporarily unavailable' },
        { status: 503 }
      );
    }

    const { data: submissions, error } = await supabase
      .from('application_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[v0] Supabase fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        submissions: submissions || [],
        totalSubmissions: submissions?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
