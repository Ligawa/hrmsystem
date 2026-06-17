-- WHO Job Board and Application Tracking System Enhancement
-- Adds job reference number system and enhanced application tracking

-- Add missing columns to jobs table if they don't exist
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS job_reference_number TEXT UNIQUE;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS closing_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS duty_station TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS contract_type TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS contract_duration TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS salary_min DECIMAL;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS salary_max DECIMAL;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS salary_currency TEXT DEFAULT 'USD';
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS job_description TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS requirements JSONB;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS responsibilities JSONB;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS benefits JSONB;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS level TEXT;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS type TEXT;

-- Enhance job_applications table
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS applicant_id UUID REFERENCES applicants(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS job_reference_number TEXT;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS application_status TEXT CHECK (application_status IN (
  'Submitted',
  'Under Review',
  'Assessment Pending',
  'Interview Pending',
  'Shortlisted',
  'Reference Check',
  'Selected',
  'Deployment Preparation',
  'Closed'
)) DEFAULT 'Submitted';
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS shortlist_reason TEXT;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS assessment_score DECIMAL;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS interview_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS interview_notes TEXT;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS offer_extended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE IF EXISTS job_applications ADD COLUMN IF NOT EXISTS offer_accepted_at TIMESTAMP WITH TIME ZONE;

-- Create index for job_reference_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_jobs_reference_number ON jobs(job_reference_number);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_ref ON job_applications(job_reference_number);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(application_status);

-- Row Level Security for jobs (public read, admin write)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Public jobs are viewable by all" ON jobs;
DROP POLICY IF EXISTS "Only admins can create jobs" ON jobs;
DROP POLICY IF EXISTS "Only admins can update jobs" ON jobs;
DROP POLICY IF EXISTS "Only admins can delete jobs" ON jobs;

-- Create RLS policies for jobs
CREATE POLICY "Public jobs are viewable by all"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Only admins can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Only admins can update jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Only admins can delete jobs"
  ON jobs FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Row Level Security for job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Applicants can view own applications" ON job_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON job_applications;
DROP POLICY IF EXISTS "Applicants can create applications" ON job_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON job_applications;

-- Create RLS policies for job_applications
CREATE POLICY "Applicants can view own applications"
  ON job_applications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM applicants WHERE id = job_applications.applicant_id
    ) OR
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

CREATE POLICY "Admins can view all applications"
  ON job_applications FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Applicants can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT auth_user_id FROM applicants WHERE id = applicant_id
    )
  );

CREATE POLICY "Admins can update applications"
  ON job_applications FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
