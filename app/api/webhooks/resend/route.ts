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

    if (type === 'email.received') {
      const supabase = await createClient();

      // Extract email details
      const {
        from,
        subject,
        text: body,
        html: htmlBody,
      } = emailData;

      // Store in database
      const { error } = await supabase
        .from('email_inbox')
        .insert([
          {
            from_email: from,
            subject,
            body,
            html_body: htmlBody,
          },
        ]);

      if (error) {
        console.error('[v0] Error storing email:', error);
        return NextResponse.json(
          { error: 'Failed to store email' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
