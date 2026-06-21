'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [savingEducation, setSavingEducation] = useState(false);
  const [savingWork, setSavingWork] = useState(false);
  const [educationForm, setEducationForm] = useState({ institutionName: '', degreeLevel: '', fieldOfStudy: '', graduationYear: '' });
  const [workForm, setWorkForm] = useState({ jobTitle: '', organization: '', employmentType: '', startDate: '', endDate: '', description: '' });

  useEffect(() => {
    // Wait for auth to finish loading before checking login state
    if (authLoading) return;

    if (!isLoggedIn) {
      router.push('/careers/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        if (!user) return;
        const res = await fetch(`/api/applicant/profile?applicantId=${user.applicantId}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, isLoggedIn, user, router]);

  const handleAddEducation = async () => {
    if (!educationForm.institutionName || !educationForm.degreeLevel || !educationForm.fieldOfStudy) {
      alert('Please fill in all required fields');
      return;
    }

    setSavingEducation(true);
    try {
      const response = await fetch('/api/applicant/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: user?.applicantId,
          ...educationForm,
        }),
      });

      if (response.ok) {
        setEducationForm({ institutionName: '', degreeLevel: '', fieldOfStudy: '', graduationYear: '' });
        setShowEducationForm(false);
        // Refresh profile data
        const res = await fetch(`/api/applicant/profile?applicantId=${user?.applicantId}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } else {
        alert('Failed to save education');
      }
    } catch (error) {
      console.error('[v0] Error saving education:', error);
      alert('Error saving education');
    } finally {
      setSavingEducation(false);
    }
  };

  const handleAddWorkExperience = async () => {
    if (!workForm.jobTitle || !workForm.organization || !workForm.employmentType || !workForm.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    setSavingWork(true);
    try {
      const response = await fetch('/api/applicant/work-experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: user?.applicantId,
          ...workForm,
        }),
      });

      if (response.ok) {
        setWorkForm({ jobTitle: '', organization: '', employmentType: '', startDate: '', endDate: '', description: '' });
        setShowWorkForm(false);
        // Refresh profile data
        const res = await fetch(`/api/applicant/profile?applicantId=${user?.applicantId}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } else {
        alert('Failed to save work experience');
      }
    } catch (error) {
      console.error('[v0] Error saving work experience:', error);
      alert('Error saving work experience');
    } finally {
      setSavingWork(false);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education record?')) return;

    try {
      const response = await fetch(`/api/applicant/education?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh profile data
        const res = await fetch(`/api/applicant/profile?applicantId=${user?.applicantId}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } else {
        alert('Failed to delete education record');
      }
    } catch (error) {
      console.error('[v0] Error deleting education:', error);
    }
  };

  const handleDeleteWorkExperience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work experience record?')) return;

    try {
      const response = await fetch(`/api/applicant/work-experience?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh profile data
        const res = await fetch(`/api/applicant/profile?applicantId=${user?.applicantId}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } else {
        alert('Failed to delete work experience record');
      }
    } catch (error) {
      console.error('[v0] Error deleting work experience:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/careers/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600">Edit your personal and professional information</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading profile...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applicant ID</label>
                    <p className="text-gray-900">{profileData?.applicant_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{profileData?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <p className="text-gray-900">{profileData?.first_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <p className="text-gray-900">{profileData?.last_name || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                    <p className="text-gray-900">{profileData?.summary || 'No summary provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Details */}
            {profileData?.professionalDetails && Object.keys(profileData.professionalDetails).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Job Title</label>
                      <p className="text-gray-900">{profileData.professionalDetails.current_job_title || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                      <p className="text-gray-900">{profileData.professionalDetails.years_of_experience || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Organization</label>
                      <p className="text-gray-900">{profileData.professionalDetails.current_organization || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Education</CardTitle>
                {!showEducationForm && (
                  <Button size="sm" onClick={() => setShowEducationForm(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Education
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {showEducationForm && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
                        <Input
                          placeholder="University name"
                          value={educationForm.institutionName}
                          onChange={(e) => setEducationForm({ ...educationForm, institutionName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree Level *</label>
                        <Input
                          placeholder="e.g., Bachelor's, Master's, PhD"
                          value={educationForm.degreeLevel}
                          onChange={(e) => setEducationForm({ ...educationForm, degreeLevel: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
                        <Input
                          placeholder="e.g., Computer Science"
                          value={educationForm.fieldOfStudy}
                          onChange={(e) => setEducationForm({ ...educationForm, fieldOfStudy: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                        <Input
                          type="number"
                          placeholder="2023"
                          value={educationForm.graduationYear}
                          onChange={(e) => setEducationForm({ ...educationForm, graduationYear: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddEducation} 
                        disabled={savingEducation}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {savingEducation ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Education
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowEducationForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {profileData?.education && profileData.education.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.education.map((edu: any) => (
                      <div key={edu.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{edu.field_of_study}</p>
                          <p className="text-sm text-gray-600">{edu.degree_level}</p>
                          <p className="text-sm text-gray-600">{edu.institution_name}</p>
                          {edu.graduation_year && <p className="text-sm text-gray-600">Graduated: {edu.graduation_year}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteEducation(edu.id)}
                          className="ml-4 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No education records yet</p>
                )}
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Work Experience</CardTitle>
                {!showWorkForm && (
                  <Button size="sm" onClick={() => setShowWorkForm(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Experience
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {showWorkForm && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                        <Input
                          placeholder="e.g., Senior Developer"
                          value={workForm.jobTitle}
                          onChange={(e) => setWorkForm({ ...workForm, jobTitle: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                        <Input
                          placeholder="Company name"
                          value={workForm.organization}
                          onChange={(e) => setWorkForm({ ...workForm, organization: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
                        <Input
                          placeholder="e.g., Full-time, Part-time"
                          value={workForm.employmentType}
                          onChange={(e) => setWorkForm({ ...workForm, employmentType: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                        <Input
                          type="date"
                          value={workForm.startDate}
                          onChange={(e) => setWorkForm({ ...workForm, startDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <Input
                          type="date"
                          value={workForm.endDate}
                          onChange={(e) => setWorkForm({ ...workForm, endDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <Input
                          placeholder="Brief description of responsibilities"
                          value={workForm.description}
                          onChange={(e) => setWorkForm({ ...workForm, description: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddWorkExperience} 
                        disabled={savingWork}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {savingWork ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Save Experience
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setShowWorkForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {profileData?.workExperience && profileData.workExperience.length > 0 ? (
                  <div className="space-y-3">
                    {profileData.workExperience.map((exp: any) => (
                      <div key={exp.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{exp.job_title}</p>
                          <p className="text-sm text-gray-600">{exp.organization}</p>
                          <p className="text-sm text-gray-600">{exp.employment_type}</p>
                          {exp.start_date && <p className="text-sm text-gray-600">Since: {exp.start_date}</p>}
                          {exp.description && <p className="text-sm text-gray-600 mt-2">{exp.description}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteWorkExperience(exp.id)}
                          className="ml-4 p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No work experience yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
