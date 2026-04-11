export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, AlertCircle, Upload, FileText, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  job_title: string;
  status: string;
  application_deadline: string;
  created_at: string;
  documents_submitted: boolean;
  resume_url?: string;
  submitted_documents?: any[];
}

export default function ApplicationTrackingPage() {
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = params.token as string;

  useEffect(() => {
    fetchApplication();
  }, [token]);

  const fetchApplication = async () => {
    try {
      const supabase = createClient();

      // Query by application_token
      const { data, error: queryError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('application_token', token)
        .single();

      if (queryError || !data) {
        setError('Application not found. Please check your link.');
        setLoading(false);
        return;
      }

      setApplication(data);
      setLoading(false);
    } catch (err) {
      console.error('[v0] Error fetching application:', err);
      setError('Failed to load application. Please try again.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error || 'Application not found'}</p>
            <p className="text-sm text-red-600 mt-3">Please check the link in your email and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deadline = new Date(application.application_deadline);
  const now = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining <= 3 && daysRemaining > 0;

  const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    pending_review: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Under Review' },
    shortlisted: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Shortlisted' },
    rejected: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" />, label: 'Not Selected' },
    interview_scheduled: { color: 'bg-purple-100 text-purple-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Interview Scheduled' },
  };

  const statusInfo = statusConfig[application.status] || statusConfig.pending_review;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Application Status</h1>
            <img src="/images/wvi-logo.svg" alt="World Vision" className="h-10" />
          </div>
          <p className="text-gray-600">Track your application to World Vision International</p>
        </div>

        {/* Status Card */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white mb-2">{application.job_title}</CardTitle>
                <CardDescription className="text-blue-100">{application.applicant_name}</CardDescription>
              </div>
              <Badge className={`${statusInfo.color} flex gap-2 items-center px-3 py-1`}>
                {statusInfo.icon}
                {statusInfo.label}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Deadline Alert */}
            {isOverdue && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 ml-3">
                  The submission deadline has passed. Please contact{' '}
                  <a href="mailto:application@wvio.org" className="font-semibold underline">
                    application@wvio.org
                  </a>{' '}
                  if you need assistance.
                </AlertDescription>
              </Alert>
            )}

            {isUrgent && !isOverdue && (
              <Alert className="mb-6 border-orange-200 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 ml-3">
                  <strong>Urgent:</strong> Only {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining to submit your documents.
                </AlertDescription>
              </Alert>
            )}

            {/* Application Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Application ID</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{application.id.substring(0, 12)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="text-gray-800">{application.applicant_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Applied Date</p>
                <p className="text-gray-800">{new Date(application.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Submission Deadline</p>
                <p className={`text-lg font-semibold ${isOverdue ? 'text-red-600' : isUrgent ? 'text-orange-600' : 'text-gray-800'}`}>
                  {deadline.toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Submitted Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {application.resume_url ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">Resume/CV</p>
                      <p className="text-sm text-gray-500">Uploaded</p>
                    </div>
                  </div>
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    View
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No documents submitted yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your resume and required documents through the secure submission portal
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">1</div>
                <div>
                  <p className="font-medium text-gray-800">Submit Required Documents</p>
                  <p className="text-sm text-gray-600">Upload your CV, government ID, and educational certificates</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">2</div>
                <div>
                  <p className="font-medium text-gray-800">Application Review</p>
                  <p className="text-sm text-gray-600">Our team will review your submission and contact you within 5 business days</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">3</div>
                <div>
                  <p className="font-medium text-gray-800">Interview (if selected)</p>
                  <p className="text-sm text-gray-600">If shortlisted, we&apos;ll schedule an interview at your convenience</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Questions?</strong> Contact our HR team at{' '}
                <a href="mailto:application@wvio.org" className="text-blue-600 hover:underline">
                  application@wvio.org
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} World Vision International. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
