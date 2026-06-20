import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateApplicantId } from '@/lib/utils/applicant-id-generator';

// Helper function to initialize Supabase - deferred to request time
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[v0] Supabase env vars not configured:', {
      url: supabaseUrl ? 'SET' : 'NOT SET',
      key: supabaseServiceKey ? 'SET' : 'NOT SET',
    });
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Registration request received');
    
    // Initialize Supabase at request time
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check if Supabase is configured
    if (!supabaseAdmin) {
      console.error('[v0] Supabase not configured');
      return NextResponse.json(
        { error: 'Service unavailable', message: 'Authentication service not properly configured' },
        { status: 503 }
      );
    }
    
    const body = await request.json();
    const { firstName, lastName, email, password, phone } = body;
    console.log('[v0] Registration data:', { firstName, lastName, email, phone });

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Please provide first name, last name, email, and password' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Invalid password', message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists in applicants table
    const { data: existingApplicant } = await supabaseAdmin
      .from('applicants')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingApplicant) {
      return NextResponse.json(
        { error: 'Email already registered', message: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create auth user - try admin.createUser first, fall back to signUp if needed
    console.log('[v0] Creating auth user for:', email);
    let authData;
    let authError;
    
    try {
      // First, try using admin.createUser with email confirmation
      const result = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for applicants
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });
      authData = result.data;
      authError = result.error;
    } catch (err) {
      console.error('[v0] Admin createUser threw exception:', err);
      // If admin.createUser fails with database error, it might be a server-side issue
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: 'Registration failed', 
          message: 'Unable to create user account. Please try again later.',
          details: err instanceof Error ? err.message : 'Unknown error'
        },
        { status: 503 }
      );
    }

    if (authError) {
      console.error('[v0] Auth error:', authError);
      console.error('[v0] Auth error details:', {
        status: authError?.status,
        code: authError?.code,
        message: authError?.message,
      });
      return NextResponse.json(
        { error: 'Registration failed', message: authError?.message || 'Failed to create user account' },
        { status: 400 }
      );
    }

    if (!authData?.user?.id) {
      console.error('[v0] No user ID returned from auth creation');
      return NextResponse.json(
        { error: 'Registration failed', message: 'Failed to create user account - no user ID returned' },
        { status: 400 }
      );
    }

    const userId = authData.user.id;
    console.log('[v0] Auth user created:', userId);

    // Generate unique applicant ID
    const applicantId = generateApplicantId();

    // Create applicant record
    console.log('[v0] Creating applicant record:', applicantId);
    const { data: applicant, error: applicantError } = await supabaseAdmin
      .from('applicants')
      .insert({
        applicant_id: applicantId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        auth_user_id: userId,
        status: 'active',
      })
      .select()
      .single();

    if (applicantError || !applicant) {
      console.error('[v0] Applicant creation error:', applicantError);
      console.error('[v0] Applicant error details:', {
        code: applicantError?.code,
        message: applicantError?.message,
        details: applicantError?.details,
        hint: applicantError?.hint,
      });
      // Delete the auth user if applicant creation fails
      try {
        console.log('[v0] Cleaning up - deleting auth user:', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error('[v0] Failed to delete auth user:', deleteError);
      }
      return NextResponse.json(
        { 
          error: 'Registration failed', 
          message: applicantError?.message || 'Failed to create applicant profile',
          details: applicantError?.details || applicantError?.hint || 'Check database schema and constraints',
        },
        { status: 400 }
      );
    }

    console.log('[v0] Applicant registered successfully:', applicantId);

    return NextResponse.json(
      {
        success: true,
        applicantId: applicantId,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
