"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Linkedin,
  Globe,
  FileText,
  Briefcase,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { ApplicationDocuments } from "@/components/admin/application-documents";

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  resume_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  years_experience: number | null;
  current_company: string | null;
  current_title: string | null;
  status: string;
  application_status: string;
  job_reference_number: string;
  applicant_id?: string;
  admin_notes: string | null;
  notes: string | null;
  assessment_score: number | null;
  interview_date: string | null;
  interview_notes: string | null;
  shortlist_reason: string | null;
  rejection_reason: string | null;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    location: string;
    country?: string;
    department: string | null;
  } | null;
  applicants?: {
    applicant_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const APPLICATION_STATUSES = [
  'Submitted',
  'Under Review',
  'Assessment Pending',
  'Interview Pending',
  'Shortlisted',
  'Reference Check',
  'Selected',
  'Deployment Preparation',
  'Closed',
];

const statusColors: Record<string, string> = {
  Submitted: "bg-gray-100 text-gray-800",
  'Under Review': "bg-blue-100 text-blue-800",
  'Assessment Pending': "bg-yellow-100 text-yellow-800",
  'Interview Pending': "bg-purple-100 text-purple-800",
  Shortlisted: "bg-green-100 text-green-800",
  'Reference Check': "bg-orange-100 text-orange-800",
  Selected: "bg-emerald-100 text-emerald-800",
  'Deployment Preparation': "bg-cyan-100 text-cyan-800",
  Closed: "bg-red-100 text-red-800",
  // Legacy statuses
  pending: "bg-blue-100 text-blue-800",
  reviewing: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [status, setStatus] = useState("pending");
  const [applicationStatus, setApplicationStatus] = useState("Submitted");
  const [adminNotes, setAdminNotes] = useState("");
  const [assessmentScore, setAssessmentScore] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [shortlistReason, setShortlistReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    async function fetchApplication() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("job_applications")
        .select(
          `
          *,
          jobs (
            id,
            title,
            location,
            department
          )
        `
        )
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.push("/setup/applications");
        return;
      }

      setApplication(data);
      setStatus(data.status);
      setApplicationStatus(data.application_status || "Submitted");
      setAdminNotes(data.admin_notes || data.notes || "");
      setAssessmentScore(data.assessment_score?.toString() || "");
      setInterviewDate(data.interview_date || "");
      setInterviewNotes(data.interview_notes || "");
      setShortlistReason(data.shortlist_reason || "");
      setRejectionReason(data.rejection_reason || "");
      setLoading(false);
    }
    fetchApplication();
  }, [params.id, router]);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("job_applications")
      .update({
        status,
        application_status: applicationStatus,
        admin_notes: adminNotes,
        notes: adminNotes,
        assessment_score: assessmentScore ? parseFloat(assessmentScore) : null,
        interview_date: interviewDate || null,
        interview_notes: interviewNotes,
        shortlist_reason: applicationStatus === 'Shortlisted' ? shortlistReason : null,
        rejection_reason: applicationStatus === 'Closed' ? rejectionReason : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      alert("Error updating application: " + error.message);
    } else {
      alert("Application updated successfully");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/setup/applications">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{application.full_name}</h1>
            {application.applicants?.applicant_id && (
              <span className="text-xs text-muted-foreground font-mono bg-gray-100 px-2 py-1 rounded">
                {application.applicants.applicant_id}
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            {application.job_reference_number} • {application.jobs?.title}
          </p>
        </div>
        <Badge className={`${statusColors[applicationStatus] || statusColors[status]} capitalize`}>
          {applicationStatus || status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${application.email}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {application.email}
                    </a>
                  </div>
                </div>
                {application.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{application.phone}</p>
                    </div>
                  </div>
                )}
                {application.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      <a
                        href={application.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                )}
                {application.portfolio_url && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Portfolio</p>
                      <a
                        href={application.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        View Portfolio
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Background */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {application.current_title && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Title
                      </p>
                      <p className="font-medium">{application.current_title}</p>
                    </div>
                  </div>
                )}
                {application.current_company && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Company
                      </p>
                      <p className="font-medium">
                        {application.current_company}
                      </p>
                    </div>
                  </div>
                )}
                {application.years_experience && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Years of Experience
                      </p>
                      <p className="font-medium">
                        {application.years_experience} years
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {application.resume_url && (
                <div className="pt-4">
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      View Resume
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {application.cover_letter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {application.cover_letter}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submitted Documents */}
          <ApplicationDocuments applicationId={application.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Position Applied</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold">{application.jobs?.title}</h3>
              <p className="text-sm text-muted-foreground">
                {application.jobs?.location}
              </p>
              {application.jobs?.department && (
                <p className="text-sm text-muted-foreground">
                  {application.jobs.department}
                </p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                Applied on{" "}
                {new Date(application.created_at).toLocaleDateString()}
              </p>
              <Link href={`/setup/jobs/${application.jobs?.id}`}>
                <Button variant="link" className="mt-2 h-auto p-0">
                  View Job Posting
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Application Status</Label>
                <Select value={applicationStatus} onValueChange={setApplicationStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {applicationStatus === 'Shortlisted' && (
                <div className="space-y-2">
                  <Label>Shortlist Reason</Label>
                  <Textarea
                    value={shortlistReason}
                    onChange={(e) => setShortlistReason(e.target.value)}
                    placeholder="Why is this candidate shortlisted?"
                    rows={3}
                  />
                </div>
              )}

              {applicationStatus === 'Closed' && (
                <div className="space-y-2">
                  <Label>Rejection Reason</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for closing this application"
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Assessment Score</Label>
                <Input
                  type="number"
                  placeholder="e.g., 85"
                  value={assessmentScore}
                  onChange={(e) => setAssessmentScore(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label>Interview Date</Label>
                <Input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Interview Notes</Label>
                <Textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Interview feedback and observations..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>General Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this candidate..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href={`mailto:${application.email}`} className="block">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </a>
              {application.resume_url && (
                <a
                  href={application.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="mr-2 h-4 w-4" />
                    Download Resume
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
