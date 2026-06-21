import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendApplicationSubmittedEmail } from '@/lib/services/application-notification-service';
import { createSafeErrorResponse, handleSupabaseError, logError } from '@/lib/utils/error-handler';

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
      const errorResponse = handleSupabaseError(error, 'GET /api/applications: Query failed');
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    return NextResponse.json({ applications: data || [] });
  } catch (error) {
    const errorResponse = createSafeErrorResponse('service', 500, 'GET /api/applications: Uncaught exception', error || new Error('Unknown error'));
    return NextResponse.json(errorResponse, { status: errorResponse.status });
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

    if (!job_id || !email || !full_name) {
      return NextResponse.json(
        { error: 'Job ID, email, and full name are required' },
        { status: 400 }
      );
    }

    // Extract first and last name from full_name
    const nameParts = full_name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || 'Applicant';

    let applicantUUID = null;

    // If applicant_id is provided, validate they exist
    if (applicant_id) {
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

      applicantUUID = applicants.id;

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
          { status: 409 }
        );
      }
    } else {
      // External applicant - check if already exists by email
      const { data: existingApplicant } = await supabase
        .from('applicants')
        .select('id')
        .eq('email', email)
        .single();

      if (existingApplicant) {
        applicantUUID = existingApplicant.id;

        // Check if this applicant already applied for this job
        const { data: existingApp } = await supabase
          .from('job_applications')
          .select('id')
          .eq('applicant_id', applicantUUID)
          .eq('job_id', job_id)
          .single();

        if (existingApp) {
          return NextResponse.json(
            { error: 'You have already applied for this position' },
            { status: 409 }
          );
        }
      } else {
        // Create new external applicant record
        const { data: newApplicant, error: createError } = await supabase
          .from('applicants')
          .insert([
            {
              applicant_id: `EXT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
              first_name: firstName,
              last_name: lastName,
              email,
              phone: phone || null,
              status: 'active',
            },
          ])
          .select('id')
          .single();

        if (createError || !newApplicant) {
          // Check if it's a duplicate email issue
          if (createError?.message?.includes('duplicate') || createError?.message?.includes('unique')) {
            // Try to get the existing applicant again
            const { data: existingApplicant2 } = await supabase
              .from('applicants')
              .select('id')
              .eq('email', email)
              .single();

            if (existingApplicant2) {
              applicantUUID = existingApplicant2.id;
            } else {
              const errorResponse = handleSupabaseError(createError, 'POST /api/applications: Failed to create applicant');
              return NextResponse.json(errorResponse, { status: errorResponse.status });
            }
          } else {
            const errorResponse = handleSupabaseError(createError, 'POST /api/applications: Failed to create applicant');
            return NextResponse.json(errorResponse, { status: errorResponse.status });
          }
        } else {
          applicantUUID = newApplicant.id;
        }
      }
    }

    // Now create the job application
    const { data, error } = await supabase
      .from('job_applications')
      .insert([
        {
          applicant_id: applicantUUID,
          job_id,
          cover_letter: cover_letter || null,
          resume_url: resume_url || null,
          application_status: 'submitted',
          submission_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      const errorResponse = handleSupabaseError(error, 'POST /api/applications: Insert failed');
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    }

    // Send confirmation email to applicant (non-blocking - don't wait)
    try {
      const jobData = await supabase
        .from('jobs')
        .select('title')
        .eq('id', job_id)
        .single();

      if (!jobData.error && jobData.data) {
        // Fire and forget - don't wait for email
        sendApplicationSubmittedEmail({
          applicantName: full_name,
          applicantEmail: email,
          position: jobData.data.title,
          applicationId: data.id,
        }).catch((err) => {
          logError('Failed to send application submitted email', err, {
            applicantEmail: email,
            applicationId: data.id,
          });
        });
      }
    } catch (emailError) {
      // Log but don't fail the application submission
      logError('Error sending application email', emailError, { email });
    }

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    const errorResponse = createSafeErrorResponse('service', 500, 'POST /api/applications: Uncaught exception', error || new Error('Unknown error'));
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
