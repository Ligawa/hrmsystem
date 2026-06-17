'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Search, File, Download, CheckCircle2, XCircle } from 'lucide-react'

interface Document {
  id: string
  file_name: string
  document_type: string
  upload_status: string
  application: {
    applicant_id: string
    full_name: string
  }
  created_at: string
}

export default function DocumentsReviewPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [reviewingDoc, setReviewingDoc] = useState<string | null>(null)
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, searchTerm, statusFilter])

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents')
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (err) {
      console.error('[v0] Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = documents

    if (statusFilter !== 'all') {
      filtered = filtered.filter((d) => d.upload_status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (d) =>
          d.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.application.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.application.applicant_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredDocuments(filtered)
  }

  const handleReview = async () => {
    if (!selectedDoc || !reviewAction) return

    setSubmitting(true)

    try {
      const response = await fetch(`/api/documents/${selectedDoc.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewAction,
          rejectionReason: reviewAction === 'rejected' ? rejectionReason : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Review failed')
      }

      // Update documents list
      setDocuments(
        documents.map((d) =>
          d.id === selectedDoc.id
            ? { ...d, upload_status: reviewAction }
            : d
        )
      )

      // Reset state
      setSelectedDoc(null)
      setReviewingDoc(null)
      setReviewAction(null)
      setRejectionReason('')
    } catch (err) {
      console.error('[v0] Review error:', err)
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const pendingCount = documents.filter((d) => d.upload_status === 'pending').length
  const approvedCount = documents.filter((d) => d.upload_status === 'approved').length
  const rejectedCount = documents.filter((d) => d.upload_status === 'rejected').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Document Reviews</h1>
        <p className="text-muted-foreground">
          Review and approve applicant documents
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
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
                placeholder="Search by name, ID, or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Documents List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No documents found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left ${
                        selectedDoc?.id === doc.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.file_name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.application.full_name} ({doc.application.applicant_id})
                        </p>
                      </div>
                      <Badge className={getStatusColor(doc.upload_status)}>
                        {doc.upload_status}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Panel */}
        {selectedDoc && (
          <Card>
            <CardHeader>
              <CardTitle>Review Document</CardTitle>
              <CardDescription>
                {selectedDoc.file_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <p>
                  <span className="font-medium">Applicant:</span> {selectedDoc.application.full_name}
                </p>
                <p>
                  <span className="font-medium">ID:</span> {selectedDoc.application.applicant_id}
                </p>
                <p>
                  <span className="font-medium">Type:</span> {selectedDoc.document_type}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <Badge className={`ml-2 ${getStatusColor(selectedDoc.upload_status)}`}>
                    {selectedDoc.upload_status}
                  </Badge>
                </p>
              </div>

              {selectedDoc.upload_status === 'pending' && (
                <div className="space-y-4 border-t pt-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setReviewAction('approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                      disabled={submitting}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => {
                        setReviewAction('rejected')
                        setReviewingDoc(selectedDoc.id)
                      }}
                      variant="destructive"
                      className="flex-1 gap-2"
                      disabled={submitting}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>

                  {reviewAction === 'rejected' && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rejection Reason</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this document is being rejected..."
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <Button
                        onClick={handleReview}
                        className="w-full bg-red-600 hover:bg-red-700"
                        disabled={submitting || !rejectionReason}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Confirm Rejection'
                        )}
                      </Button>
                    </div>
                  )}

                  {reviewAction === 'approved' && (
                    <Button
                      onClick={handleReview}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Approval'
                      )}
                    </Button>
                  )}
                </div>
              )}

              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
