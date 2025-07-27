-- 🚀 EXECUTE THIS IN SUPABASE DASHBOARD > SQL EDITOR
-- Copy and paste this entire content, then click "RUN"

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    
    -- Professional information
    professional_title TEXT CHECK (professional_title IN (
        'tecnico', 'enfermeiro', 'especialista', 'residente', 
        'supervisor', 'coordenador', 'estudante'
    )),
    institution TEXT,
    department TEXT,
    specialty TEXT CHECK (specialty IN (
        'uti', 'emergencia', 'pediatria', 'obstetricia', 'cirurgica',
        'oncologia', 'cardiologia', 'psiquiatria', 'home_care', 'geral', 'outro'
    )),
    license_number TEXT,
    experience_years INTEGER CHECK (experience_years >= 0 AND experience_years <= 50),
    
    -- Personal information
    phone TEXT,
    date_of_birth DATE,
    bio TEXT,
    location TEXT,
    
    -- App preferences
    language TEXT DEFAULT 'pt' CHECK (language IN ('pt', 'en', 'es')),
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    dark_mode BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Create storage policies
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 6. Create helper function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create trigger
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_professional_title ON user_profiles(professional_title);
CREATE INDEX IF NOT EXISTS idx_user_profiles_specialty ON user_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institution ON user_profiles(institution);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- ✅ SUCCESS MESSAGE
-- If you see no errors above, the user profiles system is ready!
-- Now you can use the Profile page without the "table does not exist" error.