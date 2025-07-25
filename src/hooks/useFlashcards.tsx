import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Types
export interface FlashcardCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  category_id: string;
  front: string;
  back: string;
  difficulty_level: number;
  created_by: string | null;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  category?: FlashcardCategory;
  progress?: UserProgress;
}

export interface UserProgress {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetition_count: number;
  quality_responses: number[];
  times_seen: number;
  times_correct: number;
  times_incorrect: number;
  consecutive_correct: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  mastery_level: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  session_type: 'review' | 'learning' | 'practice';
  category_id: string | null;
  cards_studied: number;
  cards_correct: number;
  cards_incorrect: number;
  total_time_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface FlashcardResponse {
  quality: number; // 0-5 (SM-2 algorithm)
  response_time_ms: number;
  was_correct: boolean;
  review_type: 'scheduled' | 'extra_practice' | 'cramming';
}

export const useFlashcards = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

  // Fetch all categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['flashcard-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as FlashcardCategory[];
    }
  });

  // Fetch flashcards by category
  const useFlashcardsByCategory = (categoryId?: string) => {
    return useQuery({
      queryKey: ['flashcards', categoryId],
      queryFn: async () => {
        let query = supabase
          .from('flashcards')
          .select(`
            *,
            category:flashcard_categories(*),
            progress:user_flashcard_progress(*)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Flashcard[];
      },
      enabled: !!categories.length
    });
  };

  // Fetch cards due for review
  const {
    data: dueCards = [],
    isLoading: dueCardsLoading,
    refetch: refetchDueCards
  } = useQuery({
    queryKey: ['due-cards', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_cards_due_for_review', {
          user_uuid: user.id,
          limit_count: 20
        });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 60000 // Refetch every minute
  });

  // Get cards for study session
  const getStudyCards = async (sessionType: 'review' | 'learning' | 'practice', categoryId?: string, limit: number = 10) => {
    if (!user?.id) throw new Error('User not authenticated');

    if (sessionType === 'review') {
      // Use due cards for review
      const { data, error } = await supabase
        .rpc('get_cards_due_for_review', {
          user_uuid: user.id,
          limit_count: limit
        });
      
      if (error) throw error;
      return data || [];
    } else {
      // For learning/practice, get cards from specific category or all
      let query = supabase
        .from('flashcards')
        .select(`
          id as flashcard_id,
          front,
          back,
          difficulty_level,
          category:flashcard_categories(name),
          progress:user_flashcard_progress(mastery_level, times_seen)
        `)
        .eq('is_public', true)
        .limit(limit);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data?.map((card, index) => ({
        flashcard_id: card.flashcard_id || `card_${index}_${Date.now()}`,
        front: card.front,
        back: card.back,
        category_name: card.category?.name || 'Geral',
        difficulty_level: card.difficulty_level,
        mastery_level: card.progress?.[0]?.mastery_level || 0,
        times_seen: card.progress?.[0]?.times_seen || 0
      })) || [];
    }
  };

  // Fetch user progress for a specific flashcard
  const getUserProgress = async (flashcardId: string): Promise<UserProgress | null> => {
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('flashcard_id', flashcardId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  };

  // Start study session
  const startStudySession = useMutation({
    mutationFn: async ({ 
      sessionType, 
      categoryId 
    }: { 
      sessionType: 'review' | 'learning' | 'practice';
      categoryId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flashcard_study_sessions')
        .insert({
          user_id: user.id,
          session_type: sessionType,
          category_id: categoryId || null
        })
        .select()
        .single();

      if (error) throw error;
      return data as StudySession;
    },
    onSuccess: (session) => {
      setCurrentSession(session);
    }
  });

  // End study session
  const endStudySession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('flashcard_study_sessions')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setCurrentSession(null);
      queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
    }
  });

  // Submit flashcard response
  const submitResponse = useMutation({
    mutationFn: async ({
      flashcardId,
      response,
      sessionId
    }: {
      flashcardId: string;
      response: FlashcardResponse;
      sessionId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // 1. Insert response record
      if (sessionId) {
        await supabase
          .from('flashcard_responses')
          .insert({
            session_id: sessionId,
            user_id: user.id,
            flashcard_id: flashcardId,
            quality: response.quality,
            response_time_ms: response.response_time_ms,
            was_correct: response.was_correct,
            review_type: response.review_type
          });
      }

      // 2. Get or create user progress
      let progress = await getUserProgress(flashcardId);
      
      if (!progress) {
        const { data, error } = await supabase
          .from('user_flashcard_progress')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            times_seen: 1,
            times_correct: response.was_correct ? 1 : 0,
            times_incorrect: response.was_correct ? 0 : 1,
            consecutive_correct: response.was_correct ? 1 : 0,
            last_reviewed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        progress = data;
      }

      // 3. Calculate next review using spaced repetition
      const { data: nextReview, error: calcError } = await supabase
        .rpc('calculate_next_review', {
          ease_factor: progress.ease_factor,
          interval_days: progress.interval_days,
          quality: response.quality
        });

      if (calcError) throw calcError;

      const newReview = nextReview[0];
      const nextReviewDate = new Date();
      nextReviewDate.setDate(nextReviewDate.getDate() + newReview.new_interval);

      // 4. Update progress
      const qualityHistory = [...progress.quality_responses, response.quality].slice(-10); // Keep last 10
      const newConsecutive = response.was_correct ? progress.consecutive_correct + 1 : 0;
      const newMasteryLevel = Math.min(5, Math.floor(newConsecutive / 3)); // Master after 3 consecutive correct

      const { error: updateError } = await supabase
        .from('user_flashcard_progress')
        .update({
          ease_factor: newReview.new_ease_factor,
          interval_days: newReview.new_interval,
          repetition_count: newReview.new_repetition_count,
          quality_responses: qualityHistory,
          times_seen: progress.times_seen + 1,
          times_correct: progress.times_correct + (response.was_correct ? 1 : 0),
          times_incorrect: progress.times_incorrect + (response.was_correct ? 0 : 1),
          consecutive_correct: newConsecutive,
          last_reviewed_at: new Date().toISOString(),
          next_review_at: nextReviewDate.toISOString(),
          mastery_level: newMasteryLevel
        })
        .eq('id', progress.id);

      if (updateError) throw updateError;

      // 5. Update session stats
      if (sessionId && currentSession) {
        await supabase
          .from('flashcard_study_sessions')
          .update({
            cards_studied: currentSession.cards_studied + 1,
            cards_correct: currentSession.cards_correct + (response.was_correct ? 1 : 0),
            cards_incorrect: currentSession.cards_incorrect + (response.was_correct ? 0 : 1),
            total_time_seconds: currentSession.total_time_seconds + Math.floor(response.response_time_ms / 1000)
          })
          .eq('id', sessionId);
      }

      return { progress, nextReview: newReview };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due-cards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      refetchDueCards();
    }
  });

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async (flashcardId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const progress = await getUserProgress(flashcardId);
      
      if (!progress) {
        // Create progress with favorite
        const { error } = await supabase
          .from('user_flashcard_progress')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            is_favorite: true
          });
        if (error) throw error;
      } else {
        // Toggle favorite
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update({ is_favorite: !progress.is_favorite })
          .eq('id', progress.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    }
  });

  // Create custom flashcard
  const createFlashcard = useMutation({
    mutationFn: async (flashcard: {
      category_id: string;
      front: string;
      back: string;
      difficulty_level: number;
      tags?: string[];
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('flashcards')
        .insert({
          ...flashcard,
          created_by: user.id,
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
    }
  });

  // Get user statistics
  const {
    data: userStats,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['user-flashcard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('mastery_level, times_seen, times_correct, times_incorrect')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalCards = data.length;
      const masteredCards = data.filter(p => p.mastery_level >= 5).length;
      const totalReviews = data.reduce((sum, p) => sum + p.times_seen, 0);
      const totalCorrect = data.reduce((sum, p) => sum + p.times_correct, 0);
      const accuracy = totalReviews > 0 ? (totalCorrect / totalReviews * 100) : 0;

      return {
        totalCards,
        masteredCards,
        totalReviews,
        accuracy: Math.round(accuracy),
        cardsToReview: dueCards.length
      };
    },
    enabled: !!user?.id
  });

  return {
    // Data
    categories,
    dueCards,
    userStats,
    currentSession,
    
    // Loading states
    categoriesLoading,
    dueCardsLoading,
    statsLoading,
    
    // Errors
    categoriesError,
    
    // Functions
    useFlashcardsByCategory,
    getUserProgress,
    getStudyCards,
    refetchDueCards,
    
    // Mutations
    startStudySession: startStudySession.mutateAsync,
    endStudySession: endStudySession.mutateAsync,
    submitResponse: submitResponse.mutateAsync,
    toggleFavorite: toggleFavorite.mutateAsync,
    createFlashcard: createFlashcard.mutateAsync,
    
    // Loading states for mutations
    isStartingSession: startStudySession.isPending,
    isSubmittingResponse: submitResponse.isPending,
    isTogglingFavorite: toggleFavorite.isPending,
    isCreatingFlashcard: createFlashcard.isPending
  };
};