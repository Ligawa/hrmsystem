/**
 * Applicant Authentication Service
 * Handles registration and login for job applicants
 * NOTE: This service is for client-side reference only.
 * Use API endpoints for actual auth operations.
 */

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
 * Register a new applicant via API
 */
export async function registerApplicant(
  data: ApplicantRegistrationData
): Promise<ApplicantAuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Registration failed',
        error: result.error,
      };
    }

    return {
      success: true,
      applicantId: result.applicantId,
      message: 'Registration successful',
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
 * Login applicant with email and password via API
 */
export async function loginApplicant(
  data: ApplicantLoginData
): Promise<ApplicantAuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Login failed',
        error: result.error,
      };
    }

    return {
      success: true,
      applicantId: result.applicantId,
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
 * Login with applicant ID and email via API
 */
export async function loginWithApplicantId(
  applicantId: string,
  email: string,
  password: string
): Promise<ApplicantAuthResponse> {
  try {
    const response = await fetch('/api/auth/login-with-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicantId, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'Login failed',
        error: result.error,
      };
    }

    return {
      success: true,
      applicantId: result.applicantId,
      message: 'Login successful',
    };
  } catch (error) {
    console.error('[v0] Applicant ID login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during login',
      error: error instanceof Error ? error.message : 'UNKNOWN_ERROR',
    };
  }
}
