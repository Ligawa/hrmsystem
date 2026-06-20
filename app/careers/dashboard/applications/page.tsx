'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';



const getStatusColor = (status: string) => {
  switch (status) {
    case 'interview':
      return { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: CheckCircle2 };
    case 'under_review':
      return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: Clock };
    case 'submitted':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: AlertCircle };
    case 'rejected':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: AlertCircle };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'interview':
      return 'Interview Scheduled';
    case 'under_review':
      return 'Under Review';
    case 'submitted':
      return 'Application Submitted';
    case 'rejected':
      return 'Not Selected';
    case 'offered':
      return 'Offer Extended';
    case 'accepted':
      return 'Offer Accepted';
    default:
      return status;
  }
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/careers/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        if (!user) return;
        const res = await fetch(`/api/applicant/applications?applicantId=${user.applicantId}`);
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [isLoggedIn, user, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/careers/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">Track all your WHO job applications and their status</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No applications yet</p>
            <Button asChild>
              <Link href="/careers/browse">Browse Open Positions</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const statusColor = getStatusColor(app.status);
              const StatusIcon = statusColor.icon;
              
              return (
                <div key={app.id} className={`${statusColor.bg} border-l-4 ${statusColor.border} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <StatusIcon className={`w-6 h-6 ${statusColor.text} flex-shrink-0 mt-0.5`} />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">Job Application</h3>
                          <p className="text-gray-600 text-sm">Job ID: {app.jobId || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Applied: </span>
                          <span className="font-medium text-gray-900">{app.submissionDate ? new Date(app.submissionDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Status: </span>
                          <span className="font-medium text-gray-900">{app.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:flex-row">
                      <Badge className={`${statusColor.text} ${statusColor.bg} border ${statusColor.border} justify-center py-1 px-3`}>
                        {getStatusLabel(app.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
