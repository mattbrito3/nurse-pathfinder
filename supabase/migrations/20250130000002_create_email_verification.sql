-- Create email verification system for custom verification without external services

-- Create email verification table
CREATE TABLE public.email_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create index for performance
CREATE INDEX idx_email_verification_token ON public.email_verification(token);
CREATE INDEX idx_email_verification_email ON public.email_verification(email);
CREATE INDEX idx_email_verification_expires ON public.email_verification(expires_at);

-- Enable RLS
ALTER TABLE public.email_verification ENABLE ROW LEVEL SECURITY;

-- Allow public access for verification (needed for email links)
CREATE POLICY "Allow public verification token lookup" 
ON public.email_verification 
FOR SELECT 
USING (true);

-- Allow anyone to insert verification requests
CREATE POLICY "Allow public verification creation" 
ON public.email_verification 
FOR INSERT 
WITH CHECK (true);

-- Allow updates for verification
CREATE POLICY "Allow public verification updates" 
ON public.email_verification 
FOR UPDATE 
USING (true);

-- Function to clean up expired verification tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.email_verification 
  WHERE expires_at < now() AND verified = false;
END;
$$;

-- Function to generate a new verification token
CREATE OR REPLACE FUNCTION public.create_email_verification_token(
  p_email TEXT
)
RETURNS TABLE(
  token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Clean up any existing tokens for this email
  DELETE FROM public.email_verification 
  WHERE email = p_email AND verified = false;
  
  -- Generate a unique token (UUID without dashes + timestamp for extra uniqueness)
  v_token := replace(gen_random_uuid()::text, '-', '') || 
             extract(epoch from now())::bigint::text;
  
  -- Set expiration to 24 hours from now
  v_expires_at := now() + interval '24 hours';
  
  -- Insert new verification record
  INSERT INTO public.email_verification (email, token, expires_at)
  VALUES (p_email, v_token, v_expires_at);
  
  -- Return the token and expiration
  RETURN QUERY SELECT v_token, v_expires_at;
END;
$$;

-- Function to verify email token
CREATE OR REPLACE FUNCTION public.verify_email_token(
  p_token TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  email TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- Find the verification record
  SELECT * INTO v_record
  FROM public.email_verification
  WHERE token = p_token;
  
  -- Check if token exists
  IF v_record IS NULL THEN
    RETURN QUERY SELECT false, ''::TEXT, 'Token de verificação inválido'::TEXT;
    RETURN;
  END IF;
  
  -- Check if already verified
  IF v_record.verified = true THEN
    RETURN QUERY SELECT false, v_record.email, 'Email já foi verificado'::TEXT;
    RETURN;
  END IF;
  
  -- Check if expired
  IF v_record.expires_at < now() THEN
    -- Clean up expired token
    DELETE FROM public.email_verification WHERE id = v_record.id;
    RETURN QUERY SELECT false, v_record.email, 'Token expirado. Solicite uma nova verificação'::TEXT;
    RETURN;
  END IF;
  
  -- Check attempt limit (max 5 attempts)
  IF v_record.attempts >= 5 THEN
    RETURN QUERY SELECT false, v_record.email, 'Muitas tentativas. Solicite uma nova verificação'::TEXT;
    RETURN;
  END IF;
  
  -- Mark as verified
  UPDATE public.email_verification 
  SET verified = true, verified_at = now()
  WHERE id = v_record.id;
  
  RETURN QUERY SELECT true, v_record.email, 'Email verificado com sucesso!'::TEXT;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE public.email_verification IS 'Store email verification tokens for user registration';
COMMENT ON COLUMN public.email_verification.token IS 'Unique verification token sent via email';
COMMENT ON COLUMN public.email_verification.expires_at IS 'Token expiration timestamp (24 hours)';
COMMENT ON COLUMN public.email_verification.attempts IS 'Number of verification attempts';
COMMENT ON COLUMN public.email_verification.verified IS 'Whether email has been verified';
COMMENT ON COLUMN public.email_verification.verified_at IS 'Timestamp when email was verified';