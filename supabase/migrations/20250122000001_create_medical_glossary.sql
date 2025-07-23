-- Criar tabela de categorias do glossário
CREATE TABLE public.glossary_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de termos médicos
CREATE TABLE public.medical_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  pronunciation TEXT,
  category_id UUID REFERENCES public.glossary_categories(id),
  synonyms TEXT[], -- Array de sinônimos
  related_terms TEXT[], -- Array de termos relacionados
  difficulty_level TEXT CHECK (difficulty_level IN ('básico', 'intermediário', 'avançado')) DEFAULT 'básico',
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de favoritos do usuário
CREATE TABLE public.user_favorite_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  term_id UUID REFERENCES public.medical_terms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, term_id)
);

-- Habilitar RLS
ALTER TABLE public.glossary_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_terms ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias (leitura pública)
CREATE POLICY "Todos podem ver categorias" 
ON public.glossary_categories 
FOR SELECT 
USING (true);

-- Políticas RLS para termos médicos (leitura pública)
CREATE POLICY "Todos podem ver termos médicos" 
ON public.medical_terms 
FOR SELECT 
USING (true);

-- Políticas RLS para favoritos (usuário pode ver/gerenciar seus próprios favoritos)
CREATE POLICY "Usuários podem ver seus próprios favoritos" 
ON public.user_favorite_terms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem adicionar favoritos" 
ON public.user_favorite_terms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover favoritos" 
ON public.user_favorite_terms 
FOR DELETE 
USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_medical_terms_term ON public.medical_terms(term);
CREATE INDEX idx_medical_terms_category ON public.medical_terms(category_id);
CREATE INDEX idx_medical_terms_difficulty ON public.medical_terms(difficulty_level);
CREATE INDEX idx_user_favorite_terms_user ON public.user_favorite_terms(user_id);

-- Função para busca de termos
CREATE OR REPLACE FUNCTION search_medical_terms(search_query TEXT)
RETURNS TABLE (
  id UUID,
  term TEXT,
  definition TEXT,
  pronunciation TEXT,
  category_name TEXT,
  difficulty_level TEXT,
  synonyms TEXT[],
  related_terms TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.id,
    mt.term,
    mt.definition,
    mt.pronunciation,
    gc.name as category_name,
    mt.difficulty_level,
    mt.synonyms,
    mt.related_terms
  FROM public.medical_terms mt
  LEFT JOIN public.glossary_categories gc ON mt.category_id = gc.id
  WHERE 
    mt.term ILIKE '%' || search_query || '%' 
    OR mt.definition ILIKE '%' || search_query || '%'
    OR EXISTS (
      SELECT 1 FROM unnest(mt.synonyms) AS synonym 
      WHERE synonym ILIKE '%' || search_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN mt.term ILIKE search_query || '%' THEN 1
      WHEN mt.term ILIKE '%' || search_query || '%' THEN 2
      ELSE 3
    END,
    mt.term;
END;
$$;

-- Função para atualizar timestamp
CREATE TRIGGER update_medical_terms_updated_at
  BEFORE UPDATE ON public.medical_terms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();