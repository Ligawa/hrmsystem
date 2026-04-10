'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  ExternalLink,
  Loader2,
  AlertCircle,
  Eye,
  Copy,
  CheckCircle2,
} from 'lucide-react';

interface ApplicationDocument {
  name: string;
  size: number;
  type: string;
}

interface ApplicationSubmission {
  email: string;
  videoLink: string;
  documents: ApplicationDocument[];
  submittedAt: string;
}

interface SubmissionsData {
  submissions: ApplicationSubmission[];
  totalSubmissions: number;
}

export function ApplicationsSubmissions() {
  const [submissions, setSubmissions] = useState<ApplicationSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ApplicationSubmission | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);

        // In production, this would be a real API call with proper authentication
        const response = await fetch('/api/applications/submit', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer admin-token',
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          // For demo purposes, use mock data
          setSubmissions([]);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data: SubmissionsData = await response.json();
        setSubmissions(data.submissions);
      } catch (err) {
        console.log('[v0] Submissions fetch (demo mode):', err);
        // In demo mode, show empty state with instructions
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  const handleViewSubmission = (submission: ApplicationSubmission) => {
    setSelectedSubmission(submission);
    setShowDialog(true);
  };

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(email);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Loading submissions...</span>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Submissions</CardTitle>
          <CardDescription>
            View and manage all submitted applications from candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No applications submitted yet. Applicants can submit their materials through the secure
              upload portal at <span className="font-mono text-sm">/application-portal</span>.
            </AlertDescription>
          </Alert>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-2">How it works:</h3>
            <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
              <li>
                Applicants receive an email with a link to <span className="font-mono">/application-portal</span>
              </li>
              <li>They authenticate with their email address</li>
              <li>They upload their video interview link and supporting documents</li>
              <li>All submissions appear here for HR team review</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Application Submissions</CardTitle>
          <CardDescription>
            {submissions.length} application{submissions.length !== 1 ? 's' : ''} received
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{submission.email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyEmail(submission.email)}
                          className="h-6 w-6 p-0"
                        >
                          {copied === submission.email ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {formatDate(submission.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{submission.documents.length} files</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenLink(submission.videoLink)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Submission Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>{selectedSubmission?.email}</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Video Interview */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span>📹</span> Video Interview
                </h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto">
                    {selectedSubmission.videoLink}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenLink(selectedSubmission.videoLink)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Documents ({selectedSubmission.documents.length})
                </h3>
                <div className="space-y-2">
                  {selectedSubmission.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                          <p className="text-xs text-slate-500">{formatFileSize(doc.size)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Submitted:</strong> {formatDate(selectedSubmission.submittedAt)}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
