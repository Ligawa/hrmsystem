"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Eye, MapPin, Calendar, Users, Upload } from "lucide-react";
import Link from "next/link";
import { DeleteJobButton } from "@/components/admin/delete-job-button";

interface Job {
  id: string;
  title: string;
  slug: string;
  location: string;
  type: string;
  department: string | null;
  level: string | null;
  is_active: boolean;
  featured: boolean;
  closing_date: string | null;
  created_at: string;
  applications_count?: number;
}

export default function JobsAdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        data.map(async (job) => {
          const { count } = await supabase
            .from("job_applications")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);
          return { ...job, applications_count: count ?? 0 };
        })
      );
      setJobs(jobsWithCounts);
    }
    setLoading(false);
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "full-time": "bg-green-100 text-green-800",
      "part-time": "bg-blue-100 text-blue-800",
      contract: "bg-amber-100 text-amber-800",
      internship: "bg-purple-100 text-purple-800",
      consultant: "bg-cyan-100 text-cyan-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs Management</h1>
          <p className="mt-1 text-muted-foreground">
            Manage job postings and career opportunities
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/setup/jobs/bulk-upload">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </Link>
          <Link href="/setup/jobs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">No jobs posted yet</p>
            <Link href="/setup/jobs/new">
              <Button>Post Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className={!job.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      {job.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {!job.is_active && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </span>
                      {job.department && (
                        <span>{job.department}</span>
                      )}
                      {job.closing_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Closes: {new Date(job.closing_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge className={getTypeColor(job.type)}>{job.type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {job.applications_count} application{job.applications_count !== 1 ? "s" : ""}
                    </span>
                    {job.applications_count && job.applications_count > 0 && (
                      <Link
                        href={`/setup/applications?job=${job.id}`}
                        className="text-primary hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/careers/${job.slug}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/setup/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <DeleteJobButton jobId={job.id} jobTitle={job.title} onDelete={fetchJobs} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
