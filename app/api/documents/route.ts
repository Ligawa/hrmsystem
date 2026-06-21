import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { blobStorage } from '@/lib/utils/blob-storage'
import { evaluationNotificationService } from '@/lib/services/evaluation-notification-service'
import { createSafeErrorResponse, handleSupabaseError, handleBlobError, logError } from '@/lib/utils/error-handler'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    
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
    const applicantId = formData.get('applicantId') as string

    if (!applicationId || !documentType || !file || !applicantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify applicant owns this application
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('id, applicant_id, full_name')
      .eq('id', applicationId)
      .single()

    if (appError) {
      console.error('[v0] Database query error:', {
        message: appError.message,
        code: appError.code,
        details: appError.details,
        hint: appError.hint,
        applicationId
      })
      const errorResponse = createSafeErrorResponse('authorization', 403, 'POST /api/documents: Unable to verify application', new Error(appError.message || 'Database error'))
      return NextResponse.json(errorResponse, { status: 403 })
    }

    if (!application) {
      const errorResponse = createSafeErrorResponse('authorization', 403, 'POST /api/documents: Application not found', new Error('Application not found'))
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Verify the applicant ID matches (custom auth check)
    if (application.applicant_id !== applicantId) {
      console.warn('[v0] Applicant ID mismatch:', {
        expected: application.applicant_id,
        provided: applicantId,
        applicationId
      })
      const errorResponse = createSafeErrorResponse('authorization', 403, 'POST /api/documents: Unauthorized access', new Error('Applicant mismatch'))
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
    const supabase = getSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')
    const applicantId = searchParams.get('applicantId')

    if (!applicationId || !applicantId) {
      const errorResponse = createSafeErrorResponse('validation', 400, 'GET /api/documents: Missing required params', new Error('Missing applicationId or applicantId'))
      return NextResponse.json(errorResponse, { status: 400 })
    }

    // Verify applicant owns this application before fetching documents
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('id, applicant_id, full_name')
      .eq('id', applicationId)
      .single()

    if (appError) {
      console.error('[v0] GET documents query error:', {
        message: appError.message,
        code: appError.code,
        details: appError.details,
        hint: appError.hint,
        applicationId
      })
      const errorResponse = createSafeErrorResponse('authorization', 403, 'GET /api/documents: Unable to verify application', new Error(appError.message || 'Database error'))
      return NextResponse.json(errorResponse, { status: 403 })
    }

    if (!application) {
      const errorResponse = createSafeErrorResponse('authorization', 403, 'GET /api/documents: Application not found', new Error('Application not found'))
      return NextResponse.json(errorResponse, { status: 404 })
    }

    // Verify the applicant ID matches (custom auth check)
    if (application.applicant_id !== applicantId) {
      console.warn('[v0] GET applicant ID mismatch:', {
        expected: application.applicant_id,
        provided: applicantId,
        applicationId
      })
      const errorResponse = createSafeErrorResponse('authorization', 403, 'GET /api/documents: Unauthorized access', new Error('Applicant mismatch'))
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
