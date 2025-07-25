-- Função para incrementar contador de uso de termos
CREATE OR REPLACE FUNCTION increment_term_usage(term_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.medical_terms 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = term_id;
END;
$$;