-- Create password reset tokens table
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_email ON public.password_reset_tokens(email);
CREATE INDEX idx_password_reset_tokens_expires ON public.password_reset_tokens(expires_at);

-- Enable RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public access for token validation
CREATE POLICY "Allow public reset token lookup" 
ON public.password_reset_tokens 
FOR SELECT 
USING (true);

-- Allow anyone to insert reset requests
CREATE POLICY "Allow public reset creation" 
ON public.password_reset_tokens 
FOR INSERT 
WITH CHECK (true);

-- Allow updates for token usage
CREATE POLICY "Allow public reset updates" 
ON public.password_reset_tokens 
FOR UPDATE 
USING (true);

-- Function to clean up expired reset tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_reset_tokens 
  WHERE expires_at < now() AND used = false;
END;
$$;

-- Function to generate a new reset token
CREATE OR REPLACE FUNCTION public.create_password_reset_token(
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
  DELETE FROM public.password_reset_tokens 
  WHERE email = p_email AND used = false;
  
  -- Generate a unique token (UUID without dashes + timestamp for extra uniqueness)
  v_token := replace(gen_random_uuid()::text, '-', '') || 
             extract(epoch from now())::bigint::text;
  
  -- Set expiration to 1 hour from now
  v_expires_at := now() + interval '1 hour';
  
  -- Insert new reset record
  INSERT INTO public.password_reset_tokens (email, token, expires_at)
  VALUES (p_email, v_token, v_expires_at);
  
  -- Return the token and expiration
  RETURN QUERY SELECT v_token, v_expires_at;
END;
$$;

-- Function to validate reset token
CREATE OR REPLACE FUNCTION public.validate_reset_token(
  p_token TEXT
)
RETURNS TABLE(
  valid BOOLEAN,
  email TEXT,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- Find the reset record
  SELECT * INTO v_record
  FROM public.password_reset_tokens
  WHERE token = p_token;
  
  -- Check if token exists
  IF v_record IS NULL THEN
    RETURN QUERY SELECT false, ''::TEXT, 'Token de reset inválido'::TEXT;
    RETURN;
  END IF;
  
  -- Check if already used
  IF v_record.used = true THEN
    RETURN QUERY SELECT false, v_record.email, 'Token já foi utilizado'::TEXT;
    RETURN;
  END IF;
  
  -- Check if expired
  IF v_record.expires_at < now() THEN
    -- Clean up expired token
    DELETE FROM public.password_reset_tokens WHERE id = v_record.id;
    RETURN QUERY SELECT false, v_record.email, 'Token expirado. Solicite um novo reset'::TEXT;
    RETURN;
  END IF;
  
  -- Check attempt limit (max 5 attempts)
  IF v_record.attempts >= 5 THEN
    RETURN QUERY SELECT false, v_record.email, 'Muitas tentativas. Solicite um novo reset'::TEXT;
    RETURN;
  END IF;
  
  -- Increment attempts
  UPDATE public.password_reset_tokens 
  SET attempts = attempts + 1
  WHERE id = v_record.id;
  
  RETURN QUERY SELECT true, v_record.email, 'Token válido'::TEXT;
END;
$$;

-- Function to mark token as used
CREATE OR REPLACE FUNCTION public.mark_reset_token_used(
  p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.password_reset_tokens 
  SET used = true, used_at = now()
  WHERE token = p_token AND used = false;
  
  RETURN FOUND;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE public.password_reset_tokens IS 'Store password reset tokens for secure password recovery';
COMMENT ON COLUMN public.password_reset_tokens.token IS 'Unique reset token sent via email';
COMMENT ON COLUMN public.password_reset_tokens.expires_at IS 'Token expiration timestamp (1 hour)';
COMMENT ON COLUMN public.password_reset_tokens.attempts IS 'Number of validation attempts';
COMMENT ON COLUMN public.password_reset_tokens.used IS 'Whether token has been used for password reset';
COMMENT ON COLUMN public.password_reset_tokens.used_at IS 'Timestamp when token was used'; 