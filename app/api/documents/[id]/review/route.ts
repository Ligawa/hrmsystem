import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params
    const supabase = await createClient()
    const { status, rejectionReason } = await request.json()

    if (!documentId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin/recruiter
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['admin', 'recruiter'].includes(userData.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update document status
    const { data: updatedDocument, error } = await supabase
      .from('application_documents')
      .update({
        upload_status: status,
        rejection_reason: status === 'rejected' ? rejectionReason : null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      message: `Document ${status} successfully`
    })
  } catch (error) {
    console.error('[v0] Document review error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
