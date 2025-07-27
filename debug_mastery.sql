-- Debug: Check mastery levels for Anatomy category
SELECT 
  f.front,
  f.back,
  p.consecutive_correct,
  p.mastery_level,
  p.times_seen,
  p.times_correct,
  p.times_incorrect,
  p.last_reviewed_at
FROM flashcards f
JOIN flashcard_categories c ON f.category_id = c.id
LEFT JOIN user_flashcard_progress p ON f.id = p.flashcard_id
WHERE c.name = 'Anatomia'
  AND p.user_id IS NOT NULL -- Only show cards with progress
ORDER BY p.mastery_level DESC, p.consecutive_correct DESC;

-- Summary of mastery distribution for Anatomy
SELECT 
  p.mastery_level,
  COUNT(*) as count,
  ROUND(AVG(p.consecutive_correct)::numeric, 1) as avg_consecutive,
  ROUND((AVG(p.times_correct::float / NULLIF(p.times_seen, 0)) * 100)::numeric, 1) as accuracy_pct
FROM flashcards f
JOIN flashcard_categories c ON f.category_id = c.id
JOIN user_flashcard_progress p ON f.id = p.flashcard_id
WHERE c.name = 'Anatomia'
GROUP BY p.mastery_level
ORDER BY p.mastery_level;