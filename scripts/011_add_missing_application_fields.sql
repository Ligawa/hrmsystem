-- Migration: Add missing fields to job_applications table
-- Purpose: Support external applicant submissions with contact info and resume URL

-- Add missing columns to job_applications table
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add unique constraint to prevent duplicate applications per email+job combination
-- Using DO block because PostgreSQL doesn't support IF NOT EXISTS for constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_email_job_application' 
    AND conrelid = 'job_applications'::regclass
  ) THEN
    ALTER TABLE job_applications
    ADD CONSTRAINT unique_email_job_application 
    UNIQUE (job_id, email) 
    WHERE email IS NOT NULL;
  END IF;
END $$;

-- Add index for faster lookups by job_id
CREATE INDEX IF NOT EXISTS idx_applications_job_status 
ON job_applications(job_id, application_status);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_applications_email 
ON job_applications(email);

-- Verify the schema is correct
-- The job_applications table should now have these columns:
-- - id (UUID, primary key)
-- - applicant_id (UUID, foreign key to applicants.id)
-- - job_id (UUID)
-- - application_status (TEXT)
-- - cover_letter (TEXT)
-- - resume_url (TEXT) -- newly added
-- - phone (TEXT) -- newly added
-- - initial_screening_date (TIMESTAMP)
-- - initial_screening_result (TEXT)
-- - initial_screener_id (UUID)
-- - submission_date (TIMESTAMP)
-- - updated_at (TIMESTAMP)
-- - application_token (TEXT, unique)
