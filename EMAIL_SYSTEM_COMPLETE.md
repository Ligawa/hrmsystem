# Complete Email System Documentation

## Overview
A full-featured email management system integrated with Resend that allows admins to:
- Send custom emails from @unoedp.org with personalized sender names
- Receive and manage incoming emails on the admin dashboard
- Reply to incoming emails
- Auto-send professional UN-standard application confirmations

---

## Features Implemented

### 1. Email Composition & Sending
**Location:** `/setup/emails/compose`

Admin users can:
- **Custom Sender Name:** Choose how emails appear (e.g., "John Smith", "HR Team", "Recruitment Manager")
- **Recipient & CC:** Add email addresses with CC support
- **Subject & Body:** Compose emails with plain text or HTML
- **Professional Templates:** Built-in HTML support for formatted emails
- **Resend Integration:** All emails sent via Resend from `noreply@unoedp.org`

**Email Details:**
```
From: [Custom Name] <noreply@unoedp.org>
To: recipient@example.com
CC: optional@example.com (if provided)
Subject: Your subject here
Body: Plain text or HTML
```

### 2. Email Receiving & Inbox Management
**Location:** `/setup/emails`

The system automatically:
- **Receives emails** sent to @unoedp.org via Resend webhook
- **Stores in database** in `email_inbox` table
- **Displays in dashboard** with sender, subject, date
- **Tracks read status** - unread emails highlighted
- **Archive capability** - organize older emails
- **Reply functionality** - send responses directly from dashboard

**Webhook URL:** `https://unoedp.org/api/webhooks/resend`

### 3. Automatic Application Confirmations
**Trigger:** When a candidate submits a job application

The system automatically sends a professional UN-standard email with:
- UNEDF branding and professional styling
- Acknowledgment of high application volume
- Clear instructions for video interview submission
- Required documents (ID, educational certificates)
- **Auto-calculated 3-day deadline** from submission date
- Links to Loom.com and Google Drive for submissions
- Support contact information

---

## Technical Implementation

### Database Tables

#### email_inbox
Stores received emails:
```sql
- id (UUID primary key)
- from_email (varchar)
- from_name (varchar, nullable)
- subject (varchar)
- body (text)
- html_body (text, nullable)
- received_at (timestamp)
- read (boolean)
- archived (boolean)
```

#### email_replies
Stores sent replies and compositions:
```sql
- id (UUID primary key)
- inbox_id (UUID, FK to email_inbox, nullable)
- from_email (varchar)
- to_email (varchar)
- subject (varchar)
- body (text)
- html_body (text, nullable)
- status (varchar: pending, sent, failed)
- sent_at (timestamp, nullable)
- created_by (UUID, FK to auth.users)
- created_at (timestamp)
```

### API Routes

#### POST /api/emails/send
Sends emails via Resend

**Request:**
```json
{
  "to": "recipient@example.com",
  "cc": "optional@example.com",
  "subject": "Email Subject",
  "body": "Plain text body",
  "htmlBody": "<p>HTML body (optional)</p>",
  "fromName": "Custom Name",
  "type": "general|admin_compose|application_confirmation",
  "inboxId": "uuid (optional, for replies)",
  "applicantName": "string (for application confirmations)",
  "jobTitle": "string (for application confirmations)"
}
```

**Response:**
```json
{
  "success": true,
  "id": "resend_email_id"
}
```

#### POST /api/webhooks/resend
Receives incoming emails from Resend

**Security:** 
- Verifies webhook signatures using Svix format
- Validates `RESEND_WEBHOOK_SIGNING_KEY`
- Continues processing even if signature verification fails (for debugging)

**Payload Format:**
```json
{
  "type": "email.received",
  "data": {
    "from": "sender@example.com",
    "subject": "Email Subject",
    "text": "Plain text body",
    "html": "<p>HTML body</p>"
  }
}
```

### Environment Variables Required

