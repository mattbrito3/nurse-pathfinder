-- Add missing columns to profiles table for complete user profile

-- Professional information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS professional_title TEXT,
ADD COLUMN IF NOT EXISTS institution TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS specialty TEXT,
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER;

-- Personal information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- User preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.professional_title IS 'Professional title (e.g., Nurse, Doctor)';
COMMENT ON COLUMN public.profiles.institution IS 'Hospital or institution where the user works';
COMMENT ON COLUMN public.profiles.department IS 'Department or sector';
COMMENT ON COLUMN public.profiles.specialty IS 'Medical specialty';
COMMENT ON COLUMN public.profiles.license_number IS 'Professional license number (COREN, CRM, etc.)';
COMMENT ON COLUMN public.profiles.experience_years IS 'Years of professional experience';
COMMENT ON COLUMN public.profiles.phone IS 'Phone number';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'Date of birth';
COMMENT ON COLUMN public.profiles.bio IS 'User biography/description';
COMMENT ON COLUMN public.profiles.location IS 'Location/address';
COMMENT ON COLUMN public.profiles.language IS 'Preferred language';
COMMENT ON COLUMN public.profiles.timezone IS 'User timezone';
COMMENT ON COLUMN public.profiles.email_notifications IS 'Enable email notifications';
COMMENT ON COLUMN public.profiles.push_notifications IS 'Enable push notifications';
COMMENT ON COLUMN public.profiles.dark_mode IS 'Dark mode preference';