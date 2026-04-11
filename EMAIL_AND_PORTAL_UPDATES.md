# Email Templates & Secure Document Portal Updates

## Overview

This document outlines the comprehensive updates made to the email system and introduction of a secure document upload portal for World Vision applicants.

### Key Changes

1. **Organization Rebranding**: All UNEDP/UNDP references replaced with World Vision
2. **Secure Document Handling**: Email templates no longer request document submission via email
3. **Secure Upload Portal**: New applicant-facing portal for document uploads
4. **Admin Dashboard**: New interface to view and manage submitted documents
5. **Email Template Updates**: All email templates redesigned to direct applicants to secure portal

---

## 1. Email Template Updates

### Updated Files
- `/app/api/emails/send/route.ts` - All email templates updated

### Changes Made

#### Application Confirmation Email
**Previous Approach:**
- Asked applicants to attach documents to email replies
- Requested ID documents and certificates via email
- Provided multiple submission methods including email attachments

**New Approach:**
- Directs applicants to secure upload portal at `/application-portal`
- Clear instructions: "DO NOT SEND DOCUMENTS VIA EMAIL"
- Provides secure button/link to access portal
- Maintains video interview link flexibility (Loom, Google Drive, etc.)

#### Offer Letter Templates
**Changes:**
- Updated from "UNEDF" to "World Vision"
- Updated footer and contact information
- Maintained signing workflow (unchanged)

#### Reminder Email Templates
**Previous Approach:**
- Asked for email submission of documents
- Mentioned replying with attachments

**New Approach:**
- Links to secure portal for document uploads
- Explicit warning against email submission
- Portal URL prominently displayed

### Email Template Structure

All email templates now include:

```
Organization: World Vision
Contact: careers@worldvision.org
Portal Link: {NEXT_PUBLIC_BASE_URL}/application-portal
```

**Email Types Updated:**
1. Application Confirmation (`application_confirmation`)
2. Offer Letter (`offer_letter`)
3. Offer Letter Signed (`offer_letter_signed`)
4. Reminder Email (`reminder`)

---

## 2. Secure Document Upload Portal

### New Component
**Location:** `/app/application-portal/page.tsx`

### Features

#### Authentication
- Email-based access (no password required for simplicity)
- Applicants enter email to access portal
- Session-based access control

#### Video Interview Submission
- Accepts links from:
  - Loom (recommended)
  - YouTube/YouTube
  - Google Drive
  - Vimeo
- Link validation to prevent invalid submissions
- Single video link per submission

#### Document Upload
- **Drag-and-drop interface** for file uploads
- **File upload** via file browser
- **Supported file types:**
  - PDF
  - Images (JPG, PNG)
  - Word documents (DOC, DOCX)
  - Videos (MP4, MOV)

#### Validation & Limits
- Maximum file size: 50MB per file
- File type validation
- Real-time error messages
- User-friendly feedback

#### Submission Management
- View all uploaded documents
- Remove individual files before submission
- Submit only when all requirements met
- Submission confirmation

### Required Documents Checklist
- ✓ Valid government-issued ID
- ✓ Educational certificates
- ✓ Professional certifications (if applicable)

---

## 3. API Endpoint for Submissions

### New API Route
**Location:** `/app/api/applications/submit/route.ts`

### Endpoints

