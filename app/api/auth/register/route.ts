import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateApplicantId } from '@/lib/utils/applicant-id-generator';

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    console.log('[v0] Registration request received');
    
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

    // Create auth user
    console.log('[v0] Creating auth user for:', email);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for applicants
    });

    if (authError || !authData.user) {
      console.error('[v0] Auth error:', authError);
      return NextResponse.json(
        { error: 'Registration failed', message: authError?.message || 'Failed to create user account' },
        { status: 400 }
      );
    }

    console.log('[v0] Auth user created:', authData.user.id);

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
        auth_user_id: authData.user.id,
        status: 'active',
      })
      .select()
      .single();

    if (applicantError || !applicant) {
      console.error('[v0] Applicant creation error:', applicantError);
      // Delete the auth user if applicant creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Registration failed', message: 'Failed to create applicant profile' },
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
