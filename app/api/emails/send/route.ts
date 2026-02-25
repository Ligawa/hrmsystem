import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      to, 
      subject, 
      body: emailBody, 
      htmlBody,
      inboxId,
      applicantName,
      jobTitle,
      type = 'general'
    } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: to and subject' },
        { status: 400 }
      );
    }

    // Build email content based on type
    let htmlContent = htmlBody || `<p>${emailBody || ''}</p>`;
    let textContent = emailBody || subject;

    if (type === 'application_confirmation') {
      htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Thank You for Your Application</h2>
            <p>Dear ${applicantName},</p>
            <p>We have received your application for the <strong>${jobTitle}</strong> position at UNEDF.</p>
            <p>Your application has been submitted successfully and is now under review.</p>
            <p>We will be in touch within 5-7 business days if we would like to move forward with your application.</p>
            <p>Thank you for your interest in joining our team!</p>
            <p>Best regards,<br/>The UNEDF Team</p>
          </body>
        </html>
      `;
      textContent = `Thank you for your application for the ${jobTitle} position. We have received your submission and will be in touch soon.`;
    }

    // Send email via Resend
    console.log('[v0] Sending email to:', to);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@unoedp.org',
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[v0] Resend API error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    const resendData = await response.json();
    console.log('[v0] Email sent successfully:', resendData.id);

    // Store reply in database if inboxId is provided
    if (inboxId) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await supabase
            .from('email_replies')
            .insert([
              {
                inbox_id: inboxId,
                from_email: 'noreply@unoedp.org',
                to_email: to,
                subject: subject,
                body: textContent,
                html_body: htmlContent,
                status: 'sent',
                sent_at: new Date().toISOString(),
                created_by: user.id,
              },
            ]);
        }
      } catch (dbError) {
        console.error('[v0] Error storing reply:', dbError);
        // Don't fail the whole request if we can't store the reply
      }
    }

    return NextResponse.json({ success: true, id: resendData.id });
  } catch (error) {
    console.error('[v0] Send email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
