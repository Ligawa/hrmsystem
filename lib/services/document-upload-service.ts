/**
 * Document Upload Service
 * Handles document uploads using Vercel Blob storage
 */

export interface DocumentUploadOptions {
  file: File;
  applicantId: string;
  documentType: 'Resume' | 'Cover Letter' | 'Passport' | 'Degree Certificate' | 'Work License' | 'Other';
  fileName?: string;
}

export interface DocumentUploadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
}

/**
 * Validate file before upload
 */
export function validateDocument(file: File, maxSizeMB = 10): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`,
    };
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PDF, Word, JPG, or PNG files.',
    };
  }

  return { valid: true };
}

/**
 * Upload document using Vercel Blob
 */
export async function uploadDocument(options: DocumentUploadOptions): Promise<DocumentUploadResult> {
  try {
    const validation = validateDocument(options.file);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', options.file);
    formData.append('applicantId', options.applicantId);
    formData.append('documentType', options.documentType);

    // Call API endpoint to upload to Vercel Blob
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Upload failed',
      };
    }

    const data = await response.json();

    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileType: data.fileType,
    };
  } catch (error) {
    console.error('[v0] Document upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Delete document
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });

    return response.ok;
  } catch (error) {
    console.error('[v0] Document deletion error:', error);
    return false;
  }
}

/**
 * Get download URL for document
 */
export async function getDocumentDownloadUrl(documentId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/documents/${documentId}/download`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('[v0] Error getting download URL:', error);
    return null;
  }
}

/**
 * List applicant documents
 */
export async function listApplicantDocuments(applicantId: string) {
  try {
    const response = await fetch(`/api/documents?applicantId=${applicantId}`);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('[v0] Error listing documents:', error);
    return [];
  }
}
