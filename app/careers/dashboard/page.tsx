'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, FileText, CheckCircle2, Clock, ArrowRight, LogOut, Menu, X } from 'lucide-react';

const navigationItems = [
  { icon: User, label: 'My Profile', href: '/careers/dashboard/profile' },
  { icon: FileText, label: 'My Applications', href: '/careers/dashboard/applications' },
  { icon: FileText, label: 'Upload Documents', href: '/careers/dashboard/documents' },
  { icon: CheckCircle2, label: 'Assessments', href: '/careers/dashboard/assessments' },
  { icon: Clock, label: 'Interview Schedule', href: '/careers/dashboard/interviews' },
];

const applicationStats = [
  { label: 'Total Applications', value: '3', color: 'bg-blue-500' },
  { label: 'Under Review', value: '1', color: 'bg-yellow-500' },
  { label: 'Interviews', value: '1', color: 'bg-purple-500' },
  { label: 'Offers Received', value: '0', color: 'bg-green-500' },
];

export default function ApplicantDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Who%20logo%20transaparent-s8tFTJQHbsixX7kvCoojO0zQUpjsmV.png"
              alt="WHO Logo"
              className="h-10 w-10"
            />
            <h1 className="text-xl font-bold text-gray-900">Applicant Portal</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white border-r border-gray-200 p-6 md:min-h-screen`}>
          <nav className="space-y-2 mb-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, John!</h2>
              <p className="text-gray-600">Track your applications and profile progress</p>
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {applicationStats.map((stat) => (
                <Card key={stat.label} className="border-0 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-lg opacity-20`}></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Profile Completion */}
              <Card className="lg:col-span-1 border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall</span>
                        <span className="text-sm font-semibold text-gray-900">70%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3 border-t border-gray-200">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">Basic Information</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" checked readOnly className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm text-gray-700">Professional Details</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" readOnly className="w-4 h-4 text-gray-300 rounded" />
                        <span className="text-sm text-gray-700">Education</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" readOnly className="w-4 h-4 text-gray-300 rounded" />
                        <span className="text-sm text-gray-700">Work Experience</span>
                      </label>
                    </div>

                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                      <Link href="/careers/dashboard/profile">Complete Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card className="lg:col-span-2 border-0 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Your latest job applications</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/careers/dashboard/applications">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        position: 'Regional Health Officer',
                        location: 'Geneva, Switzerland',
                        status: 'under_review',
                        date: '2 days ago',
                      },
                      {
                        position: 'Disease Surveillance Specialist',
                        location: 'Bangkok, Thailand',
                        status: 'interview',
                        date: '1 week ago',
                      },
                      {
                        position: 'Public Health Advisor',
                        location: 'Nairobi, Kenya',
                        status: 'submitted',
                        date: '2 weeks ago',
                      },
                    ].map((app, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{app.position}</p>
                          <p className="text-sm text-gray-600">{app.location} • {app.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'interview'
                              ? 'bg-purple-100 text-purple-800'
                              : app.status === 'under_review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {app.status === 'interview' ? 'Interview' : app.status === 'under_review' ? 'Under Review' : 'Submitted'}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Upload Documents</h3>
                      <p className="text-sm text-gray-600 mt-1">Keep your resume, certificates, and documents up to date</p>
                      <Button asChild variant="link" className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700">
                        <Link href="/careers/dashboard/documents">Upload Now <ArrowRight className="w-4 h-4 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Take an Assessment</h3>
                      <p className="text-sm text-gray-600 mt-1">Complete pending assessments to advance in the hiring process</p>
                      <Button asChild variant="link" className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700">
                        <Link href="/careers/dashboard/assessments">View Assessments <ArrowRight className="w-4 h-4 ml-1" /></Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
