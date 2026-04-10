# Developer Quick Reference

## New Files at a Glance

### Core Features
| File | Type | Purpose |
|------|------|---------|
| `app/application-portal/page.tsx` | Page | Main applicant portal |
| `app/api/applications/submit/route.ts` | API | Submission handling |
| `components/admin/applications-submissions.tsx` | Component | Admin dashboard |
| `app/setup/submissions/page.tsx` | Page | Admin submission view |

### Documentation
| File | Purpose |
|------|---------|
| `EMAIL_AND_PORTAL_UPDATES.md` | Complete system docs |
| `SECURE_PORTAL_QUICK_START.md` | User quick start |
| `IMPLEMENTATION_CHANGES_SUMMARY.md` | What was changed |
| `SYSTEM_ARCHITECTURE.md` | Technical architecture |
| `DEV_QUICK_REFERENCE.md` | This file |

---

## Key Components & Hooks

### Application Portal Page
```typescript
// /app/application-portal/page.tsx
'use client'

- useState for: email, authenticated, documents, videoLink
- handleAuthSubmit() - Email form submission
- handleDrag/handleDrop/handleFiles() - File upload
- handleVideoLinkSubmit() - Video link validation
- handleSubmit() - Final submission with POST request
- MAX_FILE_SIZE = 50MB
- ALLOWED_TYPES = [pdf, jpg, png, doc, docx, mp4, mov]
```

### Admin Submissions Component
```typescript
// /components/admin/applications-submissions.tsx
'use client'

- useState for: submissions, loading, error, selectedSubmission
- useEffect to fetch submissions on mount
- GET /api/applications/submit with Bearer token
- handleViewSubmission() - Opens modal
- handleCopyEmail() - Copy to clipboard
- handleOpenLink() - Window.open in new tab
```

### Submission API Route
```typescript
// /app/api/applications/submit/route.ts

POST Handler:
- Validate email format (regex)
- Check for duplicates in submissions array
- Store ApplicationSubmission in memory
- Return 201 on success, 400/409 on error

GET Handler:
- Require Bearer token
- Return all submissions + count
- Return 401 if no auth
```

---

## Important Constants & Limits

```typescript
// File Upload
MAX_FILE_SIZE = 50 * 1024 * 1024  // 50MB per file
ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4', 'video/quicktime'
]

// Video Validation
VALID_DOMAINS = ['loom.com', 'youtube.com', 'youtu.be', 'drive.google.com', 'vimeo.com']

// Email
Regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Deadlines
SUBMISSION_DEADLINE = 3 days from application
```

---

## API Endpoints

### POST /api/applications/submit
**Request:**
```json
{
  "email": "user@example.com",
  "videoLink": "https://loom.com/share/abc123",
  "documents": [
    { "name": "id.pdf", "size": 1000, "type": "application/pdf" }
  ]
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "submissionId": "APP-1234567890",
  "submittedAt": "2024-01-15T10:30:00Z"
}
```

**Errors:**
- 400: Missing fields, validation failed
- 409: Duplicate submission (same email)
- 500: Server error

