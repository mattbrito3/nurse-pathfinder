import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Utility function to shuffle array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
  const useFlashcardsByCategory = (categoryId?: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: ['flashcards', categoryId, user?.id],
      staleTime: 0, // Force refresh to see updated times_seen
      queryFn: async () => {
        // First get the flashcards
        let query = supabase
          .from('flashcards')
          .select(`
            *,
            category:flashcard_categories(*)
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false });

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data: flashcardsData, error: flashcardsError } = await query;
        if (flashcardsError) throw flashcardsError;

        if (!flashcardsData || !user?.id) return flashcardsData as Flashcard[];

        // Get progress for these flashcards
        const flashcardIds = flashcardsData.map(f => f.id);
        const { data: progressData, error: progressError } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('flashcard_id', flashcardIds);

        if (progressError) throw progressError;

        // Merge the data
        const flashcardsWithProgress = flashcardsData.map(flashcard => ({
          ...flashcard,
          progress: progressData?.find(p => p.flashcard_id === flashcard.id) || null
        }));

        return flashcardsWithProgress as Flashcard[];
      },
      enabled: !!categories.length && enabled
    });
  };

  // Fetch favorite flashcards across all categories
  const useFavoriteFlashcards = () => {
    return useQuery({
      queryKey: ['favorite-flashcards', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        // Get favorite flashcard IDs
        const { data: progressData, error: progressError } = await supabase
          .from('user_flashcard_progress')
          .select('flashcard_id')
          .eq('user_id', user.id)
          .eq('is_favorite', true);
          
        if (progressError) throw progressError;
        if (!progressData || progressData.length === 0) return [];

        const flashcardIds = progressData.map(p => p.flashcard_id);

        // Get the flashcards
        const { data: flashcardsData, error: flashcardsError } = await supabase
          .from('flashcards')
          .select(`
            *,
            category:flashcard_categories(*)
          `)
          .eq('is_public', true)
          .in('id', flashcardIds)
          .order('created_at', { ascending: false });
        
        if (flashcardsError) throw flashcardsError;

        // Get full progress data
        const { data: fullProgressData, error: fullProgressError } = await supabase
          .from('user_flashcard_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('flashcard_id', flashcardIds);

        if (fullProgressError) throw fullProgressError;

        // Merge the data
        const flashcardsWithProgress = flashcardsData?.map(flashcard => ({
          ...flashcard,
          progress: fullProgressData?.find(p => p.flashcard_id === flashcard.id) || null
        })) || [];

        return flashcardsWithProgress as Flashcard[];
      },
      enabled: !!user?.id,
      staleTime: 0, // Always fetch fresh data
      cacheTime: 0  // Don't cache at all
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
        .select('id, front, back, difficulty_level, category_id, category:flashcard_categories(name)')
        .eq('is_public', true);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      } else {
        // For random exploration, order by creation date and shuffle client-side
        query = query.order('created_at', { ascending: false });
      }
      
      query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;

      let mappedCards = data?.map((card, index) => ({
        flashcard_id: card.id || `card_${index}_${Date.now()}`,
        front: card.front,
        back: card.back,
        category_name: card.category?.name || 'Geral',
        difficulty_level: card.difficulty_level,
        mastery_level: 0, // Will add progress data later
        times_seen: 0 // Will add progress data later
      })) || [];

      // If no category specified (random exploration), shuffle the cards
      if (!categoryId && mappedCards.length > 0) {
        mappedCards = shuffleArray(mappedCards);
      }

      return mappedCards;
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

  // Mark flashcard as viewed (increment times_seen)
  const markAsViewed = useMutation({
    mutationFn: async (flashcardId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if progress exists
      const { data: existingProgress } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .maybeSingle();

      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update({
            times_seen: existingProgress.times_seen + 1,
            last_reviewed_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
        return { ...existingProgress, times_seen: existingProgress.times_seen + 1 };
      } else {
        // Create new progress record
        const { data, error } = await supabase
          .from('user_flashcard_progress')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            times_seen: 1,
            times_correct: 0,
            times_incorrect: 0,
            consecutive_correct: 0,
            last_reviewed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['user-flashcard-stats'] });
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
      
      // 🎯 IMPROVED MASTERY ALGORITHM - More practical and faster progression
      // Bonus progression for "Perfeito" (quality 5) responses
      const perfectCount = qualityHistory.filter(q => q === 5).length;
      const hasPerfectBonus = perfectCount >= 3; // 3+ "Perfeito" responses give bonus
      
      let newMasteryLevel = 0;
      if (newConsecutive >= 8 || (newConsecutive >= 6 && hasPerfectBonus)) {
        newMasteryLevel = 5; // DOMINADO after 8 consecutive OR 6 consecutive with perfect bonus
      } else if (newConsecutive >= 6 || (newConsecutive >= 5 && hasPerfectBonus)) {
        newMasteryLevel = 4; // Avançado after 6 consecutive OR 5 with perfect bonus
      } else if (newConsecutive >= 4 || (newConsecutive >= 3 && hasPerfectBonus)) {
        newMasteryLevel = 3; // Intermediário after 4 consecutive OR 3 with perfect bonus
      } else if (newConsecutive >= 3) {
        newMasteryLevel = 2; // Básico after 3 consecutive
      } else if (newConsecutive >= 2) {
        newMasteryLevel = 1; // Iniciante after 2 consecutive
      } else {
        newMasteryLevel = 0; // Novo
      }

      // 🔍 DEBUG: Log mastery calculation
      console.log('🎯 MASTERY CALCULATION DEBUG:', {
        flashcardId,
        quality: response.quality,
        was_correct: response.was_correct,
        old_consecutive: progress.consecutive_correct,
        new_consecutive: newConsecutive,
        perfect_count: perfectCount,
        has_perfect_bonus: hasPerfectBonus,
        old_mastery: progress.mastery_level,
        new_mastery: newMasteryLevel,
        times_correct: progress.times_correct + (response.was_correct ? 1 : 0),
        times_seen: progress.times_seen + 1,
        quality_history: qualityHistory
      });

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
      if (sessionId) {
        // Get current session stats from database to avoid state sync issues
        const { data: currentSessionData } = await supabase
          .from('flashcard_study_sessions')
          .select('cards_studied, cards_correct, cards_incorrect, total_time_seconds')
          .eq('id', sessionId)
          .single();

        if (currentSessionData) {
          const newStats = {
            cards_studied: (currentSessionData.cards_studied || 0) + 1,
            cards_correct: (currentSessionData.cards_correct || 0) + (response.was_correct ? 1 : 0),
            cards_incorrect: (currentSessionData.cards_incorrect || 0) + (response.was_correct ? 0 : 1),
            total_time_seconds: (currentSessionData.total_time_seconds || 0) + Math.floor(response.response_time_ms / 1000)
          };

          console.log('📊 Atualizando estatísticas da sessão:', {
            sessionId,
            before: currentSessionData,
            after: newStats,
            wasCorrect: response.was_correct
          });

          const { error: sessionUpdateError } = await supabase
            .from('flashcard_study_sessions')
            .update(newStats)
            .eq('id', sessionId);

          if (sessionUpdateError) {
            console.error('❌ Erro ao atualizar estatísticas da sessão:', sessionUpdateError);
          } else {
            console.log('✅ Estatísticas da sessão atualizadas com sucesso!');
          }
        }
      }

      return { progress, nextReview: newReview };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due-cards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards'] });
      queryClient.invalidateQueries({ queryKey: ['user-flashcard-stats'] });
      // Invalidate analytics queries to update charts
      queryClient.invalidateQueries({ queryKey: ['analytics-overall-stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-weekly-progress'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-category-stats'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-mastery-distribution'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-study-streak'] });
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
            is_favorite: true,
            mastery_level: 0,
            times_seen: 0
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
    useFavoriteFlashcards,
    getUserProgress,
    getStudyCards,
    refetchDueCards,
    
    // Mutations
    startStudySession: startStudySession.mutateAsync,
    endStudySession: endStudySession.mutateAsync,
    submitResponse: submitResponse.mutateAsync,
    markAsViewed: markAsViewed.mutateAsync,
    toggleFavorite: toggleFavorite.mutateAsync,
    createFlashcard: createFlashcard.mutateAsync,
    
    // Loading states for mutations
    isStartingSession: startStudySession.isPending,
    isSubmittingResponse: submitResponse.isPending,
    isMarkingAsViewed: markAsViewed.isPending,
    isTogglingFavorite: toggleFavorite.isPending,
    isCreatingFlashcard: createFlashcard.isPending
  };
};