-- WHO Recruitment System - Database Schema
-- Phase 1: Applicant Management Tables

-- 1. Applicants table (core applicant info)
CREATE TABLE IF NOT EXISTS applicants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id TEXT UNIQUE NOT NULL, -- Format: APP-2026-XXXXXX
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  nationality TEXT,
  profile_photo_url TEXT,
  summary TEXT,
  
  -- Account status
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auth reference
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 2. Applicant Personal Details
CREATE TABLE IF NOT EXISTS applicant_personal_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  
  -- Personal info
  marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Divorced', 'Widowed', 'Prefer not to say')),
  children_count INTEGER,
  languages TEXT[], -- Array of languages spoken
  
  -- Addresses
  current_address TEXT,
  current_city TEXT,
  current_country TEXT,
  permanent_address TEXT,
  permanent_city TEXT,
  permanent_country TEXT,
  
  -- Emergency contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Applicant Professional Details
CREATE TABLE IF NOT EXISTS applicant_professional_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  
  -- Current employment
  current_job_title TEXT,
  current_organization TEXT,
  current_employment_type TEXT CHECK (current_employment_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance', 'Self-employed', 'Unemployed')),
  years_of_experience INTEGER,
  
  -- Skills
  core_skills TEXT[], -- Array of skills
  certifications TEXT,
  
  -- Specializations
  specializations TEXT[], -- Array of specialization areas
  sectors_experience TEXT[], -- Array of sectors worked in
  
  -- Availability
  notice_period INTEGER, -- Days required for notice
  availability_date DATE,
  willing_to_relocate BOOLEAN DEFAULT FALSE,
  
  -- Salary expectations
  expected_salary_min DECIMAL,
  expected_salary_max DECIMAL,
  salary_currency TEXT DEFAULT 'USD',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Applicant Travel Details
CREATE TABLE IF NOT EXISTS applicant_travel_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  
  -- Visa information
  passport_number TEXT,
  passport_expiry_date DATE,
  
  -- Work visa eligibility
  can_work_usa BOOLEAN,
  can_work_eu BOOLEAN,
  can_work_un_countries BOOLEAN,
  
  -- Travel restrictions
  travel_restrictions TEXT,
  languages_fluent TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Applicant Education
CREATE TABLE IF NOT EXISTS applicant_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  
  degree_level TEXT NOT NULL, -- Bachelor's, Master's, PhD, etc.
  field_of_study TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  institution_country TEXT,
  graduation_year INTEGER,
  cgpa DECIMAL(3,2),
  description TEXT,
  
  -- Document
  certificate_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Applicant Work Experience
CREATE TABLE IF NOT EXISTS applicant_work_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  
  job_title TEXT NOT NULL,
  organization TEXT NOT NULL,
  employment_type TEXT CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Freelance')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  responsibilities TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Applicant Documents
CREATE TABLE IF NOT EXISTS applicant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL CHECK (document_type IN ('Resume', 'Cover Letter', 'Passport', 'Degree Certificate', 'Work License', 'Other')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL, -- Vercel Blob URL
  file_size INTEGER, -- in bytes
  file_type TEXT, -- MIME type
  
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  job_id UUID NOT NULL, -- References jobs table
  
  application_status TEXT CHECK (application_status IN ('submitted', 'under_review', 'shortlisted', 'rejected', 'interview', 'offered', 'accepted', 'withdrawn')) DEFAULT 'submitted',
  cover_letter TEXT,
  
  -- Application tracking
  initial_screening_date TIMESTAMP WITH TIME ZONE,
  initial_screening_result TEXT,
  initial_screener_id UUID REFERENCES auth.users(id),
  
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Token for applicant tracking portal
  application_token TEXT UNIQUE
);

-- 9. Interview Schedule
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  
  interview_type TEXT CHECK (interview_type IN ('Phone Screen', 'Technical', 'HR', 'Panel', 'Final', 'Other')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  scheduled_by UUID REFERENCES auth.users(id),
  
  interview_status TEXT CHECK (interview_status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  interviewer_id UUID REFERENCES auth.users(id),
  interview_notes TEXT,
  interview_rating INTEGER CHECK (interview_rating >= 1 AND interview_rating <= 5),
  
  zoom_link TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Assessment Records
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  
  assessment_type TEXT NOT NULL, -- Technical, Behavioral, Language, etc.
  assessment_name TEXT,
  assessment_platform TEXT, -- Internal, External (Codility, etc.)
  
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_date TIMESTAMP WITH TIME ZONE,
  
  -- Results
  score INTEGER,
  max_score INTEGER,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  feedback TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_professional_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_travel_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Applicants can view their own profile
CREATE POLICY "applicants_view_own" ON applicants 
  FOR SELECT USING (auth.uid() = auth_user_id OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin'));

CREATE POLICY "applicants_update_own" ON applicants 
  FOR UPDATE USING (auth.uid() = auth_user_id);

-- RLS Policies - Personal details (applicants can view/edit their own)
CREATE POLICY "personal_details_view_own" ON applicant_personal_details 
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_user_id = auth.uid()
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

CREATE POLICY "personal_details_update_own" ON applicant_personal_details 
  FOR UPDATE USING (
    applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
  );

-- RLS Policies - Professional details
CREATE POLICY "professional_details_view_own" ON applicant_professional_details 
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_user_id = auth.uid()
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

CREATE POLICY "professional_details_update_own" ON applicant_professional_details 
  FOR UPDATE USING (
    applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
  );

-- RLS Policies - Travel details
CREATE POLICY "travel_details_view_own" ON applicant_travel_details 
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_user_id = auth.uid()
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

CREATE POLICY "travel_details_update_own" ON applicant_travel_details 
  FOR UPDATE USING (
    applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
  );

-- RLS Policies - Education
CREATE POLICY "education_view_own" ON applicant_education 
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_user_id = auth.uid()
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

CREATE POLICY "education_insert_own" ON applicant_education 
  FOR INSERT WITH CHECK (
    applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "education_update_own" ON applicant_education 
  FOR UPDATE USING (
    applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
  );

-- RLS Policies - Work experience
CREATE POLICY "work_exp_view_own" ON applicant_work_experience 
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_user_id = auth.uid()
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

CREATE POLICY "work_exp_insert_own" ON applicant_work_experience 
  FOR INSERT WITH CHECK (
    applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "work_exp_update_own" ON applicant_work_experience 
  FOR UPDATE USING (
    applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
  );

-- RLS Policies - Documents
CREATE POLICY "documents_view_own" ON applicant_documents 
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_user_id = auth.uid()
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

CREATE POLICY "documents_insert_own" ON applicant_documents 
  FOR INSERT WITH CHECK (
    applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
  );

-- RLS Policies - Job applications (view own applications and admin can view all)
CREATE POLICY "applications_view_own" ON job_applications 
  FOR SELECT USING (
    applicant_id IN (
      SELECT id FROM applicants WHERE auth_user_id = auth.uid()
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

-- RLS Policies - Interviews
CREATE POLICY "interviews_view_own" ON interviews 
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM job_applications 
      WHERE applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

-- RLS Policies - Assessments
CREATE POLICY "assessments_view_own" ON assessments 
  FOR SELECT USING (
    application_id IN (
      SELECT id FROM job_applications 
      WHERE applicant_id IN (SELECT id FROM applicants WHERE auth_user_id = auth.uid())
    ) OR auth.uid() IN (SELECT user_id FROM users WHERE role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX idx_applicants_applicant_id ON applicants(applicant_id);
CREATE INDEX idx_applicants_email ON applicants(email);
CREATE INDEX idx_applicants_auth_user_id ON applicants(auth_user_id);
CREATE INDEX idx_applications_applicant_id ON job_applications(applicant_id);
CREATE INDEX idx_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_applications_token ON job_applications(application_token);
CREATE INDEX idx_documents_applicant_id ON applicant_documents(applicant_id);
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_assessments_application_id ON assessments(application_id);
