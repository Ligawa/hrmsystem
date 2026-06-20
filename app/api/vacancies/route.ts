import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateJobReferenceNumber } from '@/lib/utils/job-reference-generator';

export const dynamic = 'force-dynamic';

// GET all vacancies with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not initialized' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    
    const country = searchParams.get('country');
    const department = searchParams.get('department');
    const dutyStation = searchParams.get('duty_station');
    const contractType = searchParams.get('contract_type');
    const status = searchParams.get('status') || 'open';

    let query = supabase
      .from('jobs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (country) query = query.eq('country', country);
    if (department) query = query.eq('department', department);
    if (dutyStation) query = query.eq('duty_station', dutyStation);
    if (contractType) query = query.eq('contract_type', contractType);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ vacancies: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch vacancies' },
      { status: 500 }
    );
  }
}

// POST create new vacancy
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Generate job reference number
    const jobReferenceNumber = await generateJobReferenceNumber();

    const {
      title,
      description,
      job_description,
      department,
      location,
      country,
      duty_station,
      contract_type,
      contract_duration,
      salary_range,
      salary_min,
      salary_max,
      salary_currency = 'USD',
      requirements,
      responsibilities,
      benefits,
      closing_date,
      level,
      type,
    } = body;

    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          title,
          slug: title.toLowerCase().replace(/\s+/g, '-'),
          description: job_description || description,
          job_reference_number: jobReferenceNumber,
          department,
          location,
          country,
          duty_station,
          contract_type,
          contract_duration,
          salary_range,
          salary_min,
          salary_max,
          salary_currency,
          requirements,
          responsibilities,
          benefits,
          closing_date,
          level,
          type,
          is_active: true,
          status: 'open',
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { vacancy: data, reference_number: jobReferenceNumber },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create vacancy' },
      { status: 500 }
    );
  }
}
