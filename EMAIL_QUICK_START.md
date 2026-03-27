# Email System - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Add Environment Variables
Add these to your Vercel project Settings → Environment Variables:

```
RESEND_API_KEY=your_api_key_here
RESEND_WEBHOOK_SIGNING_KEY=your_webhook_key_here
```

### Step 2: Configure Resend Webhook
1. Go to Resend Dashboard → Email Routing
2. Create webhook with URL: `https://yourdomain.com/api/webhooks/resend`
3. Subscribe to: `email.received`
4. Copy signing key → Add as `RESEND_WEBHOOK_SIGNING_KEY`

### Step 3: Test It Works
1. Navigate to `/setup/emails/compose`
2. Fill in test email form
3. Click "Send Email"
4. Check your inbox

---

## 📧 Sending Emails

### From Admin Dashboard

1. Go to **Email Management** → **Compose Email**
2. Fill the form:
   ```
   From Name: John Smith (how it appears to recipient)
   To: recipient@example.com
   CC: optional@example.com
   Subject: Your email subject
   Body: Type your message
   ```
3. Click **Send Email**

### From Code

```javascript
const response = await fetch('/api/emails/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Hello',
    fromName: 'John Smith',
    body: 'Your message here',
    type: 'admin_compose'
  })
});
```

---

## 📬 Receiving Emails

### Automatic
Emails sent to @unoedp.org automatically appear in dashboard inbox within 1-2 seconds.

### View Inbox
1. Go to **Email Management**
2. Left panel shows all received emails
3. Click email to view full content
4. Unread emails appear in bold

### Reply to Email
1. Select email from inbox
2. Click **Reply** button
3. Edit message (starts with "Re: [subject]")
4. Click **Send Reply**

---

## 🎯 Email Types

### Application Confirmation (Automatic)
Sent automatically when candidate submits application:
- Professional UN branding
- 3-day deadline auto-calculated
- Video interview instructions
- Document requirements listed
- Loom.com & Google Drive links

### Admin Compose (Manual)
Send any email you want:
- Custom sender name
- Support plain text & HTML
- CC recipients
- Full control over message

---

## 🔑 Environment Variables

**Required:**
```
RESEND_API_KEY              - Your Resend API key
RESEND_WEBHOOK_SIGNING_KEY  - Webhook verification key
```

**Get from:**
- API Key: Resend Dashboard → API Keys
- Webhook Key: Resend Dashboard → Email Routing → Webhooks

---

## 📍 Key Pages

| Page | Purpose |
|------|---------|
| `/setup/emails` | View inbox & manage emails |
| `/setup/emails/compose` | Send new email |
| `/api/emails/send` | Email sending endpoint |
| `/api/webhooks/resend` | Webhook receiver |

---

## ✅ Verification Checklist

- [ ] Environment variables added to Vercel
- [ ] Webhook URL configured in Resend
- [ ] Webhook signing key copied
- [ ] Test email sent successfully
- [ ] Test email received in inbox
- [ ] Webhook verified in logs
- [ ] Job application test submitted
- [ ] Confirmation email received

---

## 🐛 Troubleshooting

**Webhook not receiving emails?**
```
1. Check webhook URL is correct in Resend
2. Verify RESEND_WEBHOOK_SIGNING_KEY is set
3. Look for errors in server logs
4. Use Resend "Test Webhook" button
```

**Email send fails?**
```
1. Check RESEND_API_KEY is valid
2. Verify recipient email is correct
3. Look for error in response
4. Check Resend dashboard for credits
```

**Signature verification fails?**
```
1. Copy correct webhook key from Resend
2. Add to RESEND_WEBHOOK_SIGNING_KEY
3. Restart server
4. Check server logs for verification message
```

---

## 📊 Email Status

**In Dashboard Inbox:**
- **Bold text** = Unread email
- **Normal text** = Already read
- **Archive** = Hide from inbox
- **Delete** = Remove permanently

**In Database (email_replies):**
- `pending` - Queued for sending
- `sent` - Successfully delivered
- `failed` - Error occurred

---

## 💡 Tips

**Custom Sender Names:**
Use any name that makes sense for your team:
- "John Smith" - Individual person
- "HR Team" - Department
- "Recruitment Manager" - Role
- "UNEDF Support" - Generic

**Recipients See:**
```
From: John Smith <noreply@unoedp.org>
```

**HTML Emails:**
Paste HTML in the optional HTML field for formatted emails:
```html
<h1>Welcome!</h1>
<p>This is a <strong>formatted</strong> email.</p>
```

---

## 🔐 Security Notes

- ✅ All webhooks verified with signing key
- ✅ Admin-only access to compose page
- ✅ API keys stored as environment variables
- ✅ All emails logged for audit trail
- ✅ HTTPS required for webhook

---

## 📞 Support

**Email:** careers@unoedp.org
**Dashboard:** `/setup/emails`
**Docs:** `EMAIL_SYSTEM_COMPLETE.md`

---

## Common Tasks

### Send Welcome Email to New Hire
1. Go to `/setup/emails/compose`
2. From Name: "HR Team"
3. To: new.employee@company.com
4. Subject: "Welcome to UNEDF!"
5. Write message
6. Send

### Reply to Job Inquiry
1. Go to `/setup/emails`
2. Click email from applicant
3. Click "Reply"
4. Type response
5. Send

### Notify All Team of Update
1. Go to `/setup/emails/compose`
2. From Name: Your name
3. To: team@company.com
4. CC: other-team@company.com
5. Write announcement
6. Send

---

**Last Updated:** 2025
**Version:** 1.0
**Status:** Production Ready ✅
