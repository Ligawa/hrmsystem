'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ChevronRight, Filter, Download, Mail, Eye } from 'lucide-react';

export default function ApplicantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Dummy applicant data
  const applicants = [
    {
      id: '1',
      applicantId: 'APP-2026-001234',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      position: 'Regional Health Officer',
      status: 'interview',
      applicationDate: '2026-01-15',
      profileCompletion: 85,
    },
    {
      id: '2',
      applicantId: 'APP-2026-001235',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      position: 'Disease Surveillance Specialist',
      status: 'under_review',
      applicationDate: '2026-01-10',
      profileCompletion: 70,
    },
    {
      id: '3',
      applicantId: 'APP-2026-001236',
      name: 'Emma Rodriguez',
      email: 'emma.rodriguez@email.com',
      position: 'Public Health Advisor',
      status: 'submitted',
      applicationDate: '2026-01-08',
      profileCompletion: 60,
    },
    {
      id: '4',
      applicantId: 'APP-2026-001237',
      name: 'David Park',
      email: 'david.park@email.com',
      position: 'Health Systems Specialist',
      status: 'shortlisted',
      applicationDate: '2026-01-05',
      profileCompletion: 90,
    },
  ];

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    shortlisted: 'bg-green-100 text-green-800',
    interview: 'bg-purple-100 text-purple-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    rejected: 'Rejected',
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.applicantId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
              <p className="text-gray-600 mt-2">Manage and review job applicants</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Export List
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="profile">Profile Completion</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
                <Button variant="outline" className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredApplicants.length}</span> of{' '}
            <span className="font-semibold">{applicants.length}</span> applicants
          </p>
        </div>

        {/* Applicants List */}
        <div className="grid gap-6">
          {filteredApplicants.length > 0 ? (
            filteredApplicants.map((applicant) => (
              <Card key={applicant.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{applicant.name}</h3>
                          <p className="text-sm text-gray-600">{applicant.applicantId}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[applicant.status as keyof typeof statusColors]}`}>
                          {statusLabels[applicant.status as keyof typeof statusLabels]}
                        </span>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium text-gray-700">Position:</span> {applicant.position}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Email:</span> {applicant.email}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Applied:</span> {new Date(applicant.applicationDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">Profile Completion</span>
                          <span className="text-xs text-gray-600">{applicant.profileCompletion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${applicant.profileCompletion}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link href={`/setup/applicants/${applicant.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Link href={`/setup/applicants/${applicant.id}`}>
                        <Button size="sm" variant="outline">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="p-12 text-center">
                <p className="text-gray-600 mb-4">No applicants found matching your filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
