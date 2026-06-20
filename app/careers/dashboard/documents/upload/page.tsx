'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Upload, File, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const DOCUMENT_TYPES = [
  { value: 'resume', label: 'Resume/CV', required: true },
  { value: 'cover_letter', label: 'Cover Letter', required: true },
  { value: 'certificates', label: 'Certificates & Licenses', required: false },
  { value: 'academic', label: 'Academic Transcripts', required: false },
  { value: 'portfolio', label: 'Portfolio/Work Samples', required: false },
  { value: 'other', label: 'Other Documents', required: false },
]

interface Document {
  id: string
  document_type: string
  file_name: string
  upload_status: string
  created_at: string
}

export default function DocumentsUploadPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params.id as string
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Check authentication
    if (!authLoading && !isLoggedIn) {
      router.push('/careers/login')
      return
    }
    
    if (!authLoading && isLoggedIn) {
      fetchDocuments()
    }
  }, [applicationId, isLoggedIn, authLoading])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?applicationId=${applicationId}`)
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error('[v0] Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!selectedType) {
      setError('Please select a document type')
      return
    }

    setError('')
    setSuccess('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('applicationId', applicationId)
      formData.append('documentType', selectedType)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setSuccess(`${file.name} uploaded successfully`)
      setSelectedType('')
      fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (authLoading || loading || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/careers/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Upload Documents</h1>
          <p className="text-muted-foreground">
            Submit required and optional documents for your application
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
            <CardDescription>
              Select document type and upload your file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Document Type *</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={uploading}
              >
                <option value="">Choose a document type...</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label} {type.required ? '*' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              } ${uploading ? 'opacity-50' : ''}`}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
              <p className="text-xs text-gray-500 mb-4">or</p>
              <input
                type="file"
                onChange={handleFileInput}
                disabled={uploading || !selectedType}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading || !selectedType}
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Browse Files'
                  )}
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX - Max 10MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Documents</CardTitle>
            <CardDescription>
              Status of all submitted documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No documents uploaded yet
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <File className="h-5 w-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.upload_status)}>
                      {doc.upload_status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Required Documents Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Document Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {DOCUMENT_TYPES.filter((t) => t.required).map((type) => {
              const submitted = documents.some((d) => d.document_type === type.value)
              return (
                <div key={type.value} className="flex items-center gap-2">
                  {submitted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className={submitted ? 'text-green-700 font-medium' : 'text-yellow-700'}>
                    {type.label} {!submitted && '(Required)'}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
