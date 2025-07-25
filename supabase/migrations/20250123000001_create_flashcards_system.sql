-- Migration: Flashcards System
-- Description: Complete system for interactive flashcards with spaced repetition

-- 1. Create flashcard_categories table
CREATE TABLE IF NOT EXISTS public.flashcard_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
    icon VARCHAR(50) DEFAULT 'brain',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.flashcard_categories(id) ON DELETE CASCADE,
    front TEXT NOT NULL, -- Question/term
    back TEXT NOT NULL, -- Answer/definition
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false, -- Public flashcards vs user-created
    tags TEXT[], -- Array of tags for filtering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create user_flashcard_progress table (spaced repetition data)
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    
    -- Spaced Repetition Algorithm (SM-2 based)
    ease_factor DECIMAL(3,2) DEFAULT 2.5 CHECK (ease_factor >= 1.3),
    interval_days INTEGER DEFAULT 1 CHECK (interval_days >= 0),
    repetition_count INTEGER DEFAULT 0,
    quality_responses INTEGER[] DEFAULT '{}', -- Array of last quality responses (0-5)
    
    -- Progress tracking
    times_seen INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    times_incorrect INTEGER DEFAULT 0,
    consecutive_correct INTEGER DEFAULT 0,
    
    -- Scheduling
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5), -- 0=new, 5=mastered
    is_favorite BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, flashcard_id)
);

-- 4. Create flashcard_study_sessions table
CREATE TABLE IF NOT EXISTS public.flashcard_study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) DEFAULT 'review', -- 'review', 'learning', 'practice'
    category_id UUID REFERENCES public.flashcard_categories(id),
    
    -- Session stats
    cards_studied INTEGER DEFAULT 0,
    cards_correct INTEGER DEFAULT 0,
    cards_incorrect INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create flashcard_responses table (detailed response tracking)
CREATE TABLE IF NOT EXISTS public.flashcard_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.flashcard_study_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    
    -- Response data
    quality INTEGER CHECK (quality BETWEEN 0 AND 5), -- 0=complete blackout, 5=perfect
    response_time_ms INTEGER,
    was_correct BOOLEAN,
    
    -- Context
    review_type VARCHAR(50), -- 'scheduled', 'extra_practice', 'cramming'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_flashcards_category ON public.flashcards(category_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_difficulty ON public.flashcards(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_flashcards_public ON public.flashcards(is_public);
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON public.flashcards USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_next_review ON public.user_flashcard_progress(next_review_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_mastery ON public.user_flashcard_progress(mastery_level);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_next_review ON public.user_flashcard_progress(user_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user ON public.flashcard_study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started ON public.flashcard_study_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_responses_session ON public.flashcard_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON public.flashcard_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_responses_flashcard ON public.flashcard_responses(flashcard_id);

-- 7. Enable Row Level Security
ALTER TABLE public.flashcard_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_responses ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies

-- Categories: Everyone can read, only admins can modify
CREATE POLICY "Anyone can view flashcard categories" ON public.flashcard_categories
    FOR SELECT USING (true);

-- Flashcards: Everyone can read public ones, users can manage their own
CREATE POLICY "Anyone can view public flashcards" ON public.flashcards
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create flashcards" ON public.flashcards
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own flashcards" ON public.flashcards
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own flashcards" ON public.flashcards
    FOR DELETE USING (created_by = auth.uid());

-- Progress: Users can only access their own progress
CREATE POLICY "Users can view own progress" ON public.user_flashcard_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own progress" ON public.user_flashcard_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON public.user_flashcard_progress
    FOR UPDATE USING (user_id = auth.uid());

-- Study sessions: Users can only access their own sessions
CREATE POLICY "Users can view own study sessions" ON public.flashcard_study_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own study sessions" ON public.flashcard_study_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own study sessions" ON public.flashcard_study_sessions
    FOR UPDATE USING (user_id = auth.uid());

-- Responses: Users can only access their own responses
CREATE POLICY "Users can view own responses" ON public.flashcard_responses
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own responses" ON public.flashcard_responses
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- 9. Create functions for spaced repetition algorithm
CREATE OR REPLACE FUNCTION calculate_next_review(
    ease_factor DECIMAL,
    interval_days INTEGER,
    quality INTEGER
) RETURNS TABLE(
    new_ease_factor DECIMAL,
    new_interval INTEGER,
    new_repetition_count INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    new_ef DECIMAL := ease_factor;
    new_int INTEGER := interval_days;
    new_rep INTEGER;
BEGIN
    -- SM-2 Algorithm implementation
    IF quality >= 3 THEN
        -- Correct response
        IF interval_days = 1 THEN
            new_int := 6;
        ELSIF interval_days = 6 THEN
            new_int := ROUND(interval_days * new_ef);
        ELSE
            new_int := ROUND(interval_days * new_ef);
        END IF;
        
        -- Update ease factor
        new_ef := new_ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        IF new_ef < 1.3 THEN
            new_ef := 1.3;
        END IF;
        
        new_rep := COALESCE((SELECT repetition_count FROM user_flashcard_progress 
                           WHERE user_id = auth.uid() LIMIT 1), 0) + 1;
    ELSE
        -- Incorrect response - reset interval
        new_int := 1;
        new_rep := 0;
    END IF;
    
    RETURN QUERY SELECT new_ef, new_int, new_rep;
END;
$$;

-- 10. Create function to get cards due for review
CREATE OR REPLACE FUNCTION get_cards_due_for_review(user_uuid UUID, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
    flashcard_id UUID,
    front TEXT,
    back TEXT,
    category_name VARCHAR,
    difficulty_level INTEGER,
    mastery_level INTEGER,
    times_seen INTEGER,
    next_review_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.front,
        f.back,
        fc.name,
        f.difficulty_level,
        COALESCE(ufp.mastery_level, 0),
        COALESCE(ufp.times_seen, 0),
        COALESCE(ufp.next_review_at, NOW())
    FROM public.flashcards f
    JOIN public.flashcard_categories fc ON f.category_id = fc.id
    LEFT JOIN public.user_flashcard_progress ufp ON f.id = ufp.flashcard_id AND ufp.user_id = user_uuid
    WHERE 
        (f.is_public = true OR f.created_by = user_uuid)
        AND (ufp.next_review_at IS NULL OR ufp.next_review_at <= NOW())
        AND (ufp.mastery_level IS NULL OR ufp.mastery_level < 5)
    ORDER BY 
        COALESCE(ufp.next_review_at, NOW()) ASC,
        COALESCE(ufp.mastery_level, 0) ASC,
        f.difficulty_level ASC
    LIMIT limit_count;
END;
$$;

-- 11. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_flashcard_categories_updated_at BEFORE UPDATE ON public.flashcard_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at BEFORE UPDATE ON public.flashcards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_flashcard_progress_updated_at BEFORE UPDATE ON public.user_flashcard_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();