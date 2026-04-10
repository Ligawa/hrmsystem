-- Create application_submissions table for storing applicant document submissions
CREATE TABLE IF NOT EXISTS public.application_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  video_link TEXT NOT NULL,
  documents JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'submitted',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_application_submissions_email ON public.application_submissions(email);

-- Create index on submitted_at for sorting
CREATE INDEX IF NOT EXISTS idx_application_submissions_submitted_at ON public.application_submissions(submitted_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_application_submissions_status ON public.application_submissions(status);

-- Add comment to table
COMMENT ON TABLE public.application_submissions IS 'Stores applicant submissions including video links and documents';
COMMENT ON COLUMN public.application_submissions.documents IS 'Array of document objects with name, size, type, and uploadedAt';
COMMENT ON COLUMN public.application_submissions.status IS 'Status of the submission: submitted, reviewed, contacted, etc.';
