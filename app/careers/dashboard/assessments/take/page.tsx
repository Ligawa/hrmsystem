'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react'

interface Question {
  id: string
  question_number: number
  question_text: string
  question_type: string
  marks: number
  options?: any[]
}

interface Assessment {
  id: string
  assessment_type: string
  assessment_title: string
  description: string
  total_questions: number
  total_marks: number
  duration_minutes: number
}

export default function AssessmentPage() {
  const params = useParams()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchAssessment()
  }, [assessmentId])

  useEffect(() => {
    if (!assessment || submitted) return

    const totalSeconds = assessment.duration_minutes * 60
    setTimeLeft(totalSeconds)

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [assessment, submitted])

  const fetchAssessment = async () => {
    try {
      const response = await fetch(`/api/assessments?assessmentId=${assessmentId}`)
      const data = await response.json()

      if (response.ok && data.assessments) {
        const assessment = data.assessments
        setAssessment(assessment)
        setQuestions(assessment.assessment_questions || [])

        // Initialize responses
        const initialResponses: Record<string, string> = {}
        assessment.assessment_questions?.forEach((q: Question) => {
          initialResponses[q.id] = ''
        })
        setResponses(initialResponses)
      }
    } catch (err) {
      setError('Failed to load assessment')
      console.error('[v0] Error fetching assessment:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (submitted) return

    setSubmitting(true)
    setError('')

    try {
      const formattedResponses = Object.entries(responses).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: params.id,
          assessmentType: assessment?.assessment_type,
          responses: formattedResponses
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Assessment Submitted</CardTitle>
            <CardDescription>
              Your assessment has been successfully submitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Assessment:</span> {assessment?.assessment_title}
              </p>
              <p className="text-sm">
                <span className="font-medium">Questions Answered:</span> {Object.values(responses).filter(r => r).length} / {questions.length}
              </p>
            </div>
            <Link href="/careers/dashboard">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/careers/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Assessment</h1>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Assessment not found or has no questions</AlertDescription>
        </Alert>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const answered = Object.values(responses).filter(r => r).length
  const progress = (answered / questions.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/careers/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{assessment.assessment_title}</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Clock className="h-5 w-5 text-blue-600" />
          <span className="font-mono font-bold text-blue-900">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}% ({answered}/{questions.length} answered)</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestion + 1}</span>
            <Badge>{question.marks} mark{question.marks > 1 ? 's' : ''}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium">{question.question_text}</p>

          <div className="space-y-3">
            {question.question_type === 'mcq' && question.options ? (
              question.options.map((option: any, idx: number) => (
                <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.text}
                    checked={responses[question.id] === option.text}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    className="h-4 w-4"
                  />
                  <span>{option.text}</span>
                </label>
              ))
            ) : (
              <textarea
                value={responses[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2 justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestion < questions.length - 1 && (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
            >
              Next
            </Button>
          )}

          {currentQuestion === questions.length - 1 && (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Assessment'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle>Questions Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  idx === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : responses[q.id]
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
