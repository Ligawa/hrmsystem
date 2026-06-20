'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

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

            {/* Education & Work Experience */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  {profileData?.education && profileData.education.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.education.map((edu: any) => (
                        <div key={edu.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900">{edu.field_of_study}</p>
                          <p className="text-sm text-gray-600">{edu.degree_level}</p>
                          <p className="text-sm text-gray-600">{edu.institution_name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No education records yet</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Work Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  {profileData?.workExperience && profileData.workExperience.length > 0 ? (
                    <div className="space-y-3">
                      {profileData.workExperience.map((exp: any) => (
                        <div key={exp.id} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-900">{exp.job_title}</p>
                          <p className="text-sm text-gray-600">{exp.organization}</p>
                          <p className="text-sm text-gray-600">{exp.employment_type}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No work experience yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
