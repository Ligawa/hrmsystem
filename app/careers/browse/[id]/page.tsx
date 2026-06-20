'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Briefcase, DollarSign, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';

interface Job {
  id: string;
  title: string;
  job_reference_number: string;
  department: string;
  location: string;
  country: string;
  duty_station: string;
  contract_type: string;
  contract_duration?: string;
  closing_date: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  job_description: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  is_active: boolean;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { user: authUser, isLoggedIn, isLoading: authLoading } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicantProfile, setApplicantProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    cover_letter: '',
  });

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  // Use auth context to set applicant details directly
  useEffect(() => {
    if (!authLoading && isLoggedIn && authUser) {
      setApplicantProfile({
        applicant_id: authUser.applicantId,
        email: authUser.email,
        first_name: authUser.firstName,
        last_name: authUser.lastName,
      });
    }
  }, [isLoggedIn, authUser, authLoading]);

  async function fetchJobDetails() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('jobs').select('*').eq('id', jobId).single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      setError('Failed to load job details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitApplication() {
    if (!isLoggedIn || !applicantProfile) {
      setError('Please log in to apply');
      router.push('/careers/login');
      return;
    }

    if (!formData.cover_letter.trim()) {
      setError('Please write a cover letter');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicant_id: applicantProfile.applicant_id,
          job_id: job?.id,
          job_reference_number: job?.job_reference_number,
          cover_letter: formData.cover_letter,
          full_name: `${applicantProfile.first_name} ${applicantProfile.last_name}`,
          email: applicantProfile.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/careers/browse">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vacancies
            </Link>
          </Button>
          <Card>
            <CardContent className="pt-12 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Job not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/careers/browse">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vacancies
            </Link>
          </Button>
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for applying for the {job.title} position. We&apos;ve received your application and will review it shortly.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Reference Number: <span className="font-semibold">{job.job_reference_number}</span>
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/careers/dashboard">View Your Applications</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatSalary = (min?: number, max?: number, currency = 'USD') => {
    if (!min && !max) return null;
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `${currency} ${max?.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/careers/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vacancies
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="mb-4">
                  <Badge className="mb-2 bg-blue-600">{job.contract_type}</Badge>
                  <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                  <p className="text-lg text-blue-600 font-semibold mt-2">{job.job_reference_number}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Location</p>
                      <p className="text-sm font-medium text-gray-900">{job.duty_station || job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Department</p>
                      <p className="text-sm font-medium text-gray-900">{job.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Closing Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {job.closing_date ? new Date(job.closing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {formatSalary(job.salary_min, job.salary_max, job.salary_currency) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Salary</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            {job.job_description && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{job.job_description}</p>
                </CardContent>
              </Card>
            )}

            {/* Responsibilities */}
            {job.responsibilities && Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Apply Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Apply Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                  </div>
                )}

                {authLoading && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                    Loading your profile...
                  </div>
                )}

                {!authLoading && !isLoggedIn && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                    <p className="text-blue-900 mb-3">
                      You need to be logged in to apply for this position. Your session will persist so you can apply without logging in again.
                    </p>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 mb-2">
                      <Link href="/careers/login">Log In</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/careers/register">Create Account</Link>
                    </Button>
                  </div>
                )}

                {!authLoading && isLoggedIn && applicantProfile && (
                  <>
                    <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      You are logged in as {applicantProfile.first_name}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <Input
                        type="text"
                        disabled
                        value={`${applicantProfile.first_name} ${applicantProfile.last_name}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <Input type="email" disabled value={applicantProfile.email} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cover Letter <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Tell us why you're a great fit for this role..."
                        value={formData.cover_letter}
                        onChange={(e) =>
                          setFormData({ ...formData, cover_letter: e.target.value })
                        }
                        rows={5}
                      />
                    </div>

                    <Button
                      onClick={handleSubmitApplication}
                      disabled={submitting || !formData.cover_letter.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
