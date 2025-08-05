-- Migration: Add user debug functions
-- Description: Functions to help debug authentication issues

-- Function to check user status in auth.users
CREATE OR REPLACE FUNCTION public.debug_user_status(
  p_email TEXT
)
RETURNS TABLE(
  email TEXT,
  exists_in_auth BOOLEAN,
  email_confirmed BOOLEAN,
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  raw_user_meta_data JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_record RECORD;
BEGIN
  -- Check if user exists in auth.users
  SELECT 
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    u.id,
    u.raw_user_meta_data
  INTO v_user_record
  FROM auth.users u
  WHERE u.email = p_email
  LIMIT 1;
  
  IF v_user_record IS NULL THEN
    RETURN QUERY SELECT 
      p_email,
      false,
      false,
      null,
      null,
      null,
      null,
      null;
  ELSE
    RETURN QUERY SELECT 
      v_user_record.email,
      true,
      v_user_record.email_confirmed_at IS NOT NULL,
      v_user_record.email_confirmed_at,
      v_user_record.created_at,
      v_user_record.last_sign_in_at,
      v_user_record.id,
      v_user_record.raw_user_meta_data;
  END IF;
END;
$$;

-- Function to list all verification records for an email
CREATE OR REPLACE FUNCTION public.debug_verification_records(
  p_email TEXT
)
RETURNS TABLE(
  id BIGINT,
  email TEXT,
  token TEXT,
  verified BOOLEAN,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT 
    ev.id,
    ev.email,
    ev.token,
    ev.verified,
    ev.verified_at,
    ev.created_at,
    ev.expires_at,
    ev.attempts,
    ev.user_id
  FROM public.email_verification ev
  WHERE ev.email = p_email
  ORDER BY ev.created_at DESC;
END;
$$;

-- Function to force confirm a user's email
CREATE OR REPLACE FUNCTION public.force_confirm_user_email(
  p_email TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_updated_count INTEGER;
BEGIN
  -- Update user to confirmed
  UPDATE auth.users 
  SET email_confirmed_at = now(),
      updated_at = now()
  WHERE email = p_email
  RETURNING id INTO v_user_id;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  IF v_updated_count = 0 THEN
    RETURN QUERY SELECT false, 'Usuário não encontrado'::TEXT, NULL::UUID;
  ELSE
    -- Mark verification records as verified
    UPDATE public.email_verification 
    SET verified = true,
        verified_at = now(),
        user_id = v_user_id
    WHERE email = p_email AND verified = false;
    
    RETURN QUERY SELECT true, 'Email confirmado com sucesso'::TEXT, v_user_id;
  END IF;
END;
$$;

-- Comments for documentation
COMMENT ON FUNCTION public.debug_user_status IS 'Debug function to check user status in auth.users';
COMMENT ON FUNCTION public.debug_verification_records IS 'Debug function to list verification records for an email';
COMMENT ON FUNCTION public.force_confirm_user_email IS 'Force confirm a user email (admin function)'; 