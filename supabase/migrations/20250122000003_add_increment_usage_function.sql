-- Função para incrementar contador de uso de termos
CREATE OR REPLACE FUNCTION increment_term_usage(term_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.medical_terms 
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = term_id;
END;
$$;