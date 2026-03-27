'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Eye, Mail, ExternalLink, ArrowUpDown } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800",
  reviewing: "bg-yellow-100 text-yellow-800",
  shortlisted: "bg-purple-100 text-purple-800",
  interview: "bg-cyan-100 text-cyan-800",
  offered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

interface Application {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    location: string;
  } | null;
  resume_url: string | null;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    async function fetchApplications() {
      const supabase = createClient();

      const { data } = await supabase
        .from("job_applications")
        .select(
          `
          *,
          jobs (
            id,
            title,
            location
          )
        `
        )
        .order("created_at", { ascending: false });

      if (data) {
        setApplications(data);
      }
      setLoading(false);
    }

    fetchApplications();
  }, []);

  // Get counts by status
  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Sort applications
  let sortedApplications = [...applications];
  
  if (sortBy === 'date') {
    sortedApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortBy === 'name') {
    sortedApplications.sort((a, b) => a.full_name.localeCompare(b.full_name));
  } else if (sortBy === 'position') {
    sortedApplications.sort((a, b) => (a.jobs?.title || '').localeCompare(b.jobs?.title || ''));
  } else if (sortBy === 'status') {
    sortedApplications.sort((a, b) => a.status.localeCompare(b.status));
  }

  // Filter by status
  if (filterStatus !== 'all') {
    sortedApplications = sortedApplications.filter(app => app.status === filterStatus);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-muted-foreground">
            Review and manage job applications
          </p>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        {[
          "pending",
          "reviewing",
          "shortlisted",
          "interview",
          "offered",
          "rejected",
          "withdrawn",
        ].map((status) => (
          <Card key={status}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{statusCounts?.[status] || 0}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {status}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            All Applications ({sortedApplications.length})
          </CardTitle>
          <div className="flex gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date (Newest First)</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="position">Position</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Filter Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewing">Reviewing</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {application.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {application.jobs?.title || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.jobs?.location}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColors[application.status]} capitalize`}
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(application.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/setup/applications/${application.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                          </Link>
                          <a href={`mailto:${application.email}`}>
                            <Button size="sm" variant="ghost">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </a>
                          {application.resume_url && (
                            <a
                              href={application.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No applications found</h3>
              <p className="text-muted-foreground">
                {filterStatus !== 'all' ? 'No applications match the selected filter' : 'Applications will appear here when candidates apply'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
