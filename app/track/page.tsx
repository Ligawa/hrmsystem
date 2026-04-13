'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, AlertCircle, ArrowLeft, FileText, Loader2 } from 'lucide-react';

function ApplicationTrackingContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const [email, setEmail] = useState(emailParam || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/applications/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch application data');
      }

      const data = await response.json();
      setApplicationData(data);
      setIsVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setApplicationData(null);
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-secondary text-white sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-90">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to World Vision</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {!isVerified ? (
            <Card>
              <CardHeader>
                <CardTitle>Track Your Application</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Enter the email address used for your application to view its status and submit required documents.
                </p>

                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'View Application Status'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : applicationData ? (
            <div className="space-y-6">
              {/* Application Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Application Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Position</p>
                      <p className="font-semibold">{applicationData.jobTitle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Application Date</p>
                      <p className="font-semibold">
                        {new Date(applicationData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-6 space-y-3">
                    <h3 className="font-semibold text-gray-900">Application Progress</h3>
                    <div className="space-y-3">
                      {/* Application Received */}
                      <div className="flex gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Application Received</p>
                          <p className="text-sm text-gray-600">
                            {new Date(applicationData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Under Review */}
                      <div className="flex gap-3">
                        <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Under Review</p>
                          <p className="text-sm text-gray-600">
                            Our team is currently reviewing your application
                          </p>
                        </div>
                      </div>

                      {/* Decision Pending */}
                      <div className="flex gap-3">
                        <Clock className="h-6 w-6 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-500">Decision Pending</p>
                          <p className="text-sm text-gray-600">
                            We will notify you once a decision has been made
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submission Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Required Submissions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Please submit the following documents to complete your application:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      <span>Video Interview (5-7 minutes)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      <span>Resume/CV</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      <span>Cover Letter</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full" />
                      <span>Relevant Certifications</span>
                    </li>
                  </ul>

                  {applicationData.submissionPortalUrl && (
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                      <a href={applicationData.submissionPortalUrl} target="_blank" rel="noopener noreferrer">
                        Submit Documents
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    If you have any questions about your application or need assistance with submissions, 
                    please contact our recruitment team at{' '}
                    <a href="mailto:careers@wvio.org" className="text-primary font-medium hover:underline">
                      careers@wvio.org
                    </a>
                  </p>
                </CardContent>
              </Card>

              {/* Logout Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsVerified(false);
                  setApplicationData(null);
                  setEmail('');
                }}
              >
                View Different Application
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ApplicationTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ApplicationTrackingContent />
    </Suspense>
  );
}
