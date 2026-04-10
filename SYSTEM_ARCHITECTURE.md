# Secure Document Portal - System Architecture

## User Flows

### Applicant Submission Flow

```
Applicant receives email
         ↓
   [Email from World Vision]
   - Application confirmation
   - Job title details
   - 5 interview questions
   - Button: "Access Secure Upload Portal"
         ↓
   Click portal link
         ↓
   [Application Portal Page]
   GET /application-portal
         ↓
   Enter email address
         ↓
   Access authenticated portal
         ↓
   [Upload Portal Interface]
   - Add video interview link
     (Loom/YouTube/Google Drive/Vimeo)
   - Upload documents via drag-drop
     (ID, certificates, credentials)
   - Validate files
     (type: pdf/jpg/doc/mp4, size: <50MB)
         ↓
   [Review Submission]
   - Confirm video link added
   - Confirm required documents ready
         ↓
   Submit Application
   POST /api/applications/submit
         ↓
   [Success Confirmation]
   - Confirmation message displayed
   - Session cleared after 2 seconds
```

### Admin Review Flow

```
Admin at Dashboard
         ↓
   /setup (Admin Dashboard)
         ↓
   Click "View Document Submissions"
         ↓
   GET /setup/submissions
         ↓
   [Submissions Page]
   - List all applicant submissions
   - Email, date, document count
   - Quick actions available
         ↓
   Click "View" on submission
         ↓
   [Submission Details Modal]
   - Applicant email (copy button)
   - Video link (external link button)
   - All documents listed
   - File metadata (name, size)
   - Submission timestamp
         ↓
   Review materials
         ↓
   Contact applicant
   (copy email, send message)
         ↓
   Update in tracking system
```

---

## System Architecture

### Layer 1: API Layer

```
┌─────────────────────────────────────────────────────────┐
│              Next.js API Routes (Server)                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  POST /api/applications/submit                           │
│  ├─ Validate email format                                │
│  ├─ Check for duplicates                                │
│  ├─ Validate documents array                            │
│  ├─ Store submission (in-memory demo)                   │
│  └─ Return success/error response                       │
│                                                           │
│  GET /api/applications/submit                            │
│  ├─ Verify Bearer token                                 │
│  ├─ Fetch all submissions                               │
│  └─ Return submissions + count                          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Layer 2: Frontend Pages & Components

```
┌────────────────────────────────────────────────────────────┐
│          React Client Components (Browser)                 │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  [Applicant Side]                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /application-portal                                   │  │
│  │ ├─ Email authentication form                         │  │
│  │ ├─ Portal interface                                  │  │
│  │ │  ├─ Video link input + validation                 │  │
│  │ │  ├─ File upload area (drag-drop)                  │  │
│  │ │  ├─ File list with remove buttons                 │  │
│  │ │  ├─ Requirements checklist                        │  │
│  │ │  └─ Submit button                                 │  │
│  │ └─ Success confirmation                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Admin Side]                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /setup/submissions (Page)                            │  │
│  │ └─ ApplicationsSubmissions (Component)                │  │
│  │    ├─ Submissions table                              │  │
│  │    │  ├─ Email column (copy button)                 │  │
│  │    │  ├─ Submitted date column                      │  │
│  │    │  ├─ Document count badge                       │  │
│  │    │  ├─ Video link button                          │  │
│  │    │  └─ View button (modal trigger)                │  │
│  │    └─ Details modal                                  │  │
│  │       ├─ Video section                               │  │
│  │       ├─ Documents section                           │  │
│  │       └─ Submission info                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

### Layer 3: Email System

