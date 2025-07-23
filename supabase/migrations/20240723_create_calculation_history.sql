-- Criar tabela para histórico de cálculos
CREATE TABLE calculation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('dosage', 'infusion', 'conversion', 'concentration', 'pediatric')),
  medication_name TEXT,
  calculation_data JSONB NOT NULL,
  result_data JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_calculation_history_user_id ON calculation_history(user_id);
CREATE INDEX idx_calculation_history_type ON calculation_history(type);
CREATE INDEX idx_calculation_history_created_at ON calculation_history(created_at DESC);
CREATE INDEX idx_calculation_history_favorites ON calculation_history(user_id, is_favorite) WHERE is_favorite = TRUE;

-- RLS (Row Level Security)
ALTER TABLE calculation_history ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver seus próprios cálculos
CREATE POLICY "Users can view own calculation history" ON calculation_history
    FOR SELECT USING (auth.uid() = user_id);

-- Política: usuários só podem inserir seus próprios cálculos
CREATE POLICY "Users can insert own calculation history" ON calculation_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política: usuários só podem atualizar seus próprios cálculos
CREATE POLICY "Users can update own calculation history" ON calculation_history
    FOR UPDATE USING (auth.uid() = user_id);

-- Política: usuários só podem deletar seus próprios cálculos
CREATE POLICY "Users can delete own calculation history" ON calculation_history
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_calculation_history_updated_at BEFORE UPDATE
    ON calculation_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();