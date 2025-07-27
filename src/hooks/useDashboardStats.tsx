/**
 * 📊 DASHBOARD STATS HOOK - Real statistics for dashboard cards
 * Manages calculation history, terms studied, flashcards reviewed, and study streak
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardStats {
  calculationsPerformed: number;
  termsStudied: number;
  flashcardsReviewed: number;
  studyDays: number;
}

export const useDashboardStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Update every 30 seconds
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) {
        return {
          calculationsPerformed: 0,
          termsStudied: 0,
          flashcardsReviewed: 0,
          studyDays: 0
        };
      }

      try {
        // 1. 📊 CÁLCULOS REALIZADOS - Count calculation history entries
        const { data: calculationHistory, error: calcError } = await supabase
          .from('calculation_history')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id);

        if (calcError) {
          console.warn('Error fetching calculation history:', calcError);
        }

        // 2. 📚 TERMOS ESTUDADOS - Count glossary terms viewed/accessed
        // We can estimate this based on flashcard categories studied
        const { data: studiedCategories, error: catError } = await supabase
          .from('user_flashcard_progress')
          .select('flashcard_id')
          .eq('user_id', user.id);

        if (catError) {
          console.warn('Error fetching studied categories:', catError);
        }

        // Get unique categories from flashcards studied
        let uniqueTerms = 0;
        if (studiedCategories && studiedCategories.length > 0) {
          const flashcardIds = studiedCategories.map(p => p.flashcard_id);
          
          const { data: flashcards, error: flashError } = await supabase
            .from('flashcards')
            .select('category_id')
            .in('id', flashcardIds);

          if (!flashError && flashcards) {
            const uniqueCategories = [...new Set(flashcards.map(f => f.category_id))];
            uniqueTerms = uniqueCategories.length;
          }
        }

        // 3. 🃏 FLASHCARDS REVISADOS - Count total flashcard reviews
        const { data: flashcardProgress, error: flashError } = await supabase
          .from('user_flashcard_progress')
          .select('times_seen')
          .eq('user_id', user.id);

        if (flashError) {
          console.warn('Error fetching flashcard progress:', flashError);
        }

        const totalReviews = flashcardProgress?.reduce((sum, p) => sum + (p.times_seen || 0), 0) || 0;

        // 4. 📅 DIAS DE ESTUDO - Count unique study days
        const { data: studySessions, error: sessionError } = await supabase
          .from('flashcard_study_sessions')
          .select('started_at')
          .eq('user_id', user.id);

        if (sessionError) {
          console.warn('Error fetching study sessions:', sessionError);
        }

        // Calculate unique study days
        let uniqueStudyDays = 0;
        if (studySessions && studySessions.length > 0) {
          const studyDates = studySessions.map(session => {
            const date = new Date(session.started_at);
            return date.toDateString(); // Convert to date string to compare days
          });
          
          const uniqueDates = [...new Set(studyDates)];
          uniqueStudyDays = uniqueDates.length;
        }

        // If user has flashcard progress but no sessions recorded, count at least 1 day
        if (uniqueStudyDays === 0 && flashcardProgress && flashcardProgress.length > 0) {
          uniqueStudyDays = 1;
        }

        console.log('📊 Dashboard Stats Calculated:');
        console.log('- Calculations:', calculationHistory?.length || 0);
        console.log('- Terms Studied:', uniqueTerms);
        console.log('- Flashcards Reviewed:', totalReviews);
        console.log('- Study Days:', uniqueStudyDays);

        return {
          calculationsPerformed: calculationHistory?.length || 0,
          termsStudied: uniqueTerms,
          flashcardsReviewed: totalReviews,
          studyDays: uniqueStudyDays
        };

      } catch (error) {
        console.error('Error calculating dashboard stats:', error);
        return {
          calculationsPerformed: 0,
          termsStudied: 0,
          flashcardsReviewed: 0,
          studyDays: 0
        };
      }
    },
    enabled: !!user?.id
  });
};

/**
 * 📈 Hook for formatted dashboard stats display
 */
export const useFormattedDashboardStats = () => {
  const { data: stats, isLoading, error } = useDashboardStats();

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getDescription = (type: keyof DashboardStats, value: number): string => {
    switch (type) {
      case 'calculationsPerformed':
        return value === 0 ? 'Experimente a calculadora!' : 'Cálculos salvos';
      case 'termsStudied':
        return value === 0 ? 'Comece estudando flashcards!' : value === 1 ? 'área estudada' : 'áreas estudadas';
      case 'flashcardsReviewed':
        return value === 0 ? 'Inicie seus estudos!' : value === 1 ? 'flashcard estudado' : 'flashcards estudados';
      case 'studyDays':
        return value === 0 ? 'Comece sua jornada!' : value === 1 ? 'Continue assim!' : 'dias consecutivos!';
      default:
        return '';
    }
  };

  return {
    stats: stats || {
      calculationsPerformed: 0,
      termsStudied: 0,
      flashcardsReviewed: 0,
      studyDays: 0
    },
    isLoading,
    error,
    formatNumber,
    getDescription
  };
};