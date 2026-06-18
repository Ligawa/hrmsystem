import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder route file for the admin/[id] segment
// Actual operations are handled by nested routes like:
// - admin/[id]/bsafe-approve
// - admin/[id]/download
// - admin/[id]/update-status
// - admin/[id]/upload-bsafe

export async function GET() {
  return NextResponse.json(
    { error: 'Invalid endpoint. Use specific sub-routes like /bsafe-approve, /download, /update-status, /upload-bsafe' },
    { status: 400 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Invalid endpoint. Use specific sub-routes like /bsafe-approve, /download, /update-status, /upload-bsafe' },
    { status: 400 }
  );
}
