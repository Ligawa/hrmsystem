-- Create Document Management Table
CREATE TABLE application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- resume, cover_letter, certificates, portfolio, etc.
  document_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT,
  upload_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT document_type_valid CHECK (document_type IN ('resume', 'cover_letter', 'certificates', 'portfolio', 'academic', 'work_experience', 'other'))
);

-- Create Video Interview Table
CREATE TABLE video_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES job_applications(id) ON DELETE CASCADE,
  video_url VARCHAR(500),
  duration_seconds INT,
  file_size INT,
  upload_status VARCHAR(20) DEFAULT 'pending', -- pending, submitted, under_review, approved, rejected
  question_set_id UUID,
  submission_deadline TIMESTAMP,
  submitted_at TIMESTAMP,
  
  -- Review fields
  reviewed_by UUID REFERENCES auth.users(id),
  overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_score INT CHECK (communication_score >= 1 AND communication_score <= 5),
  technical_score INT CHECK (technical_score >= 1 AND technical_score <= 5),
  presentation_score INT CHECK (presentation_score >= 1 AND presentation_score <= 5),
  confidence_score INT CHECK (confidence_score >= 1 AND confidence_score <= 5),
  reviewer_feedback TEXT,
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Assessment Table
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  assessment_type VARCHAR(30) NOT NULL, -- mcq, written, situational, technical
  assessment_title VARCHAR(255) NOT NULL,
  description TEXT,
  total_questions INT,
  total_marks INT,
  duration_minutes INT,
  
  submission_deadline TIMESTAMP,
  submitted_at TIMESTAMP,
  submission_status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, submitted, graded
  
  -- Auto-scoring fields
  score INT,
  percentage DECIMAL(5,2),
  passed BOOLEAN,
  passing_score INT,
  
  -- Manual review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewer_comments TEXT,
  reviewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Assessment Questions Table
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL, -- mcq, short_answer, essay, code
  marks INT DEFAULT 1,
  
  -- MCQ specific
  options JSONB, -- array of {text, is_correct} objects
  correct_answer TEXT,
  
  -- Instructions/guidance
  guidance TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(assessment_id, question_number)
);

-- Create Assessment Responses Table
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  applicant_response TEXT,
  marks_obtained INT,
  is_correct BOOLEAN,
  feedback TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Assessment Question Set Template
CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  assessment_type VARCHAR(30) NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  description TEXT,
  total_marks INT,
  duration_minutes INT,
  passing_score INT,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all evaluation tables
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_documents
CREATE POLICY "Applicants can view own documents" ON application_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = application_documents.application_id
      AND job_applications.applicant_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can view all documents" ON application_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'recruiter')
    )
  );

-- RLS Policies for video_interviews
CREATE POLICY "Applicants can view own interviews" ON video_interviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = video_interviews.application_id
      AND job_applications.applicant_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can view all interviews" ON video_interviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'recruiter')
    )
  );

-- RLS Policies for assessments
CREATE POLICY "Applicants can view own assessments" ON assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_applications
      WHERE job_applications.id = assessments.application_id
      AND job_applications.applicant_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can view all assessments" ON assessments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'recruiter')
    )
  );

-- Indexes for performance
CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX idx_application_documents_status ON application_documents(upload_status);
CREATE INDEX idx_video_interviews_application_id ON video_interviews(application_id);
CREATE INDEX idx_video_interviews_rating ON video_interviews(overall_rating);
CREATE INDEX idx_assessments_application_id ON assessments(application_id);
CREATE INDEX idx_assessments_type ON assessments(assessment_type);
CREATE INDEX idx_assessments_status ON assessments(submission_status);
CREATE INDEX idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
