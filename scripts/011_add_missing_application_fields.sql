-- Migration: Fix job_applications table for external applicant submissions
-- Purpose: Ensure proper schema and prevent foreign key constraint violations

-- IMPORTANT: job_applications uses 'application_status' NOT 'status'
-- The table already has all required columns from the schema definition

-- Add index for faster lookups by job_id and application_status if not exists
CREATE INDEX IF NOT EXISTS idx_applications_job_status 
ON job_applications(job_id, application_status);

-- Add index for applicant_id lookups if not exists
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id 
ON job_applications(applicant_id);

-- Create unique constraint to prevent duplicate applications 
-- (applicant can only apply for same job once)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_applicant_job_application' 
    AND conrelid = 'job_applications'::regclass
  ) THEN
    ALTER TABLE job_applications
    ADD CONSTRAINT unique_applicant_job_application 
    UNIQUE (applicant_id, job_id);
  END IF;
END $$;

-- Create a diagnostic view to check for orphaned applications
-- (applications with applicant_id that don't exist in applicants table)
CREATE OR REPLACE VIEW orphaned_applications AS
SELECT 
  ja.id as application_id,
  ja.applicant_id,
  ja.job_id,
  ja.application_status,
  ja.submission_date
FROM job_applications ja
LEFT JOIN applicants a ON ja.applicant_id = a.id
WHERE a.id IS NULL;

-- If there are orphaned applications, they need to be deleted or fixed
-- Run this to see them: SELECT * FROM orphaned_applications;

-- Grant permissions for views
GRANT SELECT ON orphaned_applications TO anon, authenticated;
