export const dynamic = 'force-dynamic';

import { ApplicationsSubmissions } from '@/components/admin/applications-submissions';

export const metadata = {
  title: 'Document Submissions | Admin',
  description: 'View and manage applicant document submissions',
};

export default function SubmissionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Document Submissions</h1>
        <p className="mt-2 text-muted-foreground">
          View all applicant video interviews and document uploads from the secure portal
        </p>
      </div>

      <ApplicationsSubmissions />
    </div>
  );
}
