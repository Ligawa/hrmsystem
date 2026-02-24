# Email System Setup Guide

## Overview

Your UNDP application now has a complete email management system powered by Resend. This guide explains how to set up and use it.

## Features

✅ **Incoming Email Handling** - Automatically receive emails sent to your domain  
✅ **Email Inbox Management** - View, read, archive, and delete emails  
✅ **Email Replies** - Send replies directly from the admin panel  
✅ **Automated Emails** - Send transactional emails for job applications, confirmations, etc.  
✅ **Admin Authentication** - Only specific email domains can access the admin panel  

## Verified Domain

- **Domain**: unoedp.org
- **Email Receiving**: Enabled
- **Allowed Admin Emails**: @unoedp.org, @alghahim.co.ke

## Setup Instructions

### 1. Environment Variable

The `RESEND_API_KEY` has been added to your environment variables. Make sure it's configured in your Vercel project settings.

### 2. Add Webhook to Resend

1. Go to https://resend.com/dashboard
2. Navigate to **API Keys** or **Settings**
3. Add a new webhook with these settings:
   - **URL**: `https://yourdomain.com/api/webhooks/resend`
   - **Events**: Select `email.received`
   - **Active**: Yes

### 3. Verify Domain

Ensure your domain (unoedp.org) is verified in Resend for sending outgoing emails.

## Usage

### Admin Pages

#### Email Inbox (`/setup/emails`)
- View all incoming emails
- Mark emails as read/unread
- Reply to emails
- Archive or delete emails

#### Email Settings (`/setup/email-settings`)
- View configured domains
- Enable/disable email receiving
- See webhook configuration
- Access setup instructions

### Admin Access

Only users with email addresses ending in `@unoedp.org` or `@alghahim.co.ke` can register for admin access. The public signup page does not show admin registration.

### Sending Emails Programmatically

Use the email service utility:

```typescript
import { sendEmail, emailTemplates } from '@/lib/email-service';

// Send application confirmation
const { subject, html } = emailTemplates.applicationConfirmation(
  'John Doe',
  'Senior Developer'
);

await sendEmail({
  to: 'john@example.com',
  subject,
  html,
});

// Send custom email
await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<h1>Hello!</h1><p>Welcome to UNDP</p>',
});
```

## Database Schema

### email_inbox table
- Stores all incoming emails
- Fields: id, from_email, from_name, subject, body, html_body, received_at, read, archived

### email_replies table
- Stores all sent replies
- Fields: id, inbox_id, from_email, to_email, subject, body, status, sent_at, created_by

### email_settings table
- Stores email configuration
- Fields: id, domain, is_active, allowed_reply_tos

## API Endpoints

### POST `/api/webhooks/resend`
Webhook endpoint for receiving incoming emails from Resend.

### POST `/api/emails/send`
Send a reply to an incoming email.

**Request body:**
```json
{
  "inboxId": "uuid",
  "toEmail": "sender@example.com",
  "subject": "Re: Your message",
  "body": "Reply text"
}
```

## Security

- Row Level Security (RLS) is enabled on all email tables
- Only authenticated users can view emails
- Users can only see replies they created (except admins)
- Email domain restrictions prevent unauthorized admin access
- Webhook signature verification (recommended)

## Troubleshooting

**Emails not appearing in inbox?**
- Check the webhook URL in Resend is correct
- Verify the webhook is enabled and has `email.received` selected
- Check application logs for errors

**Can't send replies?**
- Verify RESEND_API_KEY is set
- Check the domain is verified in Resend
- Ensure you have admin access

**Admin access denied?**
- Your email must end in @unoedp.org or @alghahim.co.ke
- Check your email is correctly entered during signup
- Verify your email with the confirmation link

## Next Steps

1. Configure the Resend webhook
2. Visit `/setup/emails` to view incoming emails
3. Visit `/setup/email-settings` for configuration details
4. Start receiving and replying to emails!

## Support

For issues with Resend, visit: https://resend.com/docs
For issues with this application, check the admin panel logs.