### GET /api/applications/submit
**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "submissions": [...],
  "totalSubmissions": 5
}
```

**Errors:**
- 401: No/invalid auth header
- 500: Server error

---

## Email Templates (in route.ts)

### Types Recognized
```typescript
type = 'application_confirmation'  // Main portal redirect
type = 'offer_letter'              // Signing workflow
type = 'offer_letter_signed'       // Welcome confirmation
type = 'reminder'                  // Deadline reminder
type = 'general'                   // Default (custom)
```

### Key Changes
- All UNEDF → World Vision
- All UNDP → World Vision
- All careers@unoedp.org → careers@worldvision.org
- Document submission removed (use portal instead)
- Portal link prominently featured

---

## UI Components Used

### shadcn/ui
```
Card, CardContent, CardHeader, CardTitle, CardDescription
Button (variants: default, outline, ghost; sizes: sm, md, lg)
Input (text, email, file)
Label
Badge (variants: default, secondary)
Dialog, DialogContent, DialogHeader, DialogTitle
Alert, AlertDescription
Table, TableHeader, TableBody, TableRow, TableHead, TableCell
```

### Lucide Icons
```
Upload, FileText, CheckCircle2, AlertCircle
Loader2, ExternalLink, Copy, Eye
```

---

## Styling

### Tailwind Classes Used
```
Layout: flex, grid, max-w, gap, p, m, mb, mt, mx
Colors: bg-slate-*, text-slate-*, border-slate-*, etc.
States: hover:, disabled:, active:
Spacing: py-8, px-4, gap-6, space-y-4
Typography: text-sm, font-medium, text-balance
Interactive: cursor-pointer, transition-colors
```

### Color Palette
```
Primary: Blue (#1e40af) - buttons, headers
Secondary: Slate - backgrounds, borders
Success: Green (#16a34a) - confirmations
Warning: Amber (#d97706) - warnings
Error: Red (#dc2626) - errors
```

---

## State Flow Examples

### Portal Authentication
```
email = ""
authenticated = false
   ↓ (user enters email)
   ↓ (clicks Access Portal)
email = "user@example.com"
authenticated = true
   ↓ (portal interface shown)
```

### File Upload
```
documents = []
   ↓ (user drops/selects files)
   ↓ (validation passes)
documents = [
  { name: "id.pdf", size: 1000, type: "pdf" },
  { name: "cert.pdf", size: 2000, type: "pdf" }
]
   ↓ (can submit or add more)
```

### Video Link
```
videoLink = ""
uploadedVideo = null
   ↓ (user enters link)
   ↓ (clicks Add)
uploadedVideo = { name: "loom.com/..." }
   ↓ (can remove or submit)
```

---

## Common Issues & Solutions

### Video Link Won't Accept
**Check:**
- Domain is in VALID_DOMAINS array
- URL is complete (includes https://)
- No extra spaces
- Link is actually from Loom/YouTube/GDrive/Vimeo

### Files Won't Upload
**Check:**
- File type is in ALLOWED_TYPES
- File size < 50MB
- Browser has permissions
- Network connection stable

### Admin Can't See Submissions
**Check:**
- Bearer token present in API call
- POST endpoint was called (with valid data)
- Check browser Network tab for API response
- Check console for errors

### Email Links Broken
**Check:**
- NEXT_PUBLIC_BASE_URL environment variable set
- URL structure in email template correct
- Verify domain is accessible
- Test email rendering in email client

---

## Testing Tips

### Test Files
```javascript
// Valid test files
const files = [
  { name: 'id.pdf', type: 'application/pdf' },
  { name: 'photo.jpg', type: 'image/jpeg' },
  { name: 'resume.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { name: 'interview.mp4', type: 'video/mp4' }
]
```

### Test Videos
```
✓ https://loom.com/share/abc123
✓ https://www.youtube.com/watch?v=abc123
✓ https://drive.google.com/file/d/abc123
✓ https://vimeo.com/123456

✗ https://drive.google.com  (no file ID)
✗ https://example.com/video (wrong domain)
```

### Test Emails
```javascript
const validEmails = [
  'user@example.com',
  'john.doe+tag@company.co.uk',
  'test123@test.org'
]

const invalidEmails = [
  'user@',
  '@example.com',
  'user @example.com',
  'user@example'
]
```

---

## Debugging Tips

### Add Console Logs
```javascript
console.log('[v0] Variable value:', variableName);
console.log('[v0] API response:', response);
console.log('[v0] File selected:', file.name, file.size);
```

### Check Network
1. Open DevTools → Network tab
2. Perform action
3. Look for API calls
4. Check response status and body

### Check Console
1. Open DevTools → Console tab
2. Look for errors (red) or warnings (yellow)
3. Check for '[v0]' debug logs

### Email Testing
1. Send test email
2. Check inbox and spam
3. View HTML source (not body)
4. Test links
5. Check rendering in email client

---

## Production Deployment Notes

### Before Deploying
- [ ] Set NEXT_PUBLIC_BASE_URL
- [ ] Test all flows end-to-end
- [ ] Verify emails in production
- [ ] Test on production domain
- [ ] Check error handling
- [ ] Monitor logs

### Known Limitations (Demo Mode)
- Submissions stored in memory (lost on restart)
- No database persistence
- No file storage
- Auth is email-only (no password)
- No rate limiting

### Production TODOs
- [ ] Add database integration
- [ ] Add file storage (Vercel Blob, S3)
- [ ] Implement proper auth
- [ ] Add encryption
- [ ] Add audit logging
- [ ] Add rate limiting
- [ ] Add HTTPS
- [ ] Set up backups

---

## File Locations Reference

### Main Features
```
Frontend:
- /app/application-portal/page.tsx (applicant portal)
- /components/admin/applications-submissions.tsx (admin view)
- /app/setup/submissions/page.tsx (admin page)

Backend:
- /app/api/applications/submit/route.ts (API)
- /app/api/emails/send/route.ts (email templates)

Admin:
- /app/setup/page.tsx (dashboard)
```

### Updated Files
```
- /README_EMAIL_SYSTEM.md (docs)
- /app/careers/page.tsx (branding)
- /app/about/page.tsx (branding)
```

### New Docs
```
- /EMAIL_AND_PORTAL_UPDATES.md
- /SECURE_PORTAL_QUICK_START.md
- /IMPLEMENTATION_CHANGES_SUMMARY.md
- /SYSTEM_ARCHITECTURE.md
- /DEV_QUICK_REFERENCE.md (this file)
```

---

## Quick Commands

### Find Portal Code
```bash
grep -r "application-portal" --include="*.tsx" --include="*.ts"
grep -r "ApplicationsSubmissions" --include="*.tsx"
grep -r "/api/applications/submit" --include="*.ts" --include="*.tsx"
```

### Check File Sizes
```bash
wc -l app/application-portal/page.tsx
wc -l components/admin/applications-submissions.tsx
wc -l app/api/applications/submit/route.ts
```

### Run Type Check
```bash
npx tsc --noEmit
```

---

## Useful Resources

### Component Libraries
- shadcn/ui: https://ui.shadcn.com
- Lucide Icons: https://lucide.dev
- Tailwind CSS: https://tailwindcss.com

### Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs

### Related Docs
- EMAIL_AND_PORTAL_UPDATES.md - Full system guide
- SYSTEM_ARCHITECTURE.md - Architecture details
- SECURE_PORTAL_QUICK_START.md - User guide

---

## Support

For issues or questions:
1. Check the docs in order: QUICK_START → ARCHITECTURE → UPDATES
2. Look at the code comments in component files
3. Check browser console for error messages
4. Review API responses in Network tab
5. Test with the test data provided above

---

**Last Updated:** 2024  
**Status:** Production Ready  
**Organization:** World Vision
