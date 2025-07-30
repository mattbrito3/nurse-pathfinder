-- Execute all new migrations for profiles and email verification
-- Run this in your Supabase SQL Editor

-- ============================================
-- MIGRATION 1: Add profile columns
-- ============================================

-- Professional information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS professional_title TEXT,
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER;

-- Personal information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- User preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;

-- Add comments for documentation (Profile columns)
COMMENT ON COLUMN public.profiles.professional_title IS 'Professional title (e.g., Nurse, Doctor)';
COMMENT ON COLUMN public.profiles.institution IS 'Hospital or institution where the user works';
COMMENT ON COLUMN public.profiles.department IS 'Department or sector';
COMMENT ON COLUMN public.profiles.specialty IS 'Medical specialty';
COMMENT ON COLUMN public.profiles.license_number IS 'Professional license number (COREN, CRM, etc.)';
COMMENT ON COLUMN public.profiles.experience_years IS 'Years of professional experience';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL of the user profile picture stored in Supabase Storage';
COMMENT ON COLUMN public.profiles.phone IS 'Phone number';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'Date of birth';
COMMENT ON COLUMN public.profiles.bio IS 'User biography/description';
COMMENT ON COLUMN public.profiles.location IS 'Location/address';
COMMENT ON COLUMN public.profiles.language IS 'Preferred language';
COMMENT ON COLUMN public.profiles.timezone IS 'User timezone';
COMMENT ON COLUMN public.profiles.email_notifications IS 'Enable email notifications';
COMMENT ON COLUMN public.profiles.push_notifications IS 'Enable push notifications';
COMMENT ON COLUMN public.profiles.dark_mode IS 'Dark mode preference';

-- ============================================
-- MIGRATION 2: Create email verification system
-- ============================================

-- Create email verification table
CREATE TABLE IF NOT EXISTS public.email_verification (
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
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON public.email_verification(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_email ON public.email_verification(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_expires ON public.email_verification(expires_at);

-- Enable RLS
ALTER TABLE public.email_verification ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public verification token lookup" ON public.email_verification;
DROP POLICY IF EXISTS "Allow public verification creation" ON public.email_verification;
DROP POLICY IF EXISTS "Allow public verification updates" ON public.email_verification;

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

-- Comments for documentation (Email verification)
COMMENT ON TABLE public.email_verification IS 'Store email verification tokens for user registration';
COMMENT ON COLUMN public.email_verification.token IS 'Unique verification token sent via email';
COMMENT ON COLUMN public.email_verification.expires_at IS 'Token expiration timestamp (24 hours)';
COMMENT ON COLUMN public.email_verification.attempts IS 'Number of verification attempts';
COMMENT ON COLUMN public.email_verification.verified IS 'Whether email has been verified';
COMMENT ON COLUMN public.email_verification.verified_at IS 'Timestamp when email was verified';

-- ============================================
-- VERIFICATION: Check results
-- ============================================

-- Verify profiles table structure
SELECT 'PROFILES TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify email_verification table structure  
SELECT 'EMAIL_VERIFICATION TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'email_verification' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show functions created
SELECT 'FUNCTIONS CREATED:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%verification%'
ORDER BY routine_name;