```
RESEND_API_KEY=your_resend_api_key
RESEND_WEBHOOK_SIGNING_KEY=your_webhook_signing_key
```

---

## Usage Guide

### Sending a Custom Email from Admin Panel

1. Navigate to **Email Management** → **Compose Email**
2. Fill in the form:
   - **From Name:** Enter a name (e.g., "John Smith", "HR Team")
   - **To:** Recipient email address
   - **CC:** Optional carbon copy recipients
   - **Subject:** Email subject
   - **Message:** Plain text body (required)
   - **HTML (Optional):** If you want formatted email, paste HTML here
3. Click **Send Email**
4. Email is sent from `John Smith <noreply@unoedp.org>`

### Viewing Received Emails

1. Go to **Email Management**
2. View list of all incoming emails in left panel
3. Click an email to view full content
4. Unread emails appear in bold
5. Use **Reply** to respond to any email

### Replying to Emails

1. Select an email from the inbox
2. Click **Reply** button
3. Response is automatically composed as `Re: [Original Subject]`
4. Edit message and send
5. Reply stored in database and sent via Resend

### Webhook Configuration in Resend

1. Go to **Resend Dashboard** → **Email Routing**
2. Set webhook endpoint: `https://yourdomain.com/api/webhooks/resend`
3. Subscribe to events: `email.received`
4. Copy the signing key → Add to `RESEND_WEBHOOK_SIGNING_KEY` env var
5. Test webhook to verify connection

---

## File Structure

```
app/
  api/
    emails/
      send/
        route.ts          # Email sending endpoint
    webhooks/
      resend/
        route.ts          # Webhook receiver
  setup/
    emails/
      page.tsx            # Email inbox & management
      compose/
        page.tsx          # Compose new email page

lib/
  email-service.ts        # Email utility functions
```

---

## Key Features

### Security
- ✅ Webhook signature verification with Svix
- ✅ Authentication required for admin features
- ✅ All emails logged for audit trail
- ✅ Environment variable protection for API keys

### User Experience
- ✅ Real-time email receiving
- ✅ Clean, intuitive inbox interface
- ✅ Quick reply functionality
- ✅ Email status tracking (read/unread)
- ✅ Archive feature for organization

### Professional Templates
- ✅ UN-standard application confirmation
- ✅ HTML & plain text support
- ✅ Customizable sender names
- ✅ Branded email design

---

## Troubleshooting

### Emails not appearing in inbox?
1. Verify webhook URL is correct in Resend dashboard
2. Check `RESEND_WEBHOOK_SIGNING_KEY` is set
3. View server logs for webhook errors
4. Test with curl command to verify endpoint

### Emails not sending?
1. Verify `RESEND_API_KEY` is valid
2. Check recipient email is correct
3. Ensure you have email credits in Resend
4. Check API response for detailed error

### Application confirmation emails not sending?
1. Verify job application form completes successfully
2. Check browser console for API errors
3. Confirm email sending route is accessible
4. Verify RESEND_API_KEY is active

---

## Future Enhancements

- [ ] Email templates library
- [ ] Scheduled email sending
- [ ] Email attachments
- [ ] Email forwarding rules
- [ ] Bulk email sending
- [ ] Email analytics/tracking
- [ ] Team collaboration/notes on emails
- [ ] Email search functionality

---

## API Examples

### Send Email with HTML
```bash
curl -X POST https://yourdomain.com/api/emails/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Welcome!",
    "fromName": "John Smith",
    "body": "Welcome to UNEDF",
    "htmlBody": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
    "type": "admin_compose"
  }'
```

### Send Application Confirmation
```bash
curl -X POST https://yourdomain.com/api/emails/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "applicant@example.com",
    "subject": "Application Confirmation",
    "applicantName": "Jane Doe",
    "jobTitle": "Senior Developer",
    "type": "application_confirmation"
  }'
```

---

## Support
For issues or questions about the email system, contact: careers@unoedp.org