#### POST /api/applications/submit
**Request Body:**
```json
{
  "email": "applicant@example.com",
  "videoLink": "https://loom.com/share/...",
  "documents": [
    {
      "name": "passport.pdf",
      "size": 1024000,
      "type": "application/pdf"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "submissionId": "APP-1234567890",
  "submittedAt": "2024-01-15T10:30:00Z"
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

**Validation:**
- Required fields: email, videoLink, documents[]
- Email format validation
- Duplicate submission prevention
- Returns 409 if duplicate email found

#### GET /api/applications/submit
**Admin Only** - Retrieves all submissions
- Requires Bearer token authorization
- Returns array of all submissions
- Includes submission count

---

## 4. Admin Dashboard Updates

### New Component
**Location:** `/components/admin/applications-submissions.tsx`

### Features

#### Submission List View
- Table displaying all submissions
- Email address with copy-to-clipboard
- Submission date/time
- Document count
- Quick access to video link

#### Submission Details Modal
- Complete applicant information
- Video link with external link button
- All uploaded documents listed
- Document metadata (name, size)
- Submission timestamp

#### Admin Actions
- View full submission details
- Copy applicant email
- Open video interview in new tab
- View all documents

### Permissions
- Admin-only access
- Bearer token authentication required
- Non-authenticated access shows demo message with instructions

---

## 5. New Admin Pages

### Document Submissions Page
**Location:** `/app/setup/submissions/page.tsx`

- Dedicated page for viewing all applicant submissions
- Integrated with ApplicationsSubmissions component
- Accessible from admin dashboard quick actions
- Direct link in setup sidebar

### Setup Dashboard Updates
**File:** `/app/setup/page.tsx`

**Changes:**
- Added "View Document Submissions" quick action
- Updated help text to mention secure portal
- Linked to `/setup/submissions`

---

## 6. Documentation Updates

### README_EMAIL_SYSTEM.md
**Changes:**
- Updated organization name from UNDP to World Vision
- Updated email domain references
- Added secure upload portal to related pages
- Added application note about secure submissions

### Branding Updates
- All UNEDF references changed to "World Vision"
- All UNEDP references changed to "World Vision"
- Updated contact email template: `careers@worldvision.org`

---

## 7. Security Considerations

### Current Implementation (Demo Mode)
- In-memory storage of submissions
- Basic email validation
- Duplicate submission prevention

### Production Recommendations
1. **Database Storage**
   - Store submissions in secure database (Supabase, Neon, etc.)
   - Implement proper encryption
   - Add audit logging

2. **Authentication**
   - Implement proper OAuth/email verification
   - Session tokens with expiration
   - Rate limiting on submissions

3. **File Handling**
   - Store files in secure cloud storage (Vercel Blob, S3, etc.)
   - Implement virus scanning
   - Generate secure download links
   - Add access logs

4. **Data Protection**
   - Implement RLS policies
   - GDPR compliance measures
   - Data retention policies
   - Secure deletion procedures

---

## 8. User Flows

### Applicant Flow
1. Receives email with application confirmation
2. Clicks "Access Secure Upload Portal" button
3. Enters email address to access portal
4. Adds video link (Loom, YouTube, Google Drive, Vimeo)
5. Uploads supporting documents via drag-drop
6. Reviews submission
7. Clicks "Submit Application"
8. Receives confirmation

### Admin Flow
1. Goes to Admin Dashboard (`/setup`)
2. Clicks "View Document Submissions" quick action
3. Views list of all submissions
4. Clicks "View" to see submission details
5. Reviews video and documents
6. Contacts applicant with any follow-up questions

---

## 9. Environment Variables

### Required for Email Templates
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

This is used in email links to the secure portal.

---

## 10. Testing Checklist

- [ ] Email templates render correctly in email clients
- [ ] Application portal loads without authentication
- [ ] Drag-drop file upload works
- [ ] File size validation works (50MB limit)
- [ ] File type validation works
- [ ] Video link validation works
- [ ] Submission API stores data correctly
- [ ] Admin can view submissions
- [ ] Modal details display correctly
- [ ] Copy email button works
- [ ] External links open in new tab
- [ ] Responsive design on mobile

---

## 11. Migration Notes

If migrating from email-based submissions:

1. **Notify Applicants**
   - Update instructions to use secure portal
   - Provide portal link in communications

2. **Disable Email Submissions**
   - Configure email system to reject submissions
   - Add auto-reply with portal link

3. **Archive Old Data**
   - Backup email submissions
   - Migrate relevant data to new system

4. **Update Documentation**
   - HR team should use new admin page
   - Update internal procedures

---

## 12. Support & Troubleshooting

### Common Issues

**Issue:** Admin can't see submissions
- Check Bearer token in API request
- Verify /api/applications/submit endpoint is accessible
- Check browser console for errors

**Issue:** Email links don't work
- Verify NEXT_PUBLIC_BASE_URL environment variable
- Test email client link rendering
- Check URL structure in email template

**Issue:** File upload fails
- Check file size (max 50MB)
- Verify file type is in allowed list
- Check browser console for errors
- Verify form submission handler

---

## 13. Future Enhancements

### Phase 2 Considerations
1. Database integration for persistent storage
2. Secure file storage (Blob, S3)
3. Advanced search and filtering
4. Email notifications for submissions
5. Export submissions (PDF, CSV)
6. Applicant status tracking
7. Document versioning
8. Digital signature integration
9. Compliance reporting
10. Webhook notifications to external systems

---

## Summary

The new system provides a professional, secure way for World Vision applicants to submit their materials. Email no longer carries sensitive documents; instead, a dedicated portal handles all submissions with proper validation, security considerations, and administrative review capabilities.

**Key Benefits:**
- ✅ Secure document handling
- ✅ Professional applicant experience
- ✅ Reduced email security risks
- ✅ Centralized submission management
- ✅ Easy admin review interface
- ✅ Clear audit trail
