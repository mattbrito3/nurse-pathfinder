-- 👤 USER PROFILES TABLE
-- Professional user profile management with comprehensive fields

-- Create user_profiles table
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
    license_number TEXT, -- COREN number
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

-- 🔐 Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 📂 STORAGE BUCKET FOR AVATARS
-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 🔐 Storage policies for avatars
-- Users can upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can view any avatar (public)
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Users can update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 🔧 HELPER FUNCTIONS

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 📊 INDEXES for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_professional_title ON user_profiles(professional_title);
CREATE INDEX IF NOT EXISTS idx_user_profiles_specialty ON user_profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_user_profiles_institution ON user_profiles(institution);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- 💬 COMMENTS
COMMENT ON TABLE user_profiles IS 'Comprehensive user profiles for nursing professionals';
COMMENT ON COLUMN user_profiles.professional_title IS 'Professional title/role in nursing';
COMMENT ON COLUMN user_profiles.specialty IS 'Medical specialty or area of expertise';
COMMENT ON COLUMN user_profiles.license_number IS 'Professional license number (COREN)';
COMMENT ON COLUMN user_profiles.experience_years IS 'Years of professional experience';

-- ✅ INITIAL DATA
-- No initial data needed - profiles are created on first access