-- Integration between custom email verification and Supabase Auth
-- This migration creates functions to handle user creation after email verification

-- Extend email_verification table to store user registration data temporarily
ALTER TABLE public.email_verification 
ADD COLUMN IF NOT EXISTS user_password TEXT,
ADD COLUMN IF NOT EXISTS user_full_name TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Function to create verification token with user data
CREATE OR REPLACE FUNCTION public.create_email_verification_token_with_user_data(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT
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
  
  -- Insert new verification record with user data
  INSERT INTO public.email_verification (
    email, 
    token, 
    expires_at, 
    user_password, 
    user_full_name
  )
  VALUES (
    p_email, 
    v_token, 
    v_expires_at, 
    crypt(p_password, gen_salt('bf')), -- Hash password
    p_full_name
  );
  
  -- Return the token and expiration
  RETURN QUERY SELECT v_token, v_expires_at;
END;
$$;

-- Function to verify email token and create user
CREATE OR REPLACE FUNCTION public.verify_email_token_and_create_user(
  p_token TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  email TEXT,
  message TEXT,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
  v_user_id UUID;
  v_user_record RECORD;
BEGIN
  -- Find the verification record
  SELECT * INTO v_record
  FROM public.email_verification
  WHERE token = p_token;
  
  -- Check if token exists
  IF v_record IS NULL THEN
    RETURN QUERY SELECT false, ''::TEXT, 'Token de verificação inválido'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if already verified
  IF v_record.verified = true THEN
    -- If already verified, return existing user
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_record.email LIMIT 1;
    RETURN QUERY SELECT false, v_record.email, 'Email já foi verificado'::TEXT, v_user_id;
    RETURN;
  END IF;
  
  -- Check if expired
  IF v_record.expires_at < now() THEN
    -- Clean up expired token
    DELETE FROM public.email_verification WHERE id = v_record.id;
    RETURN QUERY SELECT false, v_record.email, 'Token expirado. Solicite uma nova verificação'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check attempt limit (max 5 attempts)
  IF v_record.attempts >= 5 THEN
    RETURN QUERY SELECT false, v_record.email, 'Muitas tentativas. Solicite uma nova verificação'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if user already exists in auth.users
  SELECT * INTO v_user_record FROM auth.users WHERE email = v_record.email;
  
  IF v_user_record IS NOT NULL THEN
    -- User exists but not verified, update to confirmed
    UPDATE auth.users 
    SET email_confirmed_at = now(), 
        updated_at = now()
    WHERE id = v_user_record.id;
    
    v_user_id := v_user_record.id;
  ELSE
    -- Create new user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      email_change_token_current,
      email_change_sent_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_record.email,
      v_record.user_password,
      now(),
      null,
      null,
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('full_name', v_record.user_full_name),
      now(),
      now(),
      '',
      '',
      '',
      '',
      null
    )
    RETURNING id INTO v_user_id;
  END IF;
  
  -- Mark as verified and link user
  UPDATE public.email_verification 
  SET verified = true, 
      verified_at = now(),
      user_id = v_user_id
  WHERE id = v_record.id;
  
  RETURN QUERY SELECT true, v_record.email, 'Email verificado e usuário criado com sucesso!'::TEXT, v_user_id;
END;
$$;

-- Function to check if email exists (for validation)
CREATE OR REPLACE FUNCTION public.check_email_exists(
  p_email TEXT
)
RETURNS TABLE(
  exists_in_auth BOOLEAN,
  exists_in_verification BOOLEAN,
  is_verified BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_auth_exists BOOLEAN := false;
  v_verification_exists BOOLEAN := false;
  v_is_verified BOOLEAN := false;
BEGIN
  -- Check if exists in auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = p_email) INTO v_auth_exists;
  
  -- Check if exists in email_verification
  SELECT EXISTS(SELECT 1 FROM public.email_verification WHERE email = p_email) INTO v_verification_exists;
  
  -- Check if verified
  IF v_verification_exists THEN
    SELECT verified INTO v_is_verified 
    FROM public.email_verification 
    WHERE email = p_email 
    ORDER BY created_at DESC 
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT v_auth_exists, v_verification_exists, COALESCE(v_is_verified, false);
END;
$$;

-- Comments for documentation
COMMENT ON FUNCTION public.create_email_verification_token_with_user_data IS 'Create verification token with user registration data';
COMMENT ON FUNCTION public.verify_email_token_and_create_user IS 'Verify email token and create user in auth.users';
COMMENT ON FUNCTION public.check_email_exists IS 'Check if email exists in auth or verification system';