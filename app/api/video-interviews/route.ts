import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { applicationId, videoBlob, durationSeconds } = await request.json()

    if (!applicationId || !videoBlob) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify applicant owns this application
    const { data: application } = await supabase
      .from('job_applications')
      .select('id, applicant_email')
      .eq('id', applicationId)
      .single()

    if (!application || application.applicant_email !== user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create or update video interview record
    const { data: interview, error } = await supabase
      .from('video_interviews')
      .upsert({
        application_id: applicationId,
        video_url: `videos/${applicationId}/interview.webm`,
        duration_seconds: durationSeconds,
        file_size: videoBlob.length,
        upload_status: 'submitted',
        submitted_at: new Date().toISOString()
      }, { onConflict: 'application_id' })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save video interview' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      interview,
      message: 'Video interview submitted successfully'
    })
  } catch (error) {
    console.error('[v0] Video upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID required' },
        { status: 400 }
      )
    }

    const { data: interview, error } = await supabase
      .from('video_interviews')
      .select('*')
      .eq('application_id', applicationId)
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch video interview' },
        { status: 500 }
      )
    }

    return NextResponse.json({ interview: interview || null })
  } catch (error) {
    console.error('[v0] Fetch video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
