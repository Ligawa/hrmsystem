# 📧 World Vision Email Management System

## What's New?

Your World Vision application now has a **complete email management system** powered by Resend. Send and receive emails, manage an inbox, and reply to applicants—all from your admin dashboard.

---

## 🎯 Quick Start

```
1. Configure Resend Webhook
   └─ Go to Resend dashboard
   └─ Add webhook: /api/webhooks/resend
   └─ Select event: email.received

2. Create Admin Account  
   └─ Visit /setup/register
   └─ Use authorized email domain
   └─ Verify email

3. Access Email Pages
   └─ /setup/emails ← View inbox & reply
   └─ /setup/email-settings ← Configuration
```

---

## 📊 What You Get

### Email Inbox Management
```
/setup/emails
├─ View all incoming emails
├─ Click email to read full message
├─ Reply directly with modal dialog
├─ Archive or delete emails
└─ Mark as read/unread
```

### Email Settings
```
/setup/email-settings
├─ View webhook configuration
├─ Copy webhook URL
├─ See configured domains
├─ Toggle email receiving
└─ Access setup instructions
```

### Admin Authentication
```
/setup/register (Admin Only)
├─ Restricted to: Authorized email domains
├─ Not visible on public signup
├─ Email verification required
└─ Secure password protection
```

---

## 🔧 Technology Stack

| Component | Technology |
|-----------|-----------|
| Email Service | Resend |
| Database | Supabase |
| Framework | Next.js 16 |
| Authentication | Supabase Auth |
| API | REST |
| UI | Shadcn/UI |

---

## 📁 File Structure

```
app/
├─ setup/
│  ├─ emails/
│  │  └─ page.tsx              (Email inbox management)
│  ├─ email-settings/
│  │  └─ page.tsx              (Configuration page)
│  └─ register/page.tsx        (Updated with domain check)
├─ api/
│  ├─ emails/
│  │  └─ send/route.ts         (Send email replies)
│  └─ webhooks/
│     └─ resend/route.ts       (Receive emails)

lib/
└─ email-service.ts            (Email utility & templates)

components/ui/
└─ dialog.tsx                  (Dialog component)

scripts/
└─ add-email-tables.sql        (Database migration)

Documentation/
├─ EMAIL_SETUP.md              (Setup guide)
├─ EMAIL_CONFIG_REFERENCE.md   (Technical reference)
├─ RESEND_EMAIL_SETUP_COMPLETE.md (Implementation details)
├─ IMPLEMENTATION_SUMMARY.md    (Summary)
├─ SETUP_CHECKLIST.md          (Step-by-step checklist)
└─ README_EMAIL_SYSTEM.md      (This file)
```

---

## 🚀 Features

| Feature | Status |
|---------|--------|
| Receive emails | ✅ Automatic via webhook |
| View inbox | ✅ `/setup/emails` |
| Reply to emails | ✅ In-app modal dialog |
| Send automated emails | ✅ Via email service |
| Admin settings | ✅ `/setup/email-settings` |
| Domain restriction | ✅ @unoedp.org, @alghahim.co.ke |
| Database protection | ✅ RLS enabled |
| Email templates | ✅ Pre-built + customizable |

---

## 🔐 Security

✅ **Authentication** - Admin login required  
✅ **Domain Restriction** - Only authorized email domains  
✅ **RLS Protection** - Database-level security  
✅ **Encryption** - Secure data storage  
✅ **Validation** - Input sanitization  
✅ **Logging** - Error tracking  

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| EMAIL_SETUP.md | Complete setup instructions |
| EMAIL_CONFIG_REFERENCE.md | Technical reference |
| RESEND_EMAIL_SETUP_COMPLETE.md | Implementation guide |
| SETUP_CHECKLIST.md | Step-by-step checklist |
| IMPLEMENTATION_SUMMARY.md | Overview & summary |

---

## 🔗 Related Pages

**Admin Dashboard**: `/setup`  
**Email Inbox**: `/setup/emails`  
**Email Settings**: `/setup/email-settings`  
**Application Portal**: `/application-portal` (for secure document uploads)  
**Admin Login**: `/setup/login`  
**Admin Registration**: `/setup/register`  

---

## 📧 Email Templates

Pre-built templates included:

