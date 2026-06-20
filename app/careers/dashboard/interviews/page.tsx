'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Video, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export default function InterviewsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [interviews, setInterviews] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/careers/login');
      return;
    }

    const fetchInterviews = async () => {
      try {
        if (!user) return;
        const res = await fetch(`/api/applicant/interviews?applicantId=${user.applicantId}`);
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews || []);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, [isLoggedIn, user, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/careers/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Interview Schedule</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading interviews...</p>
            </CardContent>
          </Card>
        ) : interviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No interviews scheduled yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => (
              <Card key={interview.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <Video className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">{interview.interview_type || 'Interview'}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {interview.scheduled_date ? new Date(interview.scheduled_date).toLocaleString() : 'Date TBD'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        {interview.interviewer_id && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span>Interviewer assigned</span>
                          </div>
                        )}
                        {interview.zoom_link && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Video className="w-4 h-4" />
                            <span>Zoom link provided</span>
                          </div>
                        )}
                        {interview.interview_notes && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Notes available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:items-end">
                      <Badge className={getStatusColor(interview.interview_status)}>
                        {interview.interview_status || 'scheduled'}
                      </Badge>
                      {interview.zoom_link && (
                        <Button asChild size="sm" variant="outline">
                          <a href={interview.zoom_link} target="_blank" rel="noopener noreferrer">
                            Join Call
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
