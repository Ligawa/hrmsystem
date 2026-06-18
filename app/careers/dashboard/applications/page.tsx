'use client';

import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle, MessageCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const applications = [
  {
    id: 1,
    position: 'Regional Health Officer - Europe',
    location: 'Geneva, Switzerland',
    department: 'Health Emergencies',
    appliedDate: '2024-06-10',
    status: 'interview',
    statusLabel: 'Interview Scheduled',
    progress: 75,
    documents: 5,
  },
  {
    id: 2,
    position: 'Disease Surveillance Specialist',
    location: 'Bangkok, Thailand',
    department: 'Disease Surveillance',
    appliedDate: '2024-05-28',
    status: 'under_review',
    statusLabel: 'Under Review',
    progress: 50,
    documents: 4,
  },
  {
    id: 3,
    position: 'Public Health Advisor - Africa',
    location: 'Nairobi, Kenya',
    department: 'Public Health',
    appliedDate: '2024-05-15',
    status: 'submitted',
    statusLabel: 'Application Submitted',
    progress: 25,
    documents: 3,
  },
  {
    id: 4,
    position: 'Health Emergency Coordinator',
    location: 'New York, USA',
    department: 'Health Emergencies',
    appliedDate: '2024-04-20',
    status: 'rejected',
    statusLabel: 'Not Selected',
    progress: 100,
    documents: 4,
  },
];

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

export default function ApplicationsPage() {
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
        {applications.length === 0 ? (
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
                          <h3 className="text-lg font-semibold text-gray-900">{app.position}</h3>
                          <p className="text-gray-600 text-sm">{app.location} • {app.department}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Applied: </span>
                          <span className="font-medium text-gray-900">{new Date(app.appliedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Documents: </span>
                          <span className="font-medium text-gray-900">{app.documents}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-600">Progress</span>
                          <span className="text-xs font-semibold text-gray-900">{app.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${statusColor.text.replace('text-', 'bg-')}`}
                            style={{ width: `${app.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 lg:flex-row">
                      <Badge className={`${statusColor.text} ${statusColor.bg} border ${statusColor.border} justify-center py-1 px-3`}>
                        {app.statusLabel}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
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
