import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { blobStorage } from '@/lib/utils/blob-storage'
import { evaluationNotificationService } from '@/lib/services/evaluation-notification-service'
import { createSafeErrorResponse, handleSupabaseError, handleBlobError, logError } from '@/lib/utils/error-handler'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
    
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
      const errorResponse = createSafeErrorResponse('auth', 401, 'POST /api/documents: No authenticated user', new Error('No authenticated user'))
      return NextResponse.json(errorResponse, { status: 401 })
    }

    // Verify applicant owns this application
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('id, email, full_name')
      .eq('id', applicationId)
      .single()

    if (appError || !application || application.email !== user.email) {
      const errorResponse = createSafeErrorResponse('authorization', 403, 'POST /api/documents: Unauthorized access', appError || new Error('Unauthorized'))
      return NextResponse.json(errorResponse, { status: 403 })
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
      const errorResponse = handleBlobError(blobError, 'POST /api/documents: Blob upload failed')
      return NextResponse.json(errorResponse, { status: errorResponse.status })
    }

    // Store document metadata in database
    const { data: document, error: dbError } = await supabase
      .from('application_documents')
      .insert({
        application_id: applicationId,
        document_type: documentType,
        document_url: blobUrl,
        file_name: file.name,
        file_size: file.size,
        upload_status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      const errorResponse = handleSupabaseError(dbError, 'POST /api/documents: Database insert failed')
      return NextResponse.json(errorResponse, { status: errorResponse.status })
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
    const errorResponse = createSafeErrorResponse('service', 500, 'POST /api/documents: Uncaught exception', error || new Error('Unknown error'))
    return NextResponse.json(errorResponse, { status: errorResponse.status })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const errorResponse = createSafeErrorResponse('auth', 401, 'GET /api/documents: No authenticated user', new Error('No authenticated user'))
      return NextResponse.json(errorResponse, { status: 401 })
    }

    if (!applicationId) {
      const errorResponse = createSafeErrorResponse('validation', 400, 'GET /api/documents: Missing applicationId', new Error('Missing applicationId'))
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verify applicant owns this application before fetching documents
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('id, email')
      .eq('id', applicationId)
      .single()

    if (appError || !application || application.email !== user.email) {
      const errorResponse = createSafeErrorResponse('authorization', 403, 'GET /api/documents: Unauthorized access', appError || new Error('Unauthorized'))
      return NextResponse.json(errorResponse, { status: 403 })
    }

    const { data: documents, error } = await supabase
      .from('application_documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })

    if (error) {
      const errorResponse = handleSupabaseError(error, 'GET /api/documents: Query failed')
      return NextResponse.json(errorResponse, { status: errorResponse.status })
    }

    return NextResponse.json({ documents })
  } catch (error) {
    const errorResponse = createSafeErrorResponse('service', 500, 'GET /api/documents: Uncaught exception', error || new Error('Unknown error'))
    return NextResponse.json(errorResponse, { status: errorResponse.status })
  }
}
