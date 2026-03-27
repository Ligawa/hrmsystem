# ✅ Email System Setup Checklist

## Pre-Setup (What We Did)
- ✅ Created database tables (email_inbox, email_replies, email_settings)
- ✅ Set up Row Level Security (RLS) policies
- ✅ Created admin pages (/setup/emails, /setup/email-settings)
- ✅ Built API endpoints for sending and receiving emails
- ✅ Created email service with templates
- ✅ Added domain validation to admin signup
- ✅ Updated admin sidebar with email links
- ✅ Added Dialog component
- ✅ Added Resend dependency to package.json

## Setup Steps (What You Need To Do)

### Step 1: Environment Variables ✅
- [x] RESEND_API_KEY added to environment
- [x] NEXT_PUBLIC_SUPABASE_URL set
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY set
- [x] SUPABASE_SERVICE_ROLE_KEY set

**Status**: Ready - Already configured in Vercel

---

### Step 2: Resend Configuration (IMPORTANT)

**Timeline**: Do this immediately

#### 2.1 Get Webhook URL
- [ ] Copy this URL: `https://yourdomain.com/api/webhooks/resend`
  - Replace `yourdomain.com` with your actual domain
  - Go to Settings > Vars in v0 sidebar to see your domain

#### 2.2 Add Webhook in Resend
- [ ] Go to https://resend.com/dashboard
- [ ] Navigate to **Domains** > Your Domain > **Webhooks**
- [ ] Click **Add Webhook**
- [ ] Enter webhook URL from Step 2.1
- [ ] Select Event Type: `email.received`
- [ ] Make sure **Enabled** is toggled ON
- [ ] Save webhook
- [ ] Test webhook (optional but recommended)

#### 2.3 Verify Domain
- [ ] Domain unoedp.org is verified in Resend
- [ ] DNS records are properly configured (SPF, DKIM, DMARC)
- [ ] Domain status shows "Verified"

---

### Step 3: Test Admin Access

**Timeline**: After Step 2

#### 3.1 Register Admin Account
- [ ] Go to `https://yourdomain.com/setup/register`
- [ ] Enter details:
  - Full Name: Your Name
  - Email: yourname@unoedp.org or yourname@alghahim.co.ke
  - Department: Your Department
  - Password: Secure password (8+ characters)
  - Reason: Why you need access
- [ ] Submit registration
- [ ] Check email for verification link
- [ ] Click verification link
- [ ] Email confirmed ✅

#### 3.2 Sign In
- [ ] Go to `https://yourdomain.com/setup/login`
- [ ] Enter your email and password
- [ ] Click Sign In
- [ ] Should redirect to `/setup` dashboard ✅

#### 3.3 Access Email Pages
- [ ] Go to `https://yourdomain.com/setup/emails`
- [ ] You should see the email inbox (empty initially)
- [ ] Go to `https://yourdomain.com/setup/email-settings`
- [ ] You should see configuration instructions ✅

---

### Step 4: Test Email Receiving

**Timeline**: After Step 3

#### 4.1 Send Test Email
- [ ] Send an email to a @unoedp.org address
  - Example: hello@unoedp.org
  - Use any email client
  - Subject: "Test Email"
  - Body: "This is a test"

#### 4.2 Check Inbox
- [ ] Go to `/setup/emails`
- [ ] Wait 1-2 minutes
- [ ] Test email should appear in list
- [ ] Check timestamp is correct ✅

#### 4.3 View Email Details
- [ ] Click the test email in the inbox
- [ ] View full email details in right panel
- [ ] See sender, subject, message
- [ ] Check timestamp ✅

---

### Step 5: Test Email Replying

**Timeline**: After Step 4

#### 5.1 Reply to Email
- [ ] Open test email from Step 4.3
- [ ] Click "Reply" button
- [ ] Enter reply subject and message
- [ ] Click "Send Reply"
- [ ] See success message ✅

#### 5.2 Check Reply
- [ ] Go to `/setup/email-settings`
- [ ] Check email delivery logs if available
- [ ] Verify reply was sent ✅

---

### Step 6: Test Domain Restriction

