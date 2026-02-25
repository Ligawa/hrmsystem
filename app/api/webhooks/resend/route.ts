import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Verify webhook signature
    const signature = req.headers.get('x-resend-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    // Parse the email data
    const { type, data: emailData } = data;

    console.log('[v0] Webhook received:', type);

    if (type === 'email.received') {
      const supabase = await createClient();

      // Extract email details
      const {
        from,
        subject,
        text: body,
        html: htmlBody,
      } = emailData;

      console.log('[v0] Storing email from:', from, 'subject:', subject);

      // Extract name from email if available (format: "Name <email@domain.com>")
      let fromEmail = from;
      let fromName = null;
      const emailMatch = from?.match(/(.+?)\s*<(.+?)>/);
      if (emailMatch) {
        fromName = emailMatch[1].trim();
        fromEmail = emailMatch[2].trim();
      }

      // Store in database
      const { error, data: insertedData } = await supabase
        .from('email_inbox')
        .insert([
          {
            from_email: fromEmail,
            from_name: fromName,
            subject,
            body,
            html_body: htmlBody,
            received_at: new Date().toISOString(),
            read: false,
            archived: false,
          },
        ])
        .select();

      if (error) {
        console.error('[v0] Error storing email:', error);
        return NextResponse.json(
          { error: 'Failed to store email', details: error },
          { status: 500 }
        );
      }

      console.log('[v0] Email stored successfully');
      return NextResponse.json({ success: true, data: insertedData });
    }

    console.log('[v0] Unknown webhook type:', type);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
