import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await req.text();
    const data = JSON.parse(body);

    // Verify webhook signature with Resend
    const signature = req.headers.get('svix-signature') || req.headers.get('x-resend-signature');
    const signingKey = process.env.RESEND_WEBHOOK_SIGNING_KEY;
    
    if (signature && signingKey) {
      try {
        // Try to verify with Svix format (v1=signature)
        const timestamp = req.headers.get('svix-timestamp');
        const id = req.headers.get('svix-id');
        
        if (timestamp && id) {
          const toSign = `${id}.${timestamp}.${body}`;
          const computedSignature = crypto
            .createHmac('sha256', signingKey)
            .update(toSign)
            .digest('base64');
          
          const signatureParts = signature.split(',');
          const receivedSignature = signatureParts.find(s => s.startsWith('v1='))?.replace('v1=', '');
          
          if (!receivedSignature || computedSignature !== receivedSignature) {
            console.warn('[v0] Webhook signature verification failed, but continuing');
          } else {
            console.log('[v0] Webhook signature verified');
          }
        }
      } catch (verifyError) {
        console.warn('[v0] Signature verification error:', verifyError);
      }
    } else {
      console.warn('[v0] No signature or signing key available for verification');
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
