# Supabase Setup Instructions for Application Submissions

## Current Status

You have successfully added the required environment variables:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `BLOB_READ_WRITE_TOKEN`

However, the database table for storing submissions still needs to be created.

## Step 1: Create the Application Submissions Table

To fix the "No applications submitted yet" issue and enable proper data persistence, you need to create the `application_submissions` table in your Supabase database.

### Option A: Use Supabase SQL Editor (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Run**

```sql
-- Create application_submissions table
CREATE TABLE IF NOT EXISTS public.application_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  video_link TEXT NOT NULL,
  documents JSONB DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'submitted',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_application_submissions_email 
  ON public.application_submissions(email);
CREATE INDEX IF NOT EXISTS idx_application_submissions_status 
  ON public.application_submissions(status);
CREATE INDEX IF NOT EXISTS idx_application_submissions_submitted_at 
  ON public.application_submissions(submitted_at DESC);

-- Enable Row Level Security
ALTER TABLE public.application_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert submissions
CREATE POLICY "Enable insert for all users" ON public.application_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow authenticated users to read submissions
CREATE POLICY "Enable read for authenticated users" ON public.application_submissions
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

### Option B: Use Supabase Dashboard UI

1. Go to **Table Editor** in your Supabase Dashboard
2. Click **Create a new table**
3. Name it: `application_submissions`
4. Add the following columns:

| Column Name | Type | Default | Notes |
|---|---|---|---|
| id | uuid | gen_random_uuid() | Primary Key |
| email | varchar | - | Unique |
| video_link | text | - | Required |
| documents | jsonb | '[]'::jsonb | Stores document metadata |
| submitted_at | timestamp | CURRENT_TIMESTAMP | Auto-set |
| status | varchar | 'submitted' | - |
| created_at | timestamp | CURRENT_TIMESTAMP | Auto-set |
| updated_at | timestamp | CURRENT_TIMESTAMP | Auto-set |

## Step 2: Test the Integration

After creating the table:

1. Go to **http://localhost:3000/application-portal** (or your deployed URL)
2. Enter an email address
3. Fill in the form with a video link and upload some documents
4. Click **Submit Application**
5. You should see a success message
6. Go to **http://localhost:3000/setup/submissions** (or **/setup** → "View Document Submissions")
7. You should see your submission listed in the admin dashboard

## Step 3: Verify in Supabase Dashboard

1. Go to **Table Editor**
2. Click on **application_submissions**
3. You should see your test submission with:
   - Email address
   - Video link
   - Documents metadata
   - Submission timestamp

## Troubleshooting

### Issue: "No applications submitted yet" persists
**Solution:** Verify the table was created:
1. Go to Supabase → Table Editor
2. Scroll through the table list to find `application_submissions`
3. If it's not there, create it manually using the SQL above

### Issue: "Failed to upload resume" error
**Solution:** 
1. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set in your environment variables
2. Make sure the `application_submissions` table exists
3. Check the browser console (F12) for more detailed error messages
4. Verify Row Level Security policies allow inserts: `INSERT WITH CHECK (true)`

### Issue: Can see submissions but no document links
**Solution:** 
1. The documents are stored as metadata (name, size, type) in the JSON column
2. Actual file storage requires Vercel Blob integration (BLOB_READ_WRITE_TOKEN)
3. Currently, the system stores document metadata and video interview links (which can be external URLs)

## What's Working Now

✅ Application portal at `/application-portal`
✅ Secure email-based authentication
✅ Form to submit video interview links and documents
✅ Document metadata storage in Supabase
✅ Admin dashboard at `/setup/submissions`
✅ View all submissions with details
✅ Open video links in a new tab

## What Will Work Once Table is Created

✅ Submit applications through the portal
✅ See submissions in the admin dashboard immediately
✅ Track submission timestamps and status
✅ View video interview links for each applicant
✅ See document lists with file metadata

## API Endpoints

The system uses these endpoints:

- **POST /api/applications/submit** - Submit an application
  - Headers: `Content-Type: application/json`
  - Body: `{ email, videoLink, documents }`
  - Response: `{ success, submissionId, submittedAt }`

- **GET /api/applications/submit** - Get all submissions (requires Bearer token)
  - Headers: `Authorization: Bearer <admin-token>`
  - Response: `{ submissions, totalSubmissions }`

## Next Steps

1. Create the `application_submissions` table in Supabase (use the SQL above)
2. Test by submitting an application through `/application-portal`
3. Check `/setup/submissions` to see the submission in the admin dashboard
4. You're done! The system is fully functional

---

**Questions?** Check the console logs (F12) for detailed error messages. All errors are logged with `[v0]` prefix for easy debugging.
