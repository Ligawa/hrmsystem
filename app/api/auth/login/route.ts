import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.error('[v0] Supabase not configured');
      return NextResponse.json(
        { error: 'Service unavailable', message: 'Authentication service not properly configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing credentials', message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Verify applicant exists with this email
    const { data: applicant, error: applicantError } = await supabaseAdmin
      .from('applicants')
      .select('id, applicant_id, first_name, last_name, email, auth_user_id')
      .eq('email', email)
      .maybeSingle();

    if (applicantError || !applicant) {
      console.log('[v0] Applicant not found:', email);
      return NextResponse.json(
        { error: 'Login failed', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get the auth user
    const { data: { users }, error: getUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (getUsersError || !users) {
      console.error('[v0] Failed to list users:', getUsersError);
      return NextResponse.json(
        { error: 'Login failed', message: 'Authentication service error' },
        { status: 500 }
      );
    }

    const authUser = users.find(u => u.email === email);
    if (!authUser) {
      console.log('[v0] Auth user not found:', email);
      return NextResponse.json(
        { error: 'Login failed', message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('[v0] Applicant logged in successfully:', applicant.applicant_id);

    // Create a session token (for now, just return success)
    // In a real app, you'd create a session or return a JWT
    const response = NextResponse.json(
      {
        success: true,
        applicantId: applicant.applicant_id,
        user: {
          id: applicant.auth_user_id,
          email: applicant.email,
          firstName: applicant.first_name,
          lastName: applicant.last_name,
        },
        message: 'Login successful',
      },
      { status: 200 }
    );

    // Set a simple session cookie for client-side auth tracking
    response.cookies.set('applicant_id', applicant.applicant_id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[v0] Login error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
