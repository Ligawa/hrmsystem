import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { assessmentId } = params
    const { responses, comments } = await request.json()

    if (!assessmentId || !responses) {
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

    // Update responses with grading
    let totalScore = 0
    for (const response of responses) {
      const { data: result, error } = await supabase
        .from('assessment_responses')
        .update({
          marks_obtained: response.marks,
          feedback: response.feedback
        })
        .eq('id', response.responseId)
        .eq('assessment_id', assessmentId)

      if (!error) {
        totalScore += response.marks || 0
      }
    }

    // Update assessment with final score
    const { data: assessment } = await supabase
      .from('assessments')
      .select('total_marks, passing_score')
      .eq('id', assessmentId)
      .single()

    const percentage = assessment.total_marks ? (totalScore / assessment.total_marks) * 100 : 0
    const passed = totalScore >= (assessment.passing_score || 0)

    const { data: updatedAssessment, error: updateError } = await supabase
      .from('assessments')
      .update({
        score: totalScore,
        percentage: parseFloat(percentage.toFixed(2)),
        passed,
        submission_status: 'graded',
        reviewed_by: user.id,
        reviewer_comments: comments,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save grades' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment,
      message: 'Assessment graded successfully'
    })
  } catch (error) {
    console.error('[v0] Grading error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
