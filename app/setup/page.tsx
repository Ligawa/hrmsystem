export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Newspaper, FileText, Users, Briefcase, ClipboardList } from "lucide-react";
import Link from "next/link";

export default async function SetupDashboard() {
  const supabase = await createClient();

  // Fetch counts
  const [countriesResult, newsResult, resourcesResult, subscriptionsResult, jobsResult, applicationsResult] =
    await Promise.all([
      supabase.from("countries").select("*", { count: "exact", head: true }),
      supabase.from("news").select("*", { count: "exact", head: true }),
      supabase.from("resources").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }),
      supabase.from("jobs").select("*", { count: "exact", head: true }),
      supabase.from("job_applications").select("*", { count: "exact", head: true }),
    ]);

  // Count new applications
  const { count: newApplicationsCount } = await supabase
    .from("job_applications")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const stats = [
    {
      title: "Countries",
      value: countriesResult.count ?? 0,
      icon: Globe,
      href: "/setup/countries",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "News Articles",
      value: newsResult.count ?? 0,
      icon: Newspaper,
      href: "/setup/news",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Resources",
      value: resourcesResult.count ?? 0,
      icon: FileText,
      href: "/setup/resources",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Job Postings",
      value: jobsResult.count ?? 0,
      icon: Briefcase,
      href: "/setup/jobs",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Applications",
      value: applicationsResult.count ?? 0,
      badge: newApplicationsCount ?? 0,
      icon: ClipboardList,
      href: "/setup/applications",
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Subscribers",
      value: subscriptionsResult.count ?? 0,
      icon: Users,
      href: "/setup/settings",
      color: "text-rose-600",
      bgColor: "bg-rose-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your UNEDF website content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/setup/jobs/new"
              className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <Briefcase className="h-5 w-5 text-primary" />
              <span>Post New Job</span>
            </Link>
            <Link
              href="/setup/applications"
              className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <ClipboardList className="h-5 w-5 text-primary" />
              <span>Review Applications {newApplicationsCount ? `(${newApplicationsCount} new)` : ''}</span>
            </Link>
            <Link
              href="/setup/news/new"
              className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <Newspaper className="h-5 w-5 text-primary" />
              <span>Create News Article</span>
            </Link>
            <Link
              href="/setup/countries/new"
              className="flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted"
            >
              <Globe className="h-5 w-5 text-primary" />
              <span>Add New Country</span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Welcome to the UNEDF Admin Dashboard. From here you can manage all
              content on your website.
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>
                <strong>Jobs:</strong> Post job openings and manage careers
              </li>
              <li>
                <strong>Applications:</strong> Review and respond to applicants
              </li>
              <li>
                <strong>Countries:</strong> Add and edit country program pages
              </li>
              <li>
                <strong>News:</strong> Publish articles and stories
              </li>
              <li>
                <strong>Resources:</strong> Upload reports and publications
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
