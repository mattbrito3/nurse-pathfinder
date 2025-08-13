/**
 * 🧠 FLASHCARDS HOOK
 * Sistema completo de flashcards com repetição espaçada
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FlashcardCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  flashcard_count?: number;
  created_at: string;
}

export interface Flashcard {
  id: string;
  category_id: string;
  category_name?: string;
  front: string;
  back: string;
  difficulty_level: number;
  created_by?: string;
  is_public: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
  progress?: UserFlashcardProgress;
}

export interface UserFlashcardProgress {
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
  last_reviewed_at?: string;
  next_review_at?: string;
  mastery_level: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  session_type: 'review' | 'learning' | 'practice';
  category_id?: string;
  cards_studied: number;
  cards_correct: number;
  cards_incorrect: number;
  total_time_seconds: number;
  started_at: string;
  ended_at?: string;
  created_at: string;
}

export interface FlashcardResponse {
  id: string;
  user_id: string;
  flashcard_id: string;
  session_id: string;
  quality: number; // 0-5 (SM-2 algorithm)
  response_time_ms: number;
  was_correct: boolean;
  review_type: 'scheduled' | 'extra_practice' | 'cramming';
}

export const useFlashcards = () => {
  const { user } = useAuth();
  const { isActive } = useSubscription();
  const queryClient = useQueryClient();
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

  // Fetch all categories with statistics
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['flashcard-categories', user?.id],
    queryFn: async () => {
      // Get categories with flashcard statistics
      const { data, error } = await supabase
        .from('flashcard_categories')
        .select(`
          *,
          flashcards(
            id,
            difficulty_level,
            is_public,
            created_by
          )
        `)
        .order('name');
      
      if (error) throw error;
      
      return data?.map(category => ({
        ...category,
        flashcard_count: category.flashcards?.length || 0
      })) || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch user statistics
  const {
    data: userStats = null,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: ['user-flashcard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      const totalCards = data?.length || 0;
      const masteredCards = data?.filter(p => p.mastery_level >= 5).length || 0;
      const totalReviews = data?.reduce((sum, p) => sum + p.times_seen, 0) || 0;
      const correctReviews = data?.reduce((sum, p) => sum + p.times_correct, 0) || 0;
      const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;
      
      return {
        totalCards,
        masteredCards,
        totalReviews,
        correctReviews,
        accuracy: Math.round(accuracy * 100) / 100
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  // Fetch favorite flashcards
  const useFavoriteFlashcards = () => {
    return useQuery({
      queryKey: ['favorite-flashcards', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        // Get favorite flashcards
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
          .or(`is_public.eq.true,and(is_public.eq.false,created_by.eq.${user.id})`)
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
      staleTime: 0 // Always fetch fresh data
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
    
    // Check monthly usage limit for free users
    if (!isActive) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthlyUsageKey = `flashcard_monthly_usage_${user.id}_${currentMonth}`;
      const currentUsage = parseInt(localStorage.getItem(monthlyUsageKey) || '0');
      
      if (currentUsage >= 50) {
        throw new Error('Limite mensal de 50 flashcards atingido. Faça upgrade para acessar flashcards ilimitados.');
      }
    }

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
      // For learning/practice, get random cards
      let query = supabase
        .from('flashcards')
        .select(`
          *,
          category:flashcard_categories(*)
        `)
        .or(`is_public.eq.true,and(is_public.eq.false,created_by.eq.${user.id})`)
        .limit(limit);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    }
  };

  // Start study session
  const startStudySession = async ({ sessionType, categoryId }: { sessionType: 'review' | 'learning' | 'practice', categoryId?: string }) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    // Check monthly usage limit for free users
    if (!isActive) {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthlyUsageKey = `flashcard_monthly_usage_${user.id}_${currentMonth}`;
      const currentUsage = parseInt(localStorage.getItem(monthlyUsageKey) || '0');
      
      if (currentUsage >= 50) {
        throw new Error('Limite mensal de 50 flashcards atingido. Faça upgrade para acessar flashcards ilimitados.');
      }
    }

    const { data, error } = await supabase
      .from('flashcard_study_sessions')
      .insert({
        user_id: user.id,
        session_type: sessionType,
        category_id: categoryId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    setCurrentSession(data);
    return data;
  };

  // End study session
  const endStudySession = async (sessionId: string, stats: { cardsStudied: number, cardsCorrect: number, cardsIncorrect: number, totalTimeSeconds: number }) => {
    const { error } = await supabase
      .from('flashcard_study_sessions')
      .update({
        cards_studied: stats.cardsStudied,
        cards_correct: stats.cardsCorrect,
        cards_incorrect: stats.cardsIncorrect,
        total_time_seconds: stats.totalTimeSeconds,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);
    
    if (error) throw error;
    
    // Update monthly usage for free users
    if (!isActive) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyUsageKey = `flashcard_monthly_usage_${user?.id}_${currentMonth}`;
      const currentUsage = parseInt(localStorage.getItem(monthlyUsageKey) || '0');
      localStorage.setItem(monthlyUsageKey, (currentUsage + stats.cardsStudied).toString());
    }
    
    setCurrentSession(null);
    queryClient.invalidateQueries({ queryKey: ['user-flashcard-stats'] });
  };

  // Submit flashcard response
  const submitResponse = useMutation({
    mutationFn: async ({ flashcardId, quality, responseTime, wasCorrect, reviewType }: {
      flashcardId: string;
      quality: number;
      responseTime: number;
      wasCorrect: boolean;
      reviewType: 'scheduled' | 'extra_practice' | 'cramming';
    }) => {
      if (!user?.id || !currentSession) throw new Error('User not authenticated or no active session');
      
      // Insert response
      const { data: responseData, error: responseError } = await supabase
        .from('flashcard_responses')
        .insert({
          user_id: user.id,
          flashcard_id: flashcardId,
          session_id: currentSession.id,
          quality,
          response_time_ms: responseTime,
          was_correct: wasCorrect,
          review_type: reviewType
        })
        .select()
        .single();
      
      if (responseError) throw responseError;
      
      // Update progress using SM-2 algorithm
      const { data: progressData, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();
      
      if (progressError && progressError.code !== 'PGRST116') throw progressError;
      
      let newProgress;
      if (progressData) {
        // Update existing progress
        const { ease_factor, interval_days, repetition_count } = progressData;
        const newEaseFactor = Math.max(1.3, ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
        
        let newInterval;
        if (quality >= 3) {
          if (interval_days === 1) {
            newInterval = 6;
          } else {
            newInterval = Math.round(interval_days * newEaseFactor);
          }
        } else {
          newInterval = 1;
        }
        
        const newRepetitionCount = quality >= 3 ? repetition_count + 1 : 0;
        
        const { error: updateError } = await supabase
          .from('user_flashcard_progress')
          .update({
            ease_factor: newEaseFactor,
            interval_days: newInterval,
            repetition_count: newRepetitionCount,
            times_seen: progressData.times_seen + 1,
            times_correct: progressData.times_correct + (wasCorrect ? 1 : 0),
            times_incorrect: progressData.times_incorrect + (wasCorrect ? 0 : 1),
            consecutive_correct: wasCorrect ? progressData.consecutive_correct + 1 : 0,
            last_reviewed_at: new Date().toISOString(),
            next_review_at: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000).toISOString(),
            mastery_level: Math.min(5, Math.floor(newRepetitionCount / 2))
          })
          .eq('id', progressData.id);
        
        if (updateError) throw updateError;
      } else {
        // Create new progress
        const { error: insertError } = await supabase
          .from('user_flashcard_progress')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            ease_factor: 2.5,
            interval_days: quality >= 3 ? 6 : 1,
            repetition_count: quality >= 3 ? 1 : 0,
            times_seen: 1,
            times_correct: wasCorrect ? 1 : 0,
            times_incorrect: wasCorrect ? 0 : 1,
            consecutive_correct: wasCorrect ? 1 : 0,
            last_reviewed_at: new Date().toISOString(),
            next_review_at: new Date(Date.now() + (quality >= 3 ? 6 : 1) * 24 * 60 * 60 * 1000).toISOString(),
            mastery_level: quality >= 3 ? 1 : 0
          });
        
        if (insertError) throw insertError;
      }
      
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['due-cards'] });
      queryClient.invalidateQueries({ queryKey: ['user-flashcard-stats'] });
    },
    onError: (error) => {
      console.error('Error submitting response:', error);
      toast.error('Erro ao salvar resposta. Tente novamente.');
    }
  });

  // Toggle favorite
  const toggleFavorite = useMutation({
    mutationFn: async (flashcardId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: progress, error: fetchError } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      if (progress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_flashcard_progress')
          .update({ is_favorite: !progress.is_favorite })
          .eq('id', progress.id);
        
        if (error) throw error;
        return !progress.is_favorite;
      } else {
        // Create new progress with favorite
        const { error } = await supabase
          .from('user_flashcard_progress')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            is_favorite: true
          });
        
        if (error) throw error;
        return true;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-flashcards'] });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao atualizar favorito. Tente novamente.');
    }
  });

  // Get monthly usage for free users
  const getMonthlyUsage = () => {
    if (!user?.id) return { current: 0, limit: 50 };
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyUsageKey = `flashcard_monthly_usage_${user.id}_${currentMonth}`;
    const currentUsage = parseInt(localStorage.getItem(monthlyUsageKey) || '0');
    
    return {
      current: currentUsage,
      limit: 50,
      percentage: (currentUsage / 50) * 100
    };
  };

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
    
    // Functions
    startStudySession,
    endStudySession,
    submitResponse,
    toggleFavorite,
    getStudyCards,
    useFavoriteFlashcards,
    refetchDueCards,
    
    // Subscription info
    isActive,
    hasFlashcardLimit: !isActive,
    flashcardLimit: 50,
    getMonthlyUsage,
    
    // Errors
    categoriesError,
    statsError
  };
};