**Timeline**: After Step 5

#### 6.1 Try Invalid Domain
- [ ] Go to `/setup/register`
- [ ] Try registering with email@gmail.com
- [ ] See error: "Admin access is only available for unoedp.org and alghahim.co.ke"
- [ ] Registration blocked ✅

#### 6.2 Try Valid Domain
- [ ] Go to `/setup/register`
- [ ] Register with test@unoedp.org
- [ ] Registration succeeds ✅

---

### Step 7: Advanced Testing (Optional)

#### 7.1 Archive Email
- [ ] In `/setup/emails`, open an email
- [ ] Click "Archive" button
- [ ] Email disappears from list
- [ ] Can be restored from database if needed ✅

#### 7.2 Delete Email
- [ ] In `/setup/emails`, open an email
- [ ] Click "Delete" button
- [ ] Email is permanently removed
- [ ] Cannot be recovered ✅

#### 7.3 Send Automated Email
- [ ] Create a simple route that calls `sendEmail()`
- [ ] Or use manual test in your code
- [ ] Email should be delivered ✅

---

## Configuration Summary

### Resend Settings
- Domain: unoedp.org
- Webhook: /api/webhooks/resend
- Event: email.received
- Status: Active

### Database
- Tables: email_inbox, email_replies, email_settings
- RLS: Enabled on all tables
- Indexes: Created for performance

### Admin Access
- Allowed Domains: @unoedp.org, @alghahim.co.ke
- Pages: /setup/emails, /setup/email-settings
- Authentication: Required

### API Endpoints
- POST /api/emails/send
- POST /api/webhooks/resend

---

## Verification Checklist

### Functionality ✅
- [x] Email receiving configured
- [x] Email inbox page created
- [x] Reply functionality built
- [x] Admin auth implemented
- [x] Domain validation added
- [x] Database set up
- [x] API endpoints ready
- [x] Email templates created

### Database ✅
- [x] Tables created
- [x] RLS enabled
- [x] Indexes created
- [x] Relationships configured

### Security ✅
- [x] Authentication required
- [x] Domain restrictions
- [x] RLS policies
- [x] Input validation
- [x] Error handling

### Documentation ✅
- [x] EMAIL_SETUP.md
- [x] EMAIL_CONFIG_REFERENCE.md
- [x] RESEND_EMAIL_SETUP_COMPLETE.md
- [x] IMPLEMENTATION_SUMMARY.md
- [x] SETUP_CHECKLIST.md

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Emails not appearing | Check Resend webhook configuration |
| Can't sign in | Verify email domain is allowed |
| Can't send reply | Check RESEND_API_KEY is set |
| Webhook failing | Verify webhook URL is correct |
| Database errors | Check RLS policies are enabled |
| Page won't load | Check authentication is working |

---

## Support Resources

- 📖 **Setup Guide**: EMAIL_SETUP.md
- 📋 **Configuration Reference**: EMAIL_CONFIG_REFERENCE.md
- 📝 **Implementation Details**: RESEND_EMAIL_SETUP_COMPLETE.md
- ✅ **This Checklist**: SETUP_CHECKLIST.md

---

## Current Status

**Core Implementation**: ✅ COMPLETE  
**Database Setup**: ✅ COMPLETE  
**Admin Pages**: ✅ COMPLETE  
**API Endpoints**: ✅ COMPLETE  
**Security**: ✅ COMPLETE  
**Documentation**: ✅ COMPLETE  

**Your Setup Tasks**: 
- [ ] Configure Resend webhook
- [ ] Test admin registration
- [ ] Send test email
- [ ] Reply to test email

---

## Next Steps After This Checklist

1. ✅ Complete Steps 1-7 above
2. 📧 Integrate email templates in application
3. 🔔 Set up email notifications
4. 📊 Monitor email delivery
5. 📈 Scale as needed

---

## Questions?

1. Check documentation files first
2. Review `/setup/email-settings` for help
3. Check application logs for errors
4. Contact Resend support for API issues

---

**Ready to start?** Begin with **Step 2: Resend Configuration** 🚀

Last updated: 2024
