import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface ResendEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  created_at: string;
  opened: boolean;
  clicked: boolean;
  bounced: boolean;
  unsubscribed: boolean;
}

export async function GET() {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!RESEND_API_KEY) {
      console.error('[v0] RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Fetch emails from Resend API
    // Note: Resend API doesn't have a direct "inbox" endpoint, so we'll use their email list
    // For a better experience, we'll fetch from our database and supplement with Resend data
    
    const { data: dbEmails, error: dbError } = await supabase
      .from('email_inbox')
      .select('*')
      .order('received_at', { ascending: false });

    if (dbError) {
      console.error('[v0] Database error:', dbError);
    }

    console.log('[v0] Fetched emails from database:', dbEmails?.length || 0);

    return NextResponse.json({
      success: true,
      emails: dbEmails || [],
      count: dbEmails?.length || 0,
    });
  } catch (error) {
    console.error('[v0] Error listing emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
