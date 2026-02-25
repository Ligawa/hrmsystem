import { createClient } from "@/lib/supabase/server";
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
import { ClipboardList, Eye, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  reviewing: "bg-yellow-100 text-yellow-800",
  shortlisted: "bg-purple-100 text-purple-800",
  interview: "bg-cyan-100 text-cyan-800",
  offered: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
};

export default async function ApplicationsPage() {
  const supabase = await createClient();

  const { data: applications } = await supabase
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

  // Get counts by status
  const statusCounts = applications?.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
          "new",
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            All Applications ({applications?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications && applications.length > 0 ? (
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
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.email}
                        </p>
                        {application.current_title && (
                          <p className="text-xs text-muted-foreground">
                            {application.current_title}
                            {application.current_company &&
                              ` at ${application.current_company}`}
                          </p>
                        )}
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
          ) : (
            <div className="py-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
              <p className="text-muted-foreground">
                Applications will appear here when candidates apply
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
