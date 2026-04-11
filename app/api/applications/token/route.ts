import { NextRequest, NextResponse } from 'next/server';
import { generateApplicationToken } from '@/lib/utils/token-generator';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing applicationId' },
        { status: 400 }
      );
    }

    // Generate a unique token
    const token = generateApplicationToken();

    // Store the token in the database
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({ application_token: token })
      .eq('id', applicationId);

    if (updateError) {
      console.error('[v0] Error updating application token:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate tracking token' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        token: token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
