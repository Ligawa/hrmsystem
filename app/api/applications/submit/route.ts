import { NextRequest, NextResponse } from 'next/server';

interface ApplicationSubmission {
  email: string;
  videoLink: string;
  documents: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  submittedAt: string;
}

// In-memory storage for demo (in production, use a database)
const submissions: ApplicationSubmission[] = [];

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

    // Check for duplicate submissions
    const existingSubmission = submissions.find((s) => s.email === email);
    if (existingSubmission) {
      return NextResponse.json(
        {
          error: 'Application already submitted with this email. Please contact HR if you need to resubmit.',
        },
        { status: 409 }
      );
    }

    // Create submission record
    const submission: ApplicationSubmission = {
      email,
      videoLink,
      documents,
      submittedAt: new Date().toISOString(),
    };

    // Store submission
    submissions.push(submission);

    console.log('[v0] Application submitted:', {
      email,
      documentCount: documents.length,
      timestamp: submission.submittedAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Application submitted successfully',
        submissionId: `APP-${Date.now()}`,
        submittedAt: submission.submittedAt,
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
  // In production, verify admin authentication here
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(
    {
      submissions,
      totalSubmissions: submissions.length,
    },
    { status: 200 }
  );
}