```typescript
// Application confirmation
emailTemplates.applicationConfirmation(
  applicantName: string,
  jobTitle: string
)

// Application decision
emailTemplates.applicationDecision(
  applicantName: string,
  jobTitle: string,
  approved: boolean
)

// Newsletter signup
emailTemplates.newsletterSignup()
```

---

## 🛠️ API Endpoints

### Send Email Reply
```
POST /api/emails/send

{
  "inboxId": "uuid",
  "toEmail": "recipient@example.com",
  "subject": "Reply subject",
  "body": "Reply text"
}
```

### Receive Email (Webhook)
```
POST /api/webhooks/resend

Triggered automatically by Resend
Requires: email.received event
```

---

## 💡 Usage Examples

### Send Automated Email
```typescript
import { sendEmail, emailTemplates } from '@/lib/email-service';

const template = emailTemplates.applicationConfirmation(
  'John Doe',
  'Senior Developer'
);

await sendEmail({
  to: 'john@example.com',
  subject: template.subject,
  html: template.html
});
```

### Send Custom Email
```typescript
import { sendEmail } from '@/lib/email-service';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to UNDP',
  html: '<h1>Hello!</h1><p>Welcome...</p>'
});
```

---

## 🧪 Testing

### Test Email Receiving
1. Send email to your domain
2. Wait 1-2 minutes
3. Check `/setup/emails` inbox

### Test Email Replying
1. Go to `/setup/emails`
2. Click an email
3. Click "Reply"
4. Type message and send

### Test Admin Access
1. Try signing up with gmail.com → Blocked ✅
2. Try signing up with @unoedp.org → Allowed ✅

---

## ⚙️ Configuration

### Environment Variables Required
```
RESEND_API_KEY=your_api_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key
```

### Database Tables Created
- `email_inbox` - Incoming emails
- `email_replies` - Outgoing replies
- `email_settings` - Configuration

### Verified Domain
- Domain: unoedp.org
- Email receiving: Enabled
- Email sending: Enabled

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Emails not appearing | Check Resend webhook is configured |
| Can't access admin | Use @unoedp.org or @alghahim.co.ke email |
| Reply not sending | Verify RESEND_API_KEY is set |
| Webhook failing | Check webhook URL in Resend settings |
| Database errors | Verify RLS policies are enabled |

See **SETUP_CHECKLIST.md** for detailed troubleshooting.

---

## 📊 Database Schema

### email_inbox
```sql
- id (UUID)
- from_email (VARCHAR)
- subject (TEXT)
- body (TEXT)
- html_body (TEXT)
- received_at (TIMESTAMP)
- read (BOOLEAN)
- archived (BOOLEAN)
```

### email_replies
```sql
- id (UUID)
- inbox_id (UUID FK)
- from_email (VARCHAR)
- to_email (VARCHAR)
- subject (TEXT)
- body (TEXT)
- status (VARCHAR) - draft/sent/failed
- sent_at (TIMESTAMP)
- created_by (UUID FK)
```

### email_settings
```sql
- id (UUID)
- domain (VARCHAR)
- is_active (BOOLEAN)
- allowed_reply_tos (TEXT[])
```

---

## 🎯 Next Steps

1. ✅ Read SETUP_CHECKLIST.md
2. ✅ Configure Resend webhook
3. ✅ Test admin registration
4. ✅ Send test email
5. ✅ Reply via admin panel
6. ✅ Integrate email templates in your app

---

## 📞 Support

- **Setup Issues**: See SETUP_CHECKLIST.md
- **Configuration**: See EMAIL_CONFIG_REFERENCE.md
- **Implementation**: See RESEND_EMAIL_SETUP_COMPLETE.md
- **Resend Docs**: https://resend.com/docs

---

## ✨ Summary

Your UNDP application now has a **production-ready email system** with:

✅ Automatic email receiving  
✅ Beautiful admin inbox interface  
✅ Reply functionality  
✅ Email configuration  
✅ Admin access control  
✅ Secure database  
✅ Pre-built templates  
✅ Full API integration  
✅ Complete documentation  

**Everything is ready to use!** 🚀

---

**Last Updated**: 2024  
**Version**: 1.0  
**Status**: ✅ PRODUCTION READY  
**Organization**: World Vision  
**Application Note**: All templates updated to use secure document upload portal instead of email attachments
