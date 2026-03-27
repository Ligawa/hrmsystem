# Email Configuration Reference

## Configuration Summary

### Domain Information
- **Main Domain**: unoedp.org
- **Alternate Domain**: alghahim.co.ke
- **Email Receiving**: Enabled
- **Email Sending**: Enabled via Resend

### Admin Access Restrictions
- **Allowed Signup Domains**: @unoedp.org, @alghahim.co.ke
- **Access Level**: Admin only
- **Public Visibility**: Hidden from public signup

### Services & APIs

#### Resend
- **Service**: Email sending and receiving
- **API Key**: `RESEND_API_KEY` (set in environment)
- **Webhook URL**: `/api/webhooks/resend`
- **Webhook Events**: email.received

#### Supabase
- **Service**: Data persistence
- **Tables**: email_inbox, email_replies, email_settings
- **RLS**: Enabled on all tables

---

## API Endpoints

### Email Management
```
POST /api/emails/send
- Send a reply to an incoming email
- Requires: Authentication
- Body: { inboxId, toEmail, subject, body, htmlBody }
```

### Webhooks
```
POST /api/webhooks/resend
- Receive incoming emails from Resend
- No auth required (webhook signature recommended)
- Triggered by: email.received event
```

---

## Database Schema

### email_inbox
```sql
id (UUID) PRIMARY KEY
from_email VARCHAR(255) NOT NULL
from_name VARCHAR(255)
subject TEXT NOT NULL
body TEXT
html_body TEXT
received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
read BOOLEAN DEFAULT FALSE
archived BOOLEAN DEFAULT FALSE
```

### email_replies
```sql
id (UUID) PRIMARY KEY
inbox_id UUID REFERENCES email_inbox(id)
from_email VARCHAR(255) NOT NULL
to_email VARCHAR(255) NOT NULL
subject TEXT NOT NULL
body TEXT NOT NULL
html_body TEXT
status VARCHAR(50) DEFAULT 'draft' -- draft, sent, failed
sent_at TIMESTAMP WITH TIME ZONE
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
created_by UUID REFERENCES auth.users(id)
```

### email_settings
```sql
id (UUID) PRIMARY KEY
domain VARCHAR(255) NOT NULL UNIQUE
is_active BOOLEAN DEFAULT TRUE
allowed_reply_tos TEXT[] DEFAULT ARRAY['unoedp.org', 'alghahim.co.ke']
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

---

## Email Templates

Available in `lib/email-service.ts`:

### applicationConfirmation(applicantName, jobTitle)
- **Subject**: `Application Confirmation - {jobTitle}`
- **Usage**: Send after job application received
- **Variables**: applicantName, jobTitle

### applicationDecision(applicantName, jobTitle, approved)
- **Subject**: `Interview Invitation - {jobTitle}` or `Application Update - {jobTitle}`
- **Usage**: Send interview invite or rejection
- **Variables**: applicantName, jobTitle, approved (boolean)

### newsletterSignup()
- **Subject**: `Welcome to UNDP Updates`
- **Usage**: Send to new newsletter subscribers
- **Variables**: None

---

## Page Routes

### Admin Pages
- `/setup/emails` - Email inbox management
- `/setup/email-settings` - Configuration page
- `/setup/register` - Admin registration (restricted domains)
- `/setup/login` - Admin login

### API Routes
- `/api/emails/send` - Send email reply
- `/api/webhooks/resend` - Resend webhook handler

---

## Security Policies (RLS)

### email_inbox
- SELECT: All authenticated users
- INSERT: Service role only
- UPDATE: Service role only
- DELETE: Service role only

### email_replies
- SELECT: All authenticated users
- INSERT: Authenticated users
- UPDATE: Creator only
- DELETE: Creator only

### email_settings
- SELECT: All authenticated users
- INSERT: Service role only
- UPDATE: Service role only

---

## Environment Variables

Required for email functionality:

```
RESEND_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Email Sending Examples

### Using Email Service
```typescript
import { sendEmail, emailTemplates } from '@/lib/email-service';

// Send confirmation
const template = emailTemplates.applicationConfirmation('John', 'Developer');
await sendEmail({
  to: 'john@example.com',
  subject: template.subject,
  html: template.html
});

// Custom email
await sendEmail({
  to: 'user@example.com',
  subject: 'Hello',
  html: '<p>Custom content</p>'
});
```

### Using API Endpoint
```typescript
const response = await fetch('/api/emails/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inboxId: 'email-uuid',
    toEmail: 'recipient@example.com',
    subject: 'Reply',
    body: 'Message text'
  })
});
```

---

## Resend Configuration

### Webhook Setup in Resend Dashboard
1. Go to Domain Settings
2. Add Webhook
3. Set URL: `https://yourdomain.com/api/webhooks/resend`
4. Select Event: `email.received`
5. Enable webhook
6. Test webhook

### Domain Verification
1. Add domain to Resend
2. Follow DNS verification steps
3. Add SPF, DKIM, DMARC records
4. Wait for verification
5. Use domain for sending emails

---

## Common Operations

### Receiving an Email
1. Email sent to unoedp.org address
2. Resend receives email
3. Webhook fires to `/api/webhooks/resend`
4. Email stored in `email_inbox` table
5. Admin sees email in `/setup/emails`

### Replying to Email
1. Admin visits `/setup/emails`
2. Clicks email to view details
3. Clicks "Reply" button
4. Enters subject and message
5. Clicks "Send Reply"
6. Reply sent via Resend API
7. Reply stored in `email_replies` table

### Sending Automated Email
1. App triggers email (e.g., application received)
2. Call `sendEmail()` function
3. Email sent via Resend API
4. Email delivered to recipient

---

## Status Codes & Messages

### Success
- 200: Operation successful
- 201: Email created

### Client Errors
- 400: Bad request (missing fields)
- 401: Unauthorized (not authenticated)
- 422: Invalid email address

### Server Errors
- 500: Server error
- 502: API gateway error

---

## Monitoring & Logging

### Check Email Status
- Visit `/setup/emails` to see inbox status
- Click email to see details and replies
- Check sent_at timestamp for replies

### Debug Information
- Check browser console for errors
- Check Vercel logs for server errors
- Check Resend dashboard for webhook failures
- Check Supabase logs for database errors

---

## Maintenance

### Regular Tasks
- Check inbox for unread emails (daily)
- Archive old emails (weekly)
- Review email settings (monthly)
- Monitor delivery failures (ongoing)

### Performance
- Email_inbox table has indexes on received_at, read, archived
- Email_replies table has indexes on inbox_id, status
- Consider archiving old emails periodically

### Backups
- Supabase provides automatic backups
- Email data is stored in RLS-protected tables
- Recovery available through Supabase backup system

---

## Useful Links

- **Resend Dashboard**: https://resend.com/dashboard
- **Resend API Docs**: https://resend.com/docs
- **Resend Support**: https://resend.com/support
- **Email Receiving Docs**: https://resend.com/docs/api-reference/emails/get-email
- **Supabase Console**: https://app.supabase.com

---

## Support Contacts

- **Resend Support**: support@resend.com
- **Supabase Support**: support@supabase.com
- **Application Admin**: contact@unoedp.org

---

Last updated: 2024
Version: 1.0
