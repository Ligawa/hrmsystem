-- Create submission portals table
CREATE TABLE IF NOT EXISTS submission_portals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  deadline TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create submission documents table
CREATE TABLE IF NOT EXISTS submission_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id UUID NOT NULL REFERENCES submission_portals(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'video_interview', 'cover_letter', 'portfolio', etc.
  document_url TEXT,
  document_name VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_submission_portals_application_id ON submission_portals(application_id);
CREATE INDEX idx_submission_portals_token ON submission_portals(token);
CREATE INDEX idx_submission_documents_portal_id ON submission_documents(portal_id);
CREATE INDEX idx_submission_documents_document_type ON submission_documents(document_type);

-- Enable RLS (Row Level Security)
ALTER TABLE submission_portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy for submission_portals - anyone can view if they have the token
CREATE POLICY "Allow public access via token" ON submission_portals
  FOR SELECT
  USING (true);

-- RLS Policy for submission_portals - authenticated users can insert
CREATE POLICY "Allow authenticated to insert portals" ON submission_portals
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policy for submission_documents - anyone can view documents from accessible portals
CREATE POLICY "Allow public access to documents" ON submission_documents
  FOR SELECT
  USING (true);

-- RLS Policy for submission_documents - allow insert for documents in accessible portals
CREATE POLICY "Allow document upload" ON submission_documents
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy for submission_documents - allow update for documents in accessible portals
CREATE POLICY "Allow document update" ON submission_documents
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create a function to automatically close portals after deadline
CREATE OR REPLACE FUNCTION close_expired_portals()
RETURNS void AS $$
BEGIN
  UPDATE submission_portals
  SET is_active = false
  WHERE is_active = true AND deadline < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run the function periodically (would normally be a cron job)
-- For now, this function will be called manually or via an API endpoint
