'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Clock, Upload } from 'lucide-react'
import Link from 'next/link'

interface Portal {
  id: string
  portal_token: string
  deadline: string
  required_documents: string[]
  status: string
  isClosed: boolean
  timeRemaining: number
  applications: {
    applicant_name: string
    job_title: string
    applicant_email: string
  }
}

interface SubmittedDocument {
  id: string
  documentType: string
  submittedAt: string
}

export default function PortalPage() {
  const params = useParams()
  const token = params.token as string
  
  const [portal, setPortal] = useState<Portal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submittedDocs, setSubmittedDocs] = useState<SubmittedDocument[]>([])
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    fetchPortalDetails()
  }, [token])

  useEffect(() => {
    if (!portal) return

    const updateTimer = () => {
      const deadline = new Date(portal.deadline)
      const now = new Date()
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('Portal has closed')
        setPortal(prev => prev ? { ...prev, isClosed: true } : null)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft(`${days}d ${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [portal])

  async function fetchPortalDetails() {
    try {
      const response = await fetch(`/api/portals/${token}/get`)
      if (!response.ok) throw new Error('Portal not found')
      
      const { portal } = await response.json()
      setPortal(portal)
    } catch (err) {
      setError('Portal not found or has expired')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.FormEvent, docType: string) {
    e.preventDefault()
    const formElement = e.target as HTMLFormElement
    const fileInput = formElement.querySelector('input[type="file"]') as HTMLInputElement
    const urlInput = formElement.querySelector('input[type="url"]') as HTMLInputElement

    if (!fileInput?.files?.[0] && !urlInput?.value) {
      setError('Please provide either a file or a URL')
      return
    }

    setUploadingDocs(prev => ({ ...prev, [docType]: true }))

    try {
      const data = new FormData()
      data.append('documentType', docType)
      
      if (fileInput?.files?.[0]) {
        data.append('file', fileInput.files[0])
      }
      if (urlInput?.value) {
        data.append('url', urlInput.value)
      }

      const response = await fetch(`/api/portals/${token}/upload`, {
        method: 'POST',
        body: data,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const { submission } = await response.json()
      setSubmittedDocs(prev => [...prev, submission])
      
      // Reset form
      if (fileInput) fileInput.value = ''
      if (urlInput) urlInput.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docType]: false }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portal...</p>
        </div>
      </div>
    )
  }

  if (!portal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Portal Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error || 'The submission portal does not exist or has expired.'}</p>
            <Link href="/">
              <Button className="w-full">Return to Homepage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOverdue = portal.isClosed
  const remainingDocs = portal.required_documents.filter(
    doc => !submittedDocs.some(s => s.documentType === doc)
  )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">← Back to Home</Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Document Submission Portal
          </h1>
          <p className="text-gray-600">
            Submit required documents for your job application
          </p>
        </div>

        {/* Application Info Card */}
        <Card className="mb-8">
          <CardHeader className="bg-primary text-white">
            <CardTitle>{portal.applications.job_title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Applicant Name</p>
                <p className="font-semibold">{portal.applications.applicant_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-sm break-all">{portal.applications.applicant_email}</p>
              </div>
            </div>

            {/* Deadline Alert */}
            <div className={`flex items-center gap-3 p-4 rounded-lg ${
              isOverdue 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-blue-50 border border-blue-200'
            }`}>
              {isOverdue ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Clock className="h-5 w-5 text-blue-600" />
              )}
              <div>
                <p className={`font-semibold ${isOverdue ? 'text-red-900' : 'text-blue-900'}`}>
                  {isOverdue ? 'Submission Closed' : 'Time Remaining'}
                </p>
                <p className={isOverdue ? 'text-red-700' : 'text-blue-700'}>
                  {isOverdue ? 'This portal is no longer accepting submissions' : timeLeft}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submitted Documents */}
        {submittedDocs.length > 0 && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <CheckCircle2 className="h-5 w-5" />
                Submitted Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {submittedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded border border-green-200">
                    <div>
                      <p className="font-medium text-gray-900">{doc.documentType}</p>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(doc.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Upload Forms */}
        {!isOverdue && remainingDocs.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Required Documents ({remainingDocs.length})
            </h2>
            {remainingDocs.map(docType => (
              <Card key={docType}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {docType}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => handleUpload(e, docType)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload File</Label>
                      <Input
                        type="file"
                        disabled={uploadingDocs[docType]}
                        accept=".pdf,.doc,.docx,.jpg,.png,.mp4,.mov"
                      />
                      <p className="text-sm text-gray-500">
                        Accepted formats: PDF, Word, Images, Video
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Paste URL (e.g., video interview link)</Label>
                      <Input
                        type="url"
                        placeholder="https://example.com/video"
                        disabled={uploadingDocs[docType]}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={uploadingDocs[docType] || isOverdue}
                      className="w-full"
                    >
                      {uploadingDocs[docType] ? 'Uploading...' : `Submit ${docType}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* All Documents Submitted */}
        {!isOverdue && remainingDocs.length === 0 && submittedDocs.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                All Documents Submitted
              </h3>
              <p className="text-green-700">
                Thank you for submitting your documents. We will review them shortly.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Portal Closed Message */}
        {isOverdue && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                Submission Portal Closed
              </h3>
              <p className="text-red-700 mb-4">
                The deadline for this submission portal has passed. No further submissions are being accepted.
              </p>
              {submittedDocs.length > 0 && (
                <p className="text-sm text-red-600">
                  You submitted {submittedDocs.length} document(s) before the deadline.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
