import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

interface DocumentSubmission {
  type: 'resume' | 'id_document' | 'certificate' | 'other';
  description?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid application token' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('type') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!docType || !['resume', 'id_document', 'certificate', 'other'].includes(docType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and Word documents are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Verify the application exists with this token
    const supabase = await createClient();
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('id, applicant_name, applicant_email')
      .eq('application_token', token)
      .single();

    if (appError || !application) {
      console.error('[v0] Application not found:', appError);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExt = file.name.split('.').pop() || 'pdf';
    const filename = `applications/${application.id}/${docType}-${timestamp}-${randomString}.${fileExt}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
    });

    // Store document reference in database
    const { error: insertError } = await supabase
      .from('application_documents')
      .insert([
        {
          application_id: application.id,
          document_type: docType,
          filename: file.name,
          file_url: blob.url,
          file_size: file.size,
          description: description || null,
          uploaded_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error('[v0] Error storing document:', insertError);
      return NextResponse.json(
        { error: 'Failed to store document information' },
        { status: 500 }
      );
    }

    // Update job_applications to mark documents_submitted as true
    const { error: updateError } = await supabase
      .from('job_applications')
      .update({ documents_submitted: true })
      .eq('id', application.id);

    if (updateError) {
      console.error('[v0] Error updating application:', updateError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Document uploaded successfully',
        document: {
          type: docType,
          filename: file.name,
          url: blob.url,
          uploadedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Document submission error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document. Please try again.' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve submitted documents
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid application token' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get application by token
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('application_token', token)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get submitted documents
    const { data: documents, error: docsError } = await supabase
      .from('application_documents')
      .select('*')
      .eq('application_id', application.id)
      .order('uploaded_at', { ascending: false });

    if (docsError) {
      console.error('[v0] Error fetching documents:', docsError);
      return NextResponse.json(
        { error: 'Failed to retrieve documents' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        documents: documents || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Error retrieving documents:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve documents' },
      { status: 500 }
    );
  }
}
