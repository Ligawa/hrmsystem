import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { inboxId, toEmail, subject, body: emailBody, htmlBody } = body;

    if (!inboxId || !toEmail || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@unoedp.org',
        to: toEmail,
        subject,
        html: htmlBody || `<p>${emailBody}</p>`,
        text: emailBody,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[v0] Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    const resendData = await response.json();

    // Store reply in database
    const { error: dbError } = await supabase
      .from('email_replies')
      .insert([
        {
          inbox_id: inboxId,
          from_email: 'noreply@unoedp.org',
          to_email: toEmail,
          subject,
          body: emailBody,
          html_body: htmlBody,
          status: 'sent',
          sent_at: new Date().toISOString(),
          created_by: user.id,
        },
      ]);

    if (dbError) {
      console.error('[v0] Error storing reply:', dbError);
      return NextResponse.json(
        { error: 'Email sent but failed to store reply' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: resendData.id });
  } catch (error) {
    console.error('[v0] Send email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
