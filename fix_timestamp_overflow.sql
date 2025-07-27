-- 🚨 EMERGENCY FIX: Timestamp Overflow in Flashcard System
-- This script fixes corrupted next_review_at dates and prevents future overflow

-- 1. Fix corrupted dates (anything beyond 2030 is probably wrong)
UPDATE user_flashcard_progress 
SET 
  next_review_at = NOW() + INTERVAL '1 day',
  interval_days = LEAST(interval_days, 365)
WHERE next_review_at > '2030-01-01'::timestamp;

-- 2. Fix any intervals that are too large
UPDATE user_flashcard_progress 
SET interval_days = LEAST(interval_days, 365)
WHERE interval_days > 365;

-- 3. Replace the calculate_next_review function with safe version
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
    -- SM-2 Algorithm implementation with interval cap
    IF quality >= 3 THEN
        -- Correct response
        IF interval_days = 1 THEN
            new_int := 6;
        ELSIF interval_days = 6 THEN
            new_int := ROUND(interval_days * new_ef);
        ELSE
            new_int := ROUND(interval_days * new_ef);
        END IF;
        
        -- 🛡️ SAFETY: Cap interval at 365 days (1 year) to prevent timestamp overflow
        new_int := LEAST(new_int, 365);
        
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

-- 4. Show what was fixed
SELECT 
  'Fixed Records' as status,
  COUNT(*) as count
FROM user_flashcard_progress 
WHERE interval_days = 365;