```
┌────────────────────────────────────────────────────────────┐
│           Email Templates (Resend Integration)              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/emails/send                                     │
│  ├─ type: 'application_confirmation'                       │
│  │  └─ Template: Welcome + 5 questions + Portal link      │
│  │                                                          │
│  ├─ type: 'offer_letter'                                  │
│  │  └─ Template: Offer + Sign link (unchanged)            │
│  │                                                          │
│  ├─ type: 'offer_letter_signed'                           │
│  │  └─ Template: Welcome to team                          │
│  │                                                          │
│  └─ type: 'reminder'                                      │
│     └─ Template: Deadline reminder + Portal link          │
│                                                              │
│  Email Features:                                            │
│  ├─ HTML + Text versions                                  │
│  ├─ Responsive design                                     │
│  ├─ Portal button/link                                    │
│  ├─ Professional branding                                 │
│  └─ Security warnings (no email docs)                    │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## Data Models

### ApplicationSubmission Interface

```typescript
interface ApplicationSubmission {
  email: string;              // Applicant email
  videoLink: string;          // Link to Loom/YouTube/GDrive/Vimeo
  documents: Array<{          // Uploaded files
    name: string;             // File name
    size: number;             // File size in bytes
    type: string;             // MIME type
  }>;
  submittedAt: string;        // ISO timestamp
}
```

### API Request (POST)

```json
{
  "email": "john.doe@example.com",
  "videoLink": "https://loom.com/share/abc123...",
  "documents": [
    {
      "name": "passport.pdf",
      "size": 1024000,
      "type": "application/pdf"
    },
    {
      "name": "degree.pdf",
      "size": 2048000,
      "type": "application/pdf"
    }
  ]
}
```

### API Response (Success)

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "submissionId": "APP-1234567890",
  "submittedAt": "2024-01-15T10:30:00.000Z"
}
```

### API Response (Error)

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Component Hierarchy

```
app/
├── application-portal/
│   └── page.tsx [Client Component]
│       ├── AuthForm (email input)
│       ├── PortalInterface (conditional)
│       │   ├── VideoSection
│       │   │   ├── VideoLinkInput
│       │   │   └─ VideoLinkButton
│       │   ├── DocumentsSection
│       │   │   ├── DragDropArea
│       │   │   ├── FileInput
│       │   │   └─ DocumentsList
│       │   ├── ChecklistCard
│       │   ├── SubmitButton
│       │   └─ Message (Alert)
│       └── Messages (Alert)
│
├── setup/
│   ├── submissions/
│   │   └── page.tsx [Server Component]
│   │       └── ApplicationsSubmissions [Client Component]
│   │           ├── SubmissionTable
│   │           ├── SubmissionRow
│   │           └─ SubmissionModal
│   │
│   └── page.tsx [Server Component]
│       └── Quick Actions Link (to submissions)
│
└── api/
    └── applications/
        └── submit/
            └── route.ts [API Route]
```

---

## Email Template Structure

### All Templates Include

```
┌─────────────────────────────────┐
│         Email Header            │
│    [World Vision Logo/Name]     │
│  [Recruitment & Talent Dev]     │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│      Email Content Section      │
│  (Template-specific content)    │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│         CTA Button/Link         │
│  [Secure Portal/Sign Offer]     │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│        Email Footer             │
│  [World Vision | Careers]       │
│  [Copyright 2024]               │
│  [Security Note]                │
└─────────────────────────────────┘
```

---

## Security Boundaries

```
┌─────────────────────────────────────────────────┐
│          Public Access                          │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✓ GET /application-portal (anyone can access) │
│  ✓ Email templates (anyone can receive)        │
│  ✓ POST /api/applications/submit (anyone)      │
│    └─ Validation + duplicate check              │
│                                                  │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│          Admin Access (Protected)                │
├─────────────────────────────────────────────────┤
│                                                  │
│  ⚠ GET /setup/submissions (login required)     │
│  ⚠ GET /api/applications/submit (Bearer token) │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## File Upload Flow

```
User selects file(s)
        ↓
Browser FileList object
        ↓
Validation checks:
├─ File type allowed?
│  (pdf, jpg, png, doc, docx, mp4, mov)
└─ File size < 50MB?
        ↓
If valid: Add to state
If invalid: Show error message
        ↓
