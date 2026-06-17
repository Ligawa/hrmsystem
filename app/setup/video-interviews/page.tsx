'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Search, Star, MessageSquare } from 'lucide-react'

interface VideoInterview {
  id: string
  application_id: string
  overall_rating: number | null
  duration_seconds: number
  upload_status: string
  application: {
    applicant_id: string
    full_name: string
  }
  submitted_at: string
}

export default function VideoInterviewsReviewPage() {
  const [interviews, setInterviews] = useState<VideoInterview[]>([])
  const [filteredInterviews, setFilteredInterviews] = useState<VideoInterview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInterview, setSelectedInterview] = useState<VideoInterview | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Review form state
  const [overallRating, setOverallRating] = useState(3)
  const [communicationScore, setCommunicationScore] = useState(3)
  const [technicalScore, setTechnicalScore] = useState(3)
  const [presentationScore, setPresentationScore] = useState(3)
  const [confidenceScore, setConfidenceScore] = useState(3)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    fetchInterviews()
  }, [])

  useEffect(() => {
    filterInterviews()
  }, [interviews, searchTerm])

  const fetchInterviews = async () => {
    try {
      const response = await fetch('/api/video-interviews')
      const data = await response.json()
      setInterviews(data.interviews || [])
    } catch (err) {
      console.error('[v0] Error fetching interviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterInterviews = () => {
    let filtered = interviews

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.application.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.application.applicant_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredInterviews(filtered)
  }

  const handleSubmitReview = async () => {
    if (!selectedInterview) return

    setSubmitting(true)

    try {
      const response = await fetch(`/api/video-interviews/${selectedInterview.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overallRating,
          communicationScore,
          technicalScore,
          presentationScore,
          confidenceScore,
          feedback
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Review failed')
      }

      // Update interviews list
      setInterviews(
        interviews.map((i) =>
          i.id === selectedInterview.id
            ? { ...i, overall_rating: overallRating }
            : i
        )
      )

      // Reset form
      setShowReviewForm(false)
      setFeedback('')
      setOverallRating(3)
      setCommunicationScore(3)
      setTechnicalScore(3)
      setPresentationScore(3)
      setConfidenceScore(3)
    } catch (err) {
      console.error('[v0] Review error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const ratedCount = interviews.filter((i) => i.overall_rating !== null).length
  const pendingCount = interviews.filter((i) => i.overall_rating === null).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Video Interview Reviews</h1>
        <p className="text-muted-foreground">
          Rate and provide feedback on applicant video interviews
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{ratedCount}</p>
              <p className="text-sm text-muted-foreground">Reviewed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or applicant ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Interviews List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Video Interviews ({filteredInterviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInterviews.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No interviews found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredInterviews.map((interview) => (
                    <button
                      key={interview.id}
                      onClick={() => {
                        setSelectedInterview(interview)
                        setShowReviewForm(false)
                      }}
                      className={`w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left ${
                        selectedInterview?.id === interview.id
                          ? 'border-blue-500 bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{interview.application.full_name}</p>
                        <p className="text-sm text-gray-500">
                          {interview.application.applicant_id} • {formatDuration(interview.duration_seconds)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {interview.overall_rating && (
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < interview.overall_rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {!interview.overall_rating && (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Panel */}
        {selectedInterview && (
          <Card>
            <CardHeader>
              <CardTitle>Review Interview</CardTitle>
              <CardDescription>
                {selectedInterview.application.full_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p>
                  <span className="font-medium">Applicant ID:</span> {selectedInterview.application.applicant_id}
                </p>
                <p>
                  <span className="font-medium">Duration:</span> {formatDuration(selectedInterview.duration_seconds)}
                </p>
                <p>
                  <span className="font-medium">Submitted:</span>{' '}
                  {new Date(selectedInterview.submitted_at).toLocaleDateString()}
                </p>
              </div>

              {!showReviewForm ? (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full gap-2"
                  disabled={submitting}
                >
                  <MessageSquare className="h-4 w-4" />
                  {selectedInterview.overall_rating ? 'Update Review' : 'Write Review'}
                </Button>
              ) : (
                <div className="border-t pt-4 space-y-4">
                  {/* Rating Scales */}
                  {[
                    { label: 'Overall Rating', value: overallRating, onChange: setOverallRating },
                    { label: 'Communication', value: communicationScore, onChange: setCommunicationScore },
                    { label: 'Technical', value: technicalScore, onChange: setTechnicalScore },
                    { label: 'Presentation', value: presentationScore, onChange: setPresentationScore },
                    { label: 'Confidence', value: confidenceScore, onChange: setConfidenceScore }
                  ].map((scale) => (
                    <div key={scale.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">{scale.label}</label>
                        <span className="text-sm font-bold">{scale.value}/5</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => scale.onChange(rating)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                rating <= scale.value
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Feedback */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback</label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide constructive feedback..."
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowReviewForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitReview}
                      className="flex-1"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Review'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
