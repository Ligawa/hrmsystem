-- Create offer_letters table
CREATE TABLE IF NOT EXISTS public.offer_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  job_title TEXT NOT NULL,
  reporting_station TEXT,
  contract_type TEXT NOT NULL,
  grade_level TEXT,
  expected_start_date DATE,
  contract_duration TEXT,
  acceptance_deadline DATE NOT NULL,
  salary_notes TEXT,
  custom_clauses TEXT,
  include_ssafe_ifak BOOLEAN DEFAULT FALSE,
  allow_download_unsigned BOOLEAN DEFAULT FALSE,
  require_signature_before_download BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'accepted', 'rejected')),
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.offer_letters ENABLE ROW LEVEL SECURITY;

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_offer_letters_status ON public.offer_letters(status);
CREATE INDEX IF NOT EXISTS idx_offer_letters_applicant_id ON public.offer_letters(applicant_id);
CREATE INDEX IF NOT EXISTS idx_offer_letters_created_by ON public.offer_letters(created_by);

-- Create offer_letter_audit_logs table
CREATE TABLE IF NOT EXISTS public.offer_letter_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_letter_id UUID NOT NULL REFERENCES public.offer_letters(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.offer_letter_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create index for audit logs
CREATE INDEX IF NOT EXISTS idx_offer_letter_audit_logs_offer_letter_id ON public.offer_letter_audit_logs(offer_letter_id);
CREATE INDEX IF NOT EXISTS idx_offer_letter_audit_logs_created_at ON public.offer_letter_audit_logs(created_at);

-- RLS Policies for offer_letters table
-- Allow authenticated users to view their own organization's offer letters
CREATE POLICY "Users can view offer letters" ON public.offer_letters
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create offer letters
CREATE POLICY "Users can create offer letters" ON public.offer_letters
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own offer letters
CREATE POLICY "Users can update offer letters" ON public.offer_letters
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for audit logs
CREATE POLICY "Users can view audit logs" ON public.offer_letter_audit_logs
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create audit logs" ON public.offer_letter_audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
