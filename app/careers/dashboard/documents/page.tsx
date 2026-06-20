'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function DocumentsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/careers/login');
      return;
    }

    const fetchDocuments = async () => {
      try {
        if (!user) return;
        const res = await fetch(`/api/applicant/documents?applicantId=${user.applicantId}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [isLoggedIn, user, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/careers/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading documents...</p>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No documents uploaded yet</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/careers/dashboard/documents/upload">Upload Documents</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.document_name}</p>
                        <p className="text-sm text-gray-600">{doc.document_type} • {doc.file_type}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {doc.document_url && (
                      <Button asChild variant="outline" size="sm">
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
