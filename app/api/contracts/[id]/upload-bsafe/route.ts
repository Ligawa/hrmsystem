import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contractId } = await params;

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type - Accept PDF and all image formats
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPG, PNG, GIF, WebP, SVG' },
        { status: 400 }
      );
    }

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB' },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // Check contract exists
    const { data: contract, error: contractError } = await supabase
      .from('employment_contracts')
      .select('id')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      console.error('[v0] Contract not found:', contractError);
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Store file as base64 temporarily in memory for preview generation
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log('[v0] Uploading BSAFE file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // First, check if an upload already exists for this contract
    const { data: existingUpload } = await supabase
      .from('bsafe_uploads')
      .select('id')
      .eq('contract_id', contractId)
      .single();

    let uploadResult;
    if (existingUpload) {
      // Update existing upload - only store file metadata, not the entire base64 data
      uploadResult = await supabase
        .from('bsafe_uploads')
        .update({
          file_name: file.name,
          file_size: file.size,
          file_url: `file://${file.name}`, // Store reference instead of full base64
          uploaded_at: new Date().toISOString(),
        })
        .eq('contract_id', contractId)
        .select()
        .single();
    } else {
      // Create new upload - only store file metadata, not the entire base64 data
      uploadResult = await supabase
        .from('bsafe_uploads')
        .insert({
          contract_id: contractId,
          file_name: file.name,
          file_size: file.size,
          file_url: `file://${file.name}`, // Store reference instead of full base64
          uploaded_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    const { data: uploadData, error: uploadError } = uploadResult;

    if (uploadError) {
      console.error('[v0] Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Update contract status to reflect BSAFE submission.
    const { error: contractUpdateError } = await supabase
      .from('employment_contracts')
      .update({
        status: 'bsafe_pending',
        bsafe_status: 'submitted',
        bsafe_submitted_at: new Date().toISOString(),
      })
      .eq('id', contractId);

    if (contractUpdateError) {
      console.error('[v0] Contract status update error:', contractUpdateError);
      return NextResponse.json(
        { error: 'Failed to update contract status' },
        { status: 500 }
      );
    }

    console.log('[v0] BSAFE upload successful');

    // Return the preview data URL to the client (not stored in DB due to size limits)
    return NextResponse.json({
      success: true,
      message: 'BSAFE file uploaded successfully',
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      preview: dataUrl, // Send preview only to client for display
    });

  } catch (error) {
    console.error('[v0] Error in BSAFE upload:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to process upload: ${errorMsg}` },
      { status: 500 }
    );
  }
}
