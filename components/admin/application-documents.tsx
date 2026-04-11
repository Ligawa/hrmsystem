'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, External Link, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Document {
  id: string;
  document_type: string;
  filename: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
  description?: string;
}

interface ApplicationDocumentsProps {
  applicationId: string;
}

const documentTypeLabels: Record<string, string> = {
  resume: 'Resume/CV',
  id_document: 'Government ID',
  certificate: 'Certificate',
  other: 'Other Document',
};

const documentTypeBadges: Record<string, string> = {
  resume: 'bg-blue-100 text-blue-800',
  id_document: 'bg-green-100 text-green-800',
  certificate: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

export function ApplicationDocuments({ applicationId }: ApplicationDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [applicationId]);

  const fetchDocuments = async () => {
    try {
      const supabase = createClient();
      const { data, error: queryError } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', applicationId)
        .order('uploaded_at', { ascending: false });

      if (queryError) {
        console.error('[v0] Error fetching documents:', queryError);
        setError('Failed to load documents');
        setLoading(false);
        return;
      }

      setDocuments(data || []);
      setLoading(false);
    } catch (err) {
      console.error('[v0] Error:', err);
      setError('Failed to load documents');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Submitted Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading documents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submitted Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents submitted yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={documentTypeBadges[doc.document_type] || documentTypeBadges.other}>
                        {documentTypeLabels[doc.document_type] || doc.document_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 truncate font-medium">{doc.filename}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{(doc.file_size / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-gray-600 mt-1 italic">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex items-center gap-2"
                  >
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
