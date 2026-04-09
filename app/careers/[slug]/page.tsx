export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ApplicationForm } from "@/components/careers/application-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, description, location")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!job) {
    return { title: "Job Not Found" };
  }

  return {
    title: `${job.title} - ${job.location}`,
    description: job.description,
  };
}

const typeColors: Record<string, string> = {
  "full-time": "bg-green-100 text-green-800",
  "part-time": "bg-blue-100 text-blue-800",
  contract: "bg-orange-100 text-orange-800",
  internship: "bg-purple-100 text-purple-800",
  consultant: "bg-cyan-100 text-cyan-800",
};

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !job) {
    notFound();
  }

  const isExpired = job.closing_date && new Date(job.closing_date) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05))] bg-[length:40px_40px]" />
        <div className="container mx-auto px-4 relative">
          <Link
            href="/careers"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all jobs
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold">{job.title}</h1>
                <Badge className={`${typeColors[job.type]} capitalize`}>
                  {job.type.replace("-", " ")}
                </Badge>
              </div>
              {job.department && (
                <p className="text-xl text-white/80 font-medium mb-6">{job.department}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Location</p>
                    <p className="font-semibold">{job.location}</p>
                  </div>
                </div>
                {job.level && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Level</p>
                      <p className="font-semibold capitalize">{job.level}</p>
                    </div>
                  </div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Salary</p>
                      <p className="font-semibold">{job.salary_range}</p>
                    </div>
                  </div>
                )}
                {job.closing_date && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Deadline</p>
                      <p className="font-semibold">
                        {new Date(job.closing_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Description */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">About This Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground text-base">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Key Responsibilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {job.responsibilities.map(
                      (resp: string, index: number) => (
                        <li key={index} className="flex gap-4">
                          <div className="p-1 bg-primary/10 rounded-lg h-fit">
                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                          </div>
                          <span className="text-muted-foreground font-medium">{resp}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {job.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex gap-4">
                        <div className="p-1 bg-blue-100 rounded-lg h-fit">
                          <CheckCircle className="h-5 w-5 text-blue-600 shrink-0" />
                        </div>
                        <span className="text-muted-foreground font-medium">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl">What We Offer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {job.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex gap-4">
                        <div className="p-1 bg-green-100 rounded-lg h-fit">
                          <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                        </div>
                        <span className="text-muted-foreground font-medium">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Application Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium capitalize">
                      {job.type.replace("-", " ")}
                    </span>
                  </div>
                  {job.level && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium capitalize">{job.level}</span>
                    </div>
                  )}
                  {job.department && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{job.department}</span>
                    </div>
                  )}
                  {job.salary_range && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salary</span>
                      <span className="font-medium">{job.salary_range}</span>
                    </div>
                  )}
                  {job.closing_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline</span>
                      <span className="font-medium">
                        {new Date(job.closing_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application Form */}
              {isExpired ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">
                      Application Closed
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      The deadline for this position has passed.
                    </p>
                    <Link href="/careers">
                      <Button variant="outline" className="mt-4 bg-transparent">
                        View Other Positions
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <ApplicationForm jobId={job.id} jobTitle={job.title} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