Display in list:
├─ File icon
├─ File name
├─ File size (formatted)
└─ Remove button
        ↓
User can add more or submit
```

---

## Responsive Design Breakpoints

```
Mobile (< 768px)
├─ Single column layout
├─ Full-width inputs
├─ Stacked buttons
└─ Modal covers full screen

Tablet (768px - 1024px)
├─ 2-column where applicable
├─ Wider card max-width
└─ Better spacing

Desktop (> 1024px)
├─ Optimal content width
├─ Side-by-side layouts
└─ Full component showcase
```

---

## Error Handling Strategy

```
Client Errors (400s)
├─ Missing required fields
├─ Invalid email format
├─ Duplicate submission
└─ File validation failed

Server Errors (500s)
├─ API processing error
├─ Database error
└─ Unknown error

User Feedback
├─ Error Alert with icon
├─ Descriptive message
├─ Suggested action
└─ Contact email provided
```

---

## Performance Considerations

### Portal Page
- Client-side rendering (fast interactive experience)
- No database calls (demo mode)
- Images optimized
- CSS-in-JS minimal
- ~250KB page size estimate

### Admin Page
- Server-side initial render (SEO, security)
- Client-side component for interactivity
- Single API call on mount
- Modal lazy loads on click
- ~150KB page size estimate

### Emails
- Inline CSS (no external dependencies)
- Plain text version included
- Mobile-responsive
- Fast delivery (Resend)

---

## State Management

### Portal Page

```typescript
// Authentication
const [email, setEmail] = useState('');
const [authenticated, setAuthenticated] = useState(false);

// Video
const [videoLink, setVideoLink] = useState('');
const [uploadedVideo, setUploadedVideo] = useState<UploadedFile | null>(null);

// Documents
const [documents, setDocuments] = useState<UploadedFile[]>([]);

// UI State
const [loading, setLoading] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [message, setMessage] = useState<Message | null>(null);
const [dragActive, setDragActive] = useState(false);
```

### Admin Component

```typescript
// Data
const [submissions, setSubmissions] = useState<ApplicationSubmission[]>([]);

// UI State
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [showDialog, setShowDialog] = useState(false);
const [copied, setCopied] = useState<string | null>(null);

// Selection
const [selectedSubmission, setSelectedSubmission] = useState<ApplicationSubmission | null>(null);
```

---

## Configuration & Constants

### Validation Rules

```javascript
MAX_FILE_SIZE = 50 * 1024 * 1024  // 50MB

ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'video/quicktime'
]

VIDEO_PLATFORMS = [
  'loom.com',
  'youtube.com',
  'youtu.be',
  'drive.google.com',
  'vimeo.com'
]

DEADLINE_DAYS = 3  // From application
```

---

## Integration Points

### Existing Systems (No Changes)
- Supabase (server-side only for other features)
- Resend emails (uses existing send endpoint)
- Authentication (setup/login unchanged)

### New Integrations
- None required for demo mode
- Would need: Database, File storage, Enhanced auth (for production)

---

## Deployment Checklist

```
Pre-deployment
☐ Test all email templates in email clients
☐ Test portal on mobile/tablet/desktop
☐ Test file upload (various file types)
☐ Test admin dashboard
☐ Test API endpoints
☐ Test error scenarios
☐ Test duplicate prevention
☐ Verify NEXT_PUBLIC_BASE_URL set

Deployment
☐ Set environment variables
☐ Deploy to staging
☐ Smoke test all features
☐ Deploy to production
☐ Monitor for errors
☐ Test end-to-end workflow

Post-deployment
☐ Verify emails sending correctly
☐ Check admin can see submissions
☐ Monitor error logs
☐ Test backup/recovery
☐ Brief HR team on new system
☐ Update documentation
```

---

## Summary

The system provides a complete, modern solution for applicant document collection with:
- Professional, secure portal experience
- Email-guided workflow
- Admin review dashboard
- Validation at all layers
- Mobile-responsive design
- Clear error handling
- World Vision branding throughout
