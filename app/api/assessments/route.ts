import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { applicationId, assessmentType, responses } = await request.json()

    if (!applicationId || !assessmentType || !responses) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get assessment with questions
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*, assessment_questions(*)')
      .eq('application_id', applicationId)
      .eq('assessment_type', assessmentType)
      .single()

    if (assessmentError) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Auto-score MCQ responses
    let totalScore = 0
    const scoredResponses = []

    for (const response of responses) {
      const question = assessment.assessment_questions.find((q: any) => q.id === response.questionId)
      if (!question) continue

      let isCorrect = false
      let marks = 0

      if (question.question_type === 'mcq') {
        isCorrect = response.answer === question.correct_answer
        marks = isCorrect ? question.marks : 0
      } else if (question.question_type === 'short_answer') {
        // For short answers, require manual review
        marks = 0
        isCorrect = null
      } else {
        marks = 0
      }

      totalScore += marks

      // Save response
      const { error: responseError } = await supabase
        .from('assessment_responses')
        .insert({
          assessment_id: assessment.id,
          question_id: response.questionId,
          applicant_response: response.answer,
          marks_obtained: marks,
          is_correct: isCorrect
        })

      if (!responseError) {
        scoredResponses.push({
          questionId: response.questionId,
          isCorrect,
          marks
        })
      }
    }

    // Calculate percentage
    const percentage = assessment.total_marks ? (totalScore / assessment.total_marks) * 100 : 0
    const passed = totalScore >= (assessment.passing_score || 0)

    // Update assessment with score
    const { data: updatedAssessment, error: updateError } = await supabase
      .from('assessments')
      .update({
        score: totalScore,
        percentage: parseFloat(percentage.toFixed(2)),
        passed,
        submission_status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .eq('id', assessment.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to save assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment,
      totalScore,
      percentage,
      passed,
      message: 'Assessment submitted successfully'
    })
  } catch (error) {
    console.error('[v0] Assessment submission error:', error)
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
    const assessmentId = searchParams.get('assessmentId')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('assessments')
      .select('*, assessment_questions(*)')

    if (assessmentId) {
      query = query.eq('id', assessmentId)
    } else if (applicationId) {
      query = query.eq('application_id', applicationId)
    } else {
      return NextResponse.json(
        { error: 'Assessment or Application ID required' },
        { status: 400 }
      )
    }

    const { data: assessments, error } = await query

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      assessments: assessmentId ? assessments?.[0] : assessments 
    })
  } catch (error) {
    console.error('[v0] Fetch assessments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
