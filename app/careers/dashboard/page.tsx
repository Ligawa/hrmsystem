'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Briefcase, FileText, CheckCircle2, Clock, ArrowRight, LogOut, Menu, X, BarChart3, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navigationItems = [
  { icon: BarChart3, label: 'Overview', href: '/careers/dashboard' },
  { icon: Briefcase, label: 'My Applications', href: '/careers/dashboard/applications' },
  { icon: User, label: 'My Profile', href: '/careers/dashboard/profile' },
  { icon: FileText, label: 'Documents', href: '/careers/dashboard/documents' },
  { icon: Clock, label: 'Interviews', href: '/careers/dashboard/interviews' },
];

const applicationStats = [
  { label: 'Total Applications', value: '7', icon: Briefcase, color: 'bg-blue-500', lightBg: 'bg-blue-50' },
  { label: 'Under Review', value: '3', icon: Clock, color: 'bg-yellow-500', lightBg: 'bg-yellow-50' },
  { label: 'Interviews', value: '2', icon: CheckCircle2, color: 'bg-purple-500', lightBg: 'bg-purple-50' },
  { label: 'Offers', value: '1', icon: CheckCircle2, color: 'bg-green-500', lightBg: 'bg-green-50' },
];

export default function ApplicantDashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    underReview: 0,
    interviews: 0,
    offers: 0,
  });

  useEffect(() => {
    // Wait for auth to finish loading from localStorage
    if (authLoading) return;

    if (!isLoggedIn) {
      router.push('/careers/login');
      return;
    }

    const fetchData = async () => {
      try {
        if (!user) return;

        // Fetch profile data
        const profileRes = await fetch(`/api/applicant/profile?applicantId=${user.applicantId}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setProfileData(profile);
        }

        // Fetch applications to calculate stats
        const appsRes = await fetch(`/api/applicant/applications?applicantId=${user.applicantId}`);
        if (appsRes.ok) {
          const data = await appsRes.json();
          const apps = data.applications || [];
          setStats({
            totalApplications: apps.length,
            underReview: apps.filter((a: any) => a.status === 'under_review').length,
            interviews: apps.filter((a: any) => a.status === 'interview').length,
            offers: apps.filter((a: any) => a.status === 'offered').length,
          });
        }
      } catch (error) {
        console.error('[v0] Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isLoggedIn, user, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/careers/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo%20Who-DLc16w1mVMIh5V1wglqTNECvigTNsg.png"
                alt="WHO Logo"
                className="h-10 w-auto"
              />
              <span className="hidden sm:inline font-bold text-gray-900">Applicant Portal</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 hidden sm:block" title="Notifications">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 hidden sm:block" title="Settings">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block fixed md:block md:sticky md:top-16' : 'hidden'} md:block w-64 bg-white border-r border-gray-200 p-4 md:min-h-screen top-16 left-0 right-0 z-40 md:z-0 md:top-auto`}>
          <nav className="space-y-1">
            {navigationItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-200 mt-6 pt-6">
            <Button 
              onClick={async () => {
                await logout();
                router.push('/');
              }}
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 font-medium"
            >
              <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 md:mt-0">
          <div className="w-full max-w-full">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Welcome back, {isLoading ? 'Loading...' : `${user?.firstName} ${user?.lastName}`}
              </h2>
              <p className="text-gray-600 text-sm md:text-base">You&apos;re making great progress on your WHO applications</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4 mb-8">
              {[
                { label: 'Total Applications', value: stats.totalApplications.toString(), icon: Briefcase, color: 'bg-blue-500', lightBg: 'bg-blue-50' },
                { label: 'Under Review', value: stats.underReview.toString(), icon: Clock, color: 'bg-yellow-500', lightBg: 'bg-yellow-50' },
                { label: 'Interviews', value: stats.interviews.toString(), icon: CheckCircle2, color: 'bg-purple-500', lightBg: 'bg-purple-50' },
                { label: 'Offers', value: stats.offers.toString(), icon: CheckCircle2, color: 'bg-green-500', lightBg: 'bg-green-50' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-6">
                      <div className={`${stat.lightBg} rounded-lg p-3 mb-3 w-fit`}>
                        <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{isLoading ? '-' : stat.value}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
              {/* Profile Completion */}
              <Card className="lg:col-span-1 border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm font-semibold text-blue-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Basic Information</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Professional Details</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Contact Information</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Work Experience</span>
                      </div>
                    </div>

                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 font-medium">
                      <Link href="/careers/dashboard/profile">Complete Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Applications */}
              <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Recent Applications</CardTitle>
                      <CardDescription>Track your latest submissions</CardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm" className="font-medium">
                      <Link href="/careers/dashboard/applications">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        position: 'Regional Health Officer - Europe',
                        location: 'Geneva, Switzerland',
                        department: 'Health Emergencies',
                        status: 'interview',
                        statusLabel: 'Interview Scheduled',
                        date: '2 days ago',
                      },
                      {
                        position: 'Disease Surveillance Specialist',
                        location: 'Bangkok, Thailand',
                        department: 'Disease Surveillance',
                        status: 'under_review',
                        statusLabel: 'Under Review',
                        date: '1 week ago',
                      },
                      {
                        position: 'Public Health Advisor - Africa',
                        location: 'Nairobi, Kenya',
                        department: 'Public Health',
                        status: 'submitted',
                        statusLabel: 'Application Submitted',
                        date: '2 weeks ago',
                      },
                    ].map((app, idx) => (
                      <Link key={idx} href="/careers/dashboard/applications" className="block p-3 md:p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm md:text-base truncate">{app.position}</p>
                            <p className="text-xs md:text-sm text-gray-600 mt-0.5">{app.location} • {app.date}</p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                            app.status === 'interview'
                              ? 'bg-purple-100 text-purple-800'
                              : app.status === 'under_review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {app.statusLabel}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid gap-4 md:gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Upload Documents</h3>
                      <p className="text-sm text-gray-600 mt-1">Keep your resume and certifications current</p>
                      <Button asChild variant="link" className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700 font-medium">
                        <Link href="/careers/dashboard/documents" className="inline-flex items-center gap-1">Upload Now <ArrowRight className="w-4 h-4" /></Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Pending Assessments</h3>
                      <p className="text-sm text-gray-600 mt-1">1 assessment pending - Complete to advance</p>
                      <Button asChild variant="link" className="mt-2 p-0 h-auto text-blue-600 hover:text-blue-700 font-medium">
                        <Link href="/careers/dashboard/interviews" className="inline-flex items-center gap-1">View Schedule <ArrowRight className="w-4 h-4" /></Link>
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
