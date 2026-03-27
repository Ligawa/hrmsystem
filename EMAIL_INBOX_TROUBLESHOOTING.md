# Email Inbox Troubleshooting Guide

## Problem: Emails Not Showing in /setup/emails

If your emails are showing in Resend dashboard but not appearing in the `/setup/emails` page, follow these steps:

---

## Solution Overview

The system works through a 2-tier approach:

1. **Resend Webhook** - Receives emails and stores in database
2. **Database Sync** - Application reads from `email_inbox` table
3. **Debug Tools** - Diagnose issues quickly

---

## Diagnostic Steps

### Step 1: Access Debug Page
Navigate to `/setup/emails/debug` (button available on main emails page)

### Step 2: Run Health Check
Click "Test Email Service" - this will:
- Check database connectivity
- Count total emails in inbox
- Verify service is operational

### Step 3: Review Results
The debug page shows:
```json
{
  "healthCheck": {
    "success": true,
    "emailCount": 5,
    "message": "Email service is operational"
  },
  "emailList": {
    "success": true,
    "emails": [...],
    "count": 5
  }
}
```

---

## Common Issues & Fixes

### Issue 1: Zero Emails in Debug Output

**Cause:** Webhook not delivering emails to database

**Solution:**
1. Verify webhook URL in Resend dashboard: `https://unoedp.org/api/webhooks/resend`
2. Check webhook signing key is configured
3. Ensure event type is `email.received`
4. Test by sending an email to @unoedp.org
5. Check browser console for webhook errors

### Issue 2: Database Shows Emails but Page Shows Nothing

**Cause:** Permission or RLS policy issue

**Solution:**
1. Ensure you're logged in as admin
2. Check Supabase RLS policies on `email_inbox` table
3. Verify `email_inbox` table has:
   - `Allow read email_inbox to authenticated users` policy
   - `Allow insert email_inbox for service role` policy

### Issue 3: Webhook Signature Verification Fails

**Cause:** Wrong signing key or webhook format

**Solution:**
```bash
# In Resend dashboard:
1. Go to API Webhooks
2. Find your @unoedp.org domain webhook
3. Copy the signing key
4. Paste in RESEND_WEBHOOK_SIGNING_KEY env var
5. Restart application
```

### Issue 4: Emails Come Through But Show No Content

**Cause:** Email body not being extracted properly

**Solution:**
1. Check webhook log for email format
2. Ensure `from`, `subject`, `text`, and `html` fields exist
3. Verify email wasn't bounced/rejected in Resend

---

## Environment Variables Checklist

Required variables:
```
✓ RESEND_API_KEY=re_xxxxx
✓ RESEND_WEBHOOK_SIGNING_KEY=whsec_xxxxx
✓ NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
✓ SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

---

## Database Structure

The `email_inbox` table stores:
```sql
- id (uuid) - Unique email ID
- from_email (text) - Sender email
- from_name (text) - Sender name
- subject (text) - Email subject
- body (text) - Plain text body
- html_body (text) - HTML version
- received_at (timestamp) - When email arrived
- read (boolean) - Read/unread status
- archived (boolean) - Archive status
- created_at (timestamp) - Database record time
```

---

## Manual Testing

### Test 1: Send Email to @unoedp.org
```bash
1. Use any email client or Resend dashboard
2. Send email to: any@unoedp.org
3. Wait 5 seconds
4. Refresh /setup/emails page
5. Should appear in inbox
```

### Test 2: Check Webhook Logs
```bash
1. Go to Resend dashboard
2. Select @unoedp.org domain
3. Click "Webhooks"
4. Check event logs
5. Look for `email.received` events with status 200
```

### Test 3: Direct Database Query
```sql
-- In Supabase SQL editor
SELECT COUNT(*) FROM email_inbox;
SELECT * FROM email_inbox ORDER BY received_at DESC LIMIT 10;
```

---

## Auto-Refresh Feature

The emails page automatically refreshes every 30 seconds. To manually refresh:
1. Click the Debug button
2. Click "Manual Sync"
3. Or press F5 to reload page

---

## Webhook Setup in Resend

**Correct Configuration:**

1. **Event Type:** `email.received`
2. **URL:** `https://unoedp.org/api/webhooks/resend`
3. **Signing Key:** Copy from webhook details
4. **Active:** Toggle ON

**Test Webhook:**
```bash
curl -X POST https://unoedp.org/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -H "svix-signature: v1=test" \
  -d '{
    "type": "email.received",
    "data": {
      "from": "test@example.com",
      "subject": "Test Email",
      "text": "This is a test",
      "html": "<p>This is a test</p>"
    }
  }'
```

---

## Getting Help

Check these in order:
1. `/setup/emails/debug` - Run diagnostic tests
2. Browser console (F12) - JavaScript errors
3. Vercel logs - Server-side errors
4. Resend dashboard - Webhook delivery logs
5. Supabase dashboard - Database logs

---

## Next Steps If Issues Persist

If emails still not showing after trying all above:

1. Check that Resend webhook is actually sending requests
2. Verify database `email_inbox` table exists and is accessible
3. Confirm RLS policies aren't blocking inserts
4. Test with `/api/emails/sync` endpoint directly
5. Review application logs in Vercel dashboard

