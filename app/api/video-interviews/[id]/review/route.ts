import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const interviewId = params.id
    const {
      overallRating,
      communicationScore,
      technicalScore,
      presentationScore,
      confidenceScore,
      feedback
    } = await request.json()

    if (!interviewId || !overallRating) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin/recruiter
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'recruiter'].includes(userData.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update video interview with scores
    const { data: updatedInterview, error } = await supabase
      .from('video_interviews')
      .update({
        overall_rating: overallRating,
        communication_score: communicationScore,
        technical_score: technicalScore,
        presentation_score: presentationScore,
        confidence_score: confidenceScore,
        reviewer_feedback: feedback,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        upload_status: 'approved'
      })
      .eq('id', interviewId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save review' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      interview: updatedInterview,
      message: 'Video interview reviewed successfully'
    })
  } catch (error) {
    console.error('[v0] Video review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
