import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { blobStorage } from '@/lib/utils/blob-storage'
import { evaluationNotificationService } from '@/lib/services/evaluation-notification-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()

    const applicationId = formData.get('applicationId') as string
    const documentType = formData.get('documentType') as string
    const file = formData.get('file') as File

    if (!applicationId || !documentType || !file) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify applicant owns this application
    const { data: application } = await supabase
      .from('job_applications')
      .select('id, applicant_email, full_name')
      .eq('id', applicationId)
      .single()

    if (!application || application.applicant_email !== user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Upload file to Blob storage
    let blobUrl = ''
    try {
      const bytes = await file.arrayBuffer()
      const uploadResult = await blobStorage.uploadFile(
        file.name,
        bytes,
        `documents/${applicationId}`
      )
      blobUrl = uploadResult.url
    } catch (blobError) {
      console.error('[v0] Blob upload failed:', blobError)
      // Continue with database storage if blob fails (graceful degradation)
    }

    // Store document metadata in database
    const { data: document, error: dbError } = await supabase
      .from('application_documents')
      .insert({
        application_id: applicationId,
        document_type: documentType,
        document_url: blobUrl || `documents/${applicationId}/${file.name}`,
        file_name: file.name,
        file_size: file.size,
        upload_status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      )
    }

    // Send notification to admins
    try {
      const { data: admins } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'admin')
        .limit(1)

      if (admins && admins.length > 0) {
        await evaluationNotificationService.sendDocumentUploadedNotificationToAdmin(
          admins[0].email,
          application.full_name || 'Applicant',
          documentType
        )
      }
    } catch (notificationError) {
      console.error('[v0] Failed to send notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      document,
      message: 'Document uploaded successfully'
    })
  } catch (error) {
    console.error('[v0] Document upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID required' },
        { status: 400 }
      )
    }

    const { data: documents, error } = await supabase
      .from('application_documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('[v0] Fetch documents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
