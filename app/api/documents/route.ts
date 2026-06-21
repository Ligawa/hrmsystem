import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { blobStorage } from '@/lib/utils/blob-storage'
import { evaluationNotificationService } from '@/lib/services/evaluation-notification-service'
import { handleBlobError } from '@/lib/utils/error-handler'

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
        { error: 'Service unavailable' },
        { status: 503 }
      )
    }
    
    const formData = await request.formData()

    const documentType = formData.get('documentType') as string
    const file = formData.get('file') as File
    const applicantId = formData.get('applicantId') as string

    if (!documentType || !file || !applicantId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get applicant by applicant_id (public ID)
    const { data: applicant, error: appError } = await supabase
      .from('applicants')
      .select('id')
      .eq('applicant_id', applicantId)
      .maybeSingle()

    if (appError || !applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      )
    }

    // Upload file to Blob storage
    let blobUrl = ''
    try {
      const bytes = await file.arrayBuffer()
      console.log('[v0] Uploading file:', { fileName: file.name, fileSize: file.size })
      const uploadResult = await blobStorage.uploadFile(
        file.name,
        bytes,
        `documents/${applicantId}`
      )
      blobUrl = uploadResult.url
      console.log('[v0] File uploaded:', { url: blobUrl })
    } catch (blobError) {
      console.error('[v0] Blob upload error:', blobError)
      const errorResponse = handleBlobError(blobError, 'POST /api/documents: Blob upload failed')
      return NextResponse.json(errorResponse, { status: errorResponse.status })
    }

    // Store document metadata in database
    console.log('[v0] Inserting document:', { applicantId: applicant.id, documentType })
    const { data: document, error: dbError } = await supabase
      .from('applicant_documents')
      .insert({
        applicant_id: applicant.id,
        document_type: documentType,
        document_url: blobUrl,
        file_name: file.name,
        file_size: file.size
      })
      .select()
      .single()

    if (dbError) {
      console.error('[v0] Database insert error:', dbError)
      throw dbError
    }
    
    console.log('[v0] Document inserted:', { documentId: document?.id })

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
          'Applicant',
          documentType
        )
      }
    } catch (notificationError) {
      console.error('[v0] Failed to send notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      document
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
    const supabase = getSupabaseAdmin()
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const applicantId = searchParams.get('applicantId')

    if (!applicantId) {
      return NextResponse.json(
        { error: 'Missing applicantId' },
        { status: 400 }
      )
    }

    // Get applicant by applicant_id (public ID)
    const { data: applicant, error: appError } = await supabase
      .from('applicants')
      .select('id')
      .eq('applicant_id', applicantId)
      .maybeSingle()

    if (appError || !applicant) {
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      )
    }

    const { data: documents, error } = await supabase
      .from('applicant_documents')
      .select('*')
      .eq('applicant_id', applicant.id)
      .order('uploaded_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      documents: documents || []
    })
  } catch (error) {
    console.error('[v0] Documents fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
