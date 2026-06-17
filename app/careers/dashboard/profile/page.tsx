'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
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
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" placeholder="John" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                  <textarea placeholder="Tell us about yourself..." rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg"></textarea>
                </div>
              </div>
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Job Title</label>
                  <input type="text" placeholder="Health Officer" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input type="number" placeholder="5" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          <Card>
            <CardHeader>
              <CardTitle>Education & Work Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">Manage your education history and work experience</p>
              <Button asChild variant="outline">
                <Link href="/careers/dashboard/profile/education">Edit Education</Link>
              </Button>
              <Button asChild variant="outline" className="ml-3">
                <Link href="/careers/dashboard/profile/experience">Edit Work Experience</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
