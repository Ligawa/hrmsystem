/**
 * Applicant Authentication Service
 * Handles registration and login for job applicants
 */

import { createClient } from '@/lib/supabase/server';
import { generateApplicantId } from '@/lib/utils/applicant-id-generator';

export interface ApplicantRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ApplicantLoginData {
  email: string;
  password: string;
}

export interface ApplicantAuthResponse {
  success: boolean;
  applicantId?: string;
  message: string;
  error?: string;
}

/**
 * Register a new applicant
 */
export async function registerApplicant(
  data: ApplicantRegistrationData
): Promise<ApplicantAuthResponse> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return {
        success: false,
        message: 'Failed to initialize Supabase client',
        error: 'SUPABASE_ERROR',
      };
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      return {
        success: false,
        message: authError.message,
        error: authError.code,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'Failed to create user account',
        error: 'NO_USER_CREATED',
      };
    }

    // Generate unique applicant ID
    let applicantId = generateApplicantId();
    let idExists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (idExists && attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('applicants')
        .select('id')
        .eq('applicant_id', applicantId)
        .single();

      if (!existing) {
        idExists = false;
        break;
      }

      applicantId = generateApplicantId();
      attempts++;
    }

    if (idExists) {
      // Clean up auth user if we couldn't generate unique ID
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        message: 'Failed to generate unique applicant ID',
        error: 'ID_GENERATION_FAILED',
      };
    }

    // Create applicant record
    const { error: applicantError } = await supabase.from('applicants').insert([
      {
        applicant_id: applicantId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || null,
        auth_user_id: authData.user.id,
        status: 'active',
      },
    ]);

    if (applicantError) {
      // Clean up auth user if we couldn't create applicant record
      await supabase.auth.admin.deleteUser(authData.user.id);
      return {
        success: false,
        message: 'Failed to create applicant profile',
        error: applicantError.message,
      };
    }

    return {
      success: true,
      applicantId: applicantId,
      message: 'Registration successful. Please check your email to confirm your account.',
    };
  } catch (error) {
    console.error('[v0] Applicant registration error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during registration',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Login applicant with email and password
 */
export async function loginApplicant(
  data: ApplicantLoginData
): Promise<ApplicantAuthResponse> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return {
        success: false,
        message: 'Failed to initialize Supabase client',
        error: 'SUPABASE_ERROR',
      };
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      return {
        success: false,
        message: authError.message,
        error: authError.code,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: 'Login failed',
        error: 'NO_USER',
      };
    }

    // Get applicant ID
    const { data: applicantData } = await supabase
      .from('applicants')
      .select('applicant_id, status')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (!applicantData) {
      return {
        success: false,
        message: 'Applicant profile not found',
        error: 'PROFILE_NOT_FOUND',
      };
    }

    if (applicantData.status !== 'active') {
      return {
        success: false,
        message: 'Your account has been deactivated',
        error: 'ACCOUNT_INACTIVE',
      };
    }

    return {
      success: true,
      applicantId: applicantData.applicant_id,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('[v0] Applicant login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during login',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    };
  }
}

/**
 * Login with applicant ID and email (alternative login method)
 */
export async function loginWithApplicantId(
  applicantId: string,
  email: string,
  password: string
): Promise<ApplicantAuthResponse> {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return {
        success: false,
        message: 'Failed to initialize Supabase client',
        error: 'SUPABASE_ERROR',
      };
    }

    // Verify applicant ID matches email
    const { data: applicantData } = await supabase
      .from('applicants')
      .select('id, auth_user_id')
      .eq('applicant_id', applicantId)
      .eq('email', email)
      .single();

    if (!applicantData) {
      return {
        success: false,
        message: 'Invalid applicant ID or email',
        error: 'INVALID_CREDENTIALS',
      };
    }

    // Perform login with email and password
    return loginApplicant({ email, password });
  } catch (error) {
    console.error('[v0] Applicant ID login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during login',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    };
  }
}
