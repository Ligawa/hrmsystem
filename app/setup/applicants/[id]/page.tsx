'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, MapPin, FileText, CheckCircle2, Calendar } from 'lucide-react';

export default function ApplicantDetailPage({ params }: { params: { id: string } }) {
  // Dummy data for applicant
  const applicant = {
    id: params.id,
    applicantId: 'APP-2026-001234',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'Geneva, Switzerland',
    position: 'Regional Health Officer',
    status: 'interview',
    profileCompletion: 85,
    appliedDate: '2026-01-15',
    
    personalInfo: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      dob: '1990-05-15',
      gender: 'Female',
      nationality: 'American',
      languages: ['English', 'French', 'Spanish'],
    },
    
    professional: {
      currentJobTitle: 'Health Officer',
      organization: 'International Health Foundation',
      yearsOfExperience: 8,
      employmentType: 'Full-time',
      skills: ['Public Health', 'Disease Control', 'Program Management', 'Leadership'],
      certifications: ['MPH - Harvard University', 'CETP - CDC'],
    },

    education: [
      {
        degree: 'Master of Public Health',
        field: 'Epidemiology',
        institution: 'Harvard University',
        year: 2018,
        gpa: 3.8,
      },
      {
        degree: 'Bachelor of Science',
        field: 'Microbiology',
        institution: 'University of California',
        year: 2016,
        gpa: 3.7,
      },
    ],

    documents: [
      { type: 'Resume', name: 'Sarah_Johnson_Resume_2026.pdf', uploadedDate: '2026-01-15' },
      { type: 'Cover Letter', name: 'Cover_Letter.pdf', uploadedDate: '2026-01-15' },
      { type: 'Degree Certificate', name: 'MPH_Certificate.pdf', uploadedDate: '2026-01-15' },
    ],

    applications: [
      {
        position: 'Regional Health Officer',
        status: 'interview',
        appliedDate: '2026-01-15',
        interviewDate: '2026-02-10',
      },
      {
        position: 'Disease Surveillance Specialist',
        status: 'under_review',
        appliedDate: '2026-01-10',
      },
    ],
  };

  const statusColors = {
    interview: 'bg-purple-100 text-purple-800',
    under_review: 'bg-yellow-100 text-yellow-800',
    shortlisted: 'bg-green-100 text-green-800',
    submitted: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/setup/applicants" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Applicants
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{applicant.name}</h1>
              <p className="text-gray-600">{applicant.applicantId}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[applicant.status as keyof typeof statusColors]}`}>
              {applicant.status === 'interview' ? 'Interview' : 'Under Review'}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contact Info */}
        <Card className="mb-8 border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{applicant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{applicant.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{applicant.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Applied</p>
                  <p className="font-semibold text-gray-900">{new Date(applicant.appliedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border-0 shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">Current Position</p>
                    <p className="font-semibold text-gray-900">{applicant.professional.currentJobTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-semibold text-gray-900">{applicant.professional.organization}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Years of Experience</p>
                    <p className="font-semibold text-gray-900">{applicant.professional.yearsOfExperience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Languages</p>
                    <p className="font-semibold text-gray-900">{applicant.personalInfo.languages.join(', ')}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {applicant.professional.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall</span>
                    <span className="text-sm font-semibold text-gray-900">{applicant.profileCompletion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${applicant.profileCompletion}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {applicant.education.map((edu, idx) => (
                    <div key={idx} className="pb-6 border-b border-gray-200 last:border-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.field}</p>
                          <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">GPA: {edu.gpa}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicant.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.type} • Uploaded {new Date(doc.uploadedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">Download</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle>Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicant.applications.map((app, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{app.position}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[app.status as keyof typeof statusColors]}`}>
                          {app.status === 'interview' ? 'Interview' : app.status === 'under_review' ? 'Under Review' : app.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
                      {app.interviewDate && <p className="text-sm text-gray-600">Interview: {new Date(app.interviewDate).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <p className="text-gray-600 text-center py-8">No assessments assigned yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
