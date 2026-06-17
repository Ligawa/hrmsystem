'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Loader2, Search, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

interface Assessment {
  id: string
  assessment_type: string
  assessment_title: string
  submission_status: string
  score: number | null
  percentage: number | null
  passed: boolean | null
  application: {
    applicant_id: string
    full_name: string
  }
}

export default function AssessmentGradingPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('submitted')
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  useEffect(() => {
    fetchAssessments()
  }, [])

  useEffect(() => {
    filterAssessments()
  }, [assessments, searchTerm, filterStatus])

  const fetchAssessments = async () => {
    try {
      const response = await fetch('/api/assessments')
      const data = await response.json()
      setAssessments(data.assessments || [])
    } catch (err) {
      console.error('[v0] Error fetching assessments:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterAssessments = () => {
    let filtered = assessments

    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.submission_status === filterStatus)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.application.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.application.applicant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.assessment_title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAssessments(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const submittedCount = assessments.filter((a) => a.submission_status === 'submitted').length
  const gradedCount = assessments.filter((a) => a.submission_status === 'graded').length
  const passedCount = assessments.filter((a) => a.passed === true).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessment Grading</h1>
        <p className="text-muted-foreground">
          Review and grade applicant assessments
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{submittedCount}</p>
              <p className="text-sm text-muted-foreground">Pending Grading</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{gradedCount}</p>
              <p className="text-sm text-muted-foreground">Graded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{passedCount}</p>
              <p className="text-sm text-muted-foreground">Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{assessments.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, or assessment title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Assessments List */}
        <Card>
          <CardHeader>
            <CardTitle>Assessments ({filteredAssessments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAssessments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No assessments found
              </p>
            ) : (
              <div className="space-y-2">
                {filteredAssessments.map((assessment) => (
                  <Link
                    key={assessment.id}
                    href={`/setup/assessments/grade/${assessment.id}`}
                  >
                    <button className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <div className="flex-1">
                        <p className="font-medium">{assessment.assessment_title}</p>
                        <p className="text-sm text-gray-500">
                          {assessment.application.full_name} ({assessment.application.applicant_id})
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {assessment.score !== null && (
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {assessment.score}/{assessment.percentage ? '100' : '?'}
                            </p>
                            {assessment.percentage && (
                              <p className="text-sm text-gray-500">
                                {Math.round(assessment.percentage)}%
                              </p>
                            )}
                          </div>
                        )}
                        {assessment.passed === true && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {assessment.passed === false && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <Badge variant="outline">
                          {assessment.submission_status}
                        </Badge>
                      </div>
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
