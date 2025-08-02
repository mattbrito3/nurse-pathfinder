-- Adicionar campos para Google OAuth na tabela user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS google_id TEXT,
ADD COLUMN IF NOT EXISTS auth_providers TEXT[] DEFAULT ARRAY['email'];

-- Criar índice para google_id para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_google_id ON user_profiles(google_id);

-- Adicionar constraint para garantir que auth_providers não seja null
ALTER TABLE user_profiles 
ALTER COLUMN auth_providers SET NOT NULL;

-- Adicionar constraint para garantir que auth_providers tenha pelo menos um valor
ALTER TABLE user_profiles 
ADD CONSTRAINT check_auth_providers_not_empty 
CHECK (array_length(auth_providers, 1) > 0);

-- Comentários para documentação
COMMENT ON COLUMN user_profiles.google_id IS 'ID único do usuário no Google OAuth';
COMMENT ON COLUMN user_profiles.auth_providers IS 'Array de provedores de autenticação usados pelo usuário (email, google)'; 