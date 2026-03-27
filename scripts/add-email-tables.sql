-- Email Inbox Table
CREATE TABLE IF NOT EXISTS email_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_email VARCHAR(255) NOT NULL,
  from_name VARCHAR(255),
  subject TEXT NOT NULL,
  body TEXT,
  html_body TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE
);

-- Email Replies Table
CREATE TABLE IF NOT EXISTS email_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_id UUID NOT NULL REFERENCES email_inbox(id) ON DELETE CASCADE,
  from_email VARCHAR(255) NOT NULL,
  to_email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Email Settings Table
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  allowed_reply_tos TEXT[] DEFAULT ARRAY['unoedp.org', 'alghahim.co.ke'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_inbox_received ON email_inbox(received_at DESC);
CREATE INDEX idx_email_inbox_read ON email_inbox(read);
CREATE INDEX idx_email_inbox_archived ON email_inbox(archived);
CREATE INDEX idx_email_replies_inbox ON email_replies(inbox_id);
CREATE INDEX idx_email_replies_status ON email_replies(status);

-- RLS Policies for email_inbox
ALTER TABLE email_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read email_inbox to authenticated users"
  ON email_inbox FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Allow insert email_inbox for service role"
  ON email_inbox FOR INSERT
  WITH CHECK (TRUE);

-- RLS Policies for email_replies
ALTER TABLE email_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read email_replies to authenticated users"
  ON email_replies FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Allow insert email_replies to authenticated users"
  ON email_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow update email_replies to creator"
  ON email_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for email_settings
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read email_settings to authenticated"
  ON email_settings FOR SELECT
  TO authenticated
  USING (TRUE);

-- Insert default email settings
INSERT INTO email_settings (domain, is_active)
VALUES ('unoedp.org', TRUE)
ON CONFLICT (domain) DO NOTHING;
