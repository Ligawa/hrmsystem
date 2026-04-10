# File Upload System Guide

## Overview

This document explains how the fixed file upload system works and why it avoids CORS errors.

## The Problem (Before)

The original implementation was trying to upload files directly from the browser to Vercel Blob using `@vercel/blob/client`:

```javascript
// ❌ This causes CORS errors
const blob = await upload(resumeFile.name, resumeFile, {
  access: "public",
  handleUploadUrl: "/api/upload", // This generates a token, doesn't upload the file
});
```

**Why it failed:**
- Browser makes direct request to Vercel Blob API from `https://www.wvio.org`
- Vercel Blob API doesn't have CORS headers allowing `wvio.org` origin
- Request blocked with: "No 'Access-Control-Allow-Origin' header"

## The Solution (After)

### Architecture

```
Browser (www.wvio.org)
         ↓
   POST /api/upload (same origin, no CORS issue)
         ↓
   Next.js Backend (Server-side)
         ↓
   Vercel Blob API (internal, secure)
         ↓
   Return URL to frontend
         ↓
   Save URL to Supabase database
```

### How It Works

#### 1. Backend Upload Route (`/app/api/upload/route.ts`)

```typescript
// Uses @vercel/blob server-side (not client-side)
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  // 1. Accept FormData from client
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // 2. Validate file
  if (!ALLOWED_TYPES.includes(file.type)) {
    return error "Only PDF files allowed";
  }
  if (file.size > MAX_FILE_SIZE) {
    return error "File too large";
  }

  // 3. Upload server-to-server (no CORS issues)
  const blob = await put(filename, file, {
    access: "public",
    contentType: "application/pdf",
  });

  // 4. Return URL to client
  return NextResponse.json({ url: blob.url });
}
```

**Key Points:**
- Server uses `put()` from `@vercel/blob` (server-side function)
- No token generation - direct server-to-server communication
- File validation happens on secure backend
- Client never touches Vercel Blob API directly

#### 2. Frontend Upload Function (`components/careers/application-form.tsx`)

```typescript
// Only 3 steps
const formData = new FormData();
formData.append("file", resumeFile);

const uploadResponse = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const uploadData = await uploadResponse.json();
const resumeUrl = uploadData.url; // Use this URL
```

**Key Points:**
- Sends to own backend (same origin, no CORS issue)
- No direct contact with Vercel Blob
- Receives URL back from backend
- URL saved directly to Supabase

#### 3. Database Integration

```typescript
const { data } = await supabase
  .from("job_applications")
  .insert({
    // ... other fields
    resume_url: uploadData.url, // Direct URL to file
  });
```

## Validation & Security

### File Validation (Backend)

```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf"];

// Server validates before upload
if (!ALLOWED_TYPES.includes(file.type)) {
  throw error; // Only PDFs allowed
}
if (file.size > MAX_FILE_SIZE) {
  throw error; // Max 5MB
}
```

### Client-side UX Validation

```typescript
onChange={(e) => {
  const file = e.target.files?.[0];
  if (file.type !== "application/pdf") {
    setError("Only PDF files are allowed"); // Immediate feedback
  }
  if (file.size > 5 * 1024 * 1024) {
    setError("File size must be less than 5MB");
  }
}}
```

## Why This Works

| Issue | Solution |
|-------|----------|
| **CORS Errors** | Backend handles upload (same server, no cross-origin) |
| **400 Bad Request** | Server validates file type/size before uploading |
| **Infinite Retries** | No retry logic - single fetch call |
| **Security** | Validation on backend (can't be bypassed) |
| **File Types** | Only PDFs accepted |
| **File Size** | Max 5MB enforced on backend |
| **Database** | URL returned by backend and saved directly |

## Error Handling

### Backend Errors

```typescript
// File validation errors (400)
if (!file) return 400: "No file provided"
if (!isValidType) return 400: "Only PDF files allowed"
if (tooLarge) return 400: "File size must be less than 5MB"

// Upload errors (500)
try {
  await put(filename, file);
} catch (error) {
  return 500: "Failed to upload file"
}
```

### Frontend Errors

```typescript
if (!uploadResponse.ok) {
  const errorData = await uploadResponse.json();
  setError(errorData.error); // Display backend error message
  throw new Error(errorData.error);
}
```

## Database Schema

```typescript
// Supabase table: job_applications
{
  id: string
  resume_url: string // e.g., "https://blob.vercelusercontent.com/..."
  full_name: string
  email: string
  job_id: string
  // ... other fields
}
```

## Usage Example

```typescript
// 1. User selects file in browser
<input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files?.[0])} />

// 2. User submits form
// Frontend sends to backend:
fetch("/api/upload", { 
  method: "POST",
  body: formData // Contains file
})

// 3. Backend uploads to Vercel Blob
// Returns URL: "https://blob.vercelusercontent.com/resume-123456.pdf"

// 4. Frontend saves URL to database
supabase.from("job_applications").insert({
  resume_url: "https://blob.vercelusercontent.com/resume-123456.pdf"
})
```

## Environment Variables

No additional environment variables needed! The `@vercel/blob` package automatically uses your Vercel environment.

## Production Checklist

- ✅ File type validation (PDF only)
- ✅ File size limit (5MB)
- ✅ Backend validation (can't bypass from frontend)
- ✅ Unique filenames (timestamp + random string)
- ✅ Error handling (clear error messages)
- ✅ Database integration (URL saved to Supabase)
- ✅ No CORS issues (all server-side)
- ✅ No infinite retries (single fetch call)

## Troubleshooting

**"Failed to upload file" error?**
- Check file is actually a PDF
- Check file is under 5MB
- Check `/api/upload` endpoint is responding

**File not appearing in database?**
- Check Supabase connection in application form
- Check `resume_url` field exists in `job_applications` table
- Check upload response returns valid URL

**Files not accessible after upload?**
- URLs are public (`access: "public"`)
- Check Vercel Blob is properly configured
- Check file exists in Vercel dashboard
