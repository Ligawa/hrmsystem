import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create test applicants
    const testApplicants = [
      {
        email: 'john.doe@example.com',
        password: 'Test123456!',
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        email: 'sarah.smith@example.com',
        password: 'Test123456!',
        firstName: 'Sarah',
        lastName: 'Smith',
      },
      {
        email: 'anna.wilson@example.com',
        password: 'Test123456!',
        firstName: 'Anna',
        lastName: 'Wilson',
      },
    ];

    const results = [];

    for (const applicant of testApplicants) {
      try {
        // Check if user already exists in Supabase Auth
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const userExists = existingUsers?.users.some(u => u.email === applicant.email);

        if (userExists) {
          console.log(`User ${applicant.email} already exists, skipping`);
          continue;
        }

        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: applicant.email,
          password: applicant.password,
          email_confirm: true,
          user_metadata: {
            first_name: applicant.firstName,
            last_name: applicant.lastName,
          },
        });

        if (authError) {
          console.error(`Error creating auth user for ${applicant.email}:`, authError);
          results.push({
            email: applicant.email,
            status: 'failed',
            error: authError.message,
          });
          continue;
        }

        if (!authData.user) {
          results.push({
            email: applicant.email,
            status: 'failed',
            error: 'Failed to create auth user',
          });
          continue;
        }

        // Generate applicant ID
        const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        const applicantId = `APP-2026-${randomSuffix}`;

        // Create applicant record
        const { data: applicantData, error: appError } = await supabase
          .from('applicants')
          .insert({
            applicant_id: applicantId,
            first_name: applicant.firstName,
            last_name: applicant.lastName,
            email: applicant.email,
            auth_user_id: authData.user.id,
            status: 'active',
          })
          .select()
          .single();

        if (appError) {
          console.error(`Error creating applicant for ${applicant.email}:`, appError);
          results.push({
            email: applicant.email,
            status: 'failed',
            error: appError.message,
          });
          continue;
        }

        // Create professional details
        await supabase.from('applicant_professional_details').insert({
          applicant_id: applicantData.id,
          current_job_title: 'Senior Health Officer',
          current_organization: 'Ministry of Health',
          years_of_experience: 5,
          current_employment_type: 'Full-time',
        });

        // Create personal details
        await supabase.from('applicant_personal_details').insert({
          applicant_id: applicantData.id,
          current_country: 'Kenya',
          marital_status: 'Single',
        });

        // Create sample education
        await supabase.from('applicant_education').insert({
          applicant_id: applicantData.id,
          degree_level: "Master's",
          field_of_study: 'Public Health',
          institution_name: 'University of Example',
          graduation_year: 2020,
        });

        // Create sample work experience
        await supabase.from('applicant_work_experience').insert({
          applicant_id: applicantData.id,
          job_title: 'Health Officer',
          organization: 'Ministry of Health',
          employment_type: 'Full-time',
          start_date: '2019-01-15',
          is_current: true,
        });

        results.push({
          email: applicant.email,
          status: 'success',
          applicantId: applicantId,
          userId: authData.user.id,
        });

        console.log(`Successfully created test applicant: ${applicant.email}`);
      } catch (error) {
        console.error(`Unexpected error for ${applicant.email}:`, error);
        results.push({
          email: applicant.email,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seed data creation complete',
      results,
    });
  } catch (error) {
    console.error('[v0] Seed endpoint error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
