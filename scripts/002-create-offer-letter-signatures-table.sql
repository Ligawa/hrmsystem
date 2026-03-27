-- Create offer_letter_signatures table
CREATE TABLE IF NOT EXISTS public.offer_letter_signatures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_letter_id UUID NOT NULL REFERENCES public.offer_letters(id) ON DELETE CASCADE,
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signature_type TEXT NOT NULL CHECK (signature_type IN ('typed', 'drawn')),
  signature_data TEXT NOT NULL, -- Base64 image data for drawn, name text for typed
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  consent_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offer_letter_signatures ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_offer_letter_signatures_offer_letter_id ON public.offer_letter_signatures(offer_letter_id);
CREATE INDEX IF NOT EXISTS idx_offer_letter_signatures_signed_at ON public.offer_letter_signatures(signed_at);

-- RLS Policies - Allow public access for signature submission (token-based auth)
CREATE POLICY "Allow signature submission" ON public.offer_letter_signatures
  FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Allow viewing signatures" ON public.offer_letter_signatures
  FOR SELECT
  USING (TRUE);

-- Also add signature_token column to offer_letters if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'offer_letters' 
                 AND column_name = 'signature_token') THEN
    ALTER TABLE public.offer_letters ADD COLUMN signature_token TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'offer_letters' 
                 AND column_name = 'viewed_at') THEN
    ALTER TABLE public.offer_letters ADD COLUMN viewed_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'offer_letters' 
                 AND column_name = 'signed_at') THEN
    ALTER TABLE public.offer_letters ADD COLUMN signed_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'offer_letters' 
                 AND column_name = 'sent_at') THEN
    ALTER TABLE public.offer_letters ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create index on signature_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_offer_letters_signature_token ON public.offer_letters(signature_token);
