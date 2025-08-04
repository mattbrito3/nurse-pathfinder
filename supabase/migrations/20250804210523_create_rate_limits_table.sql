-- Criar tabela para rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 1,
  last_attempt TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_attempt ON rate_limits(last_attempt);

-- RLS (Row Level Security)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Política: apenas o sistema pode acessar rate limits
DROP POLICY IF EXISTS "System can manage rate limits" ON rate_limits;
CREATE POLICY "System can manage rate limits" ON rate_limits
    FOR ALL USING (auth.role() = 'service_role');

-- Função para limpar rate limits antigos (mais de 24 horas)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE last_attempt < now() - INTERVAL '24 hours';
END;
$$;

-- Função para atualizar updated_at automaticamente (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_rate_limits_updated_at ON public.rate_limits;
CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.rate_limits IS 'Tabela para controle de rate limiting de APIs';
COMMENT ON COLUMN public.rate_limits.key IS 'Chave única para identificação do cliente (IP, user_id, etc.)';
COMMENT ON COLUMN public.rate_limits.attempts IS 'Número de tentativas na janela de tempo';
COMMENT ON COLUMN public.rate_limits.last_attempt IS 'Timestamp da última tentativa';
