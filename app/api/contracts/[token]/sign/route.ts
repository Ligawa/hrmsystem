import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const { signerName, signatureType, signatureData } = body

    if (!token || !signerName || !signatureType || !signatureData) {
      return NextResponse.json(
        { error: 'Missing required signing data' },
        { status: 400 }
      )
    }

    const supabase = await createServiceRoleClient()

    const { data: contract, error: contractError } = await supabase
      .from('employment_contracts')
      .select('*')
      .eq('contract_token', token)
      .single()

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found or token invalid' },
        { status: 404 }
      )
    }

    if (new Date(contract.token_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Contract token has expired' },
        { status: 410 }
      )
    }

    if (contract.status === 'signed') {
      return NextResponse.json(
        { error: 'Contract has already been signed' },
        { status: 409 }
      )
    }

    const { error: insertError } = await supabase
      .from('contract_signatures')
      .insert({
        contract_id: contract.id,
        signer_name: signerName,
        signer_email: contract.applicant_email,
        signature_type: signatureType,
        signature_data: signatureData,
        signature_date: new Date().toISOString(),
      })

    if (insertError) {
      console.error('[v0] Server contract signature insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save the signature' },
        { status: 500 }
      )
    }

    const { error: updateError } = await supabase
      .from('employment_contracts')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
      })
      .eq('id', contract.id)

    if (updateError) {
      console.error('[v0] Server contract status update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update contract status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Server contract sign error:', error)
    const message = error instanceof Error ? error.message : 'Unknown server error'
    return NextResponse.json(
      { error: `Failed to sign contract: ${message}` },
      { status: 500 }
    )
  }
}
