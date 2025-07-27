import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AnalyticsData {
  // Weekly progress
  weeklyProgress: {
    day: string;
    flashcards: number;
    accuracy: number;
    timeSpent: number;
  }[];
  
  // Category stats
  categoryStats: {
    name: string;
    studied: number;
    mastered: number;
    accuracy: number;
    color: string;
  }[];
  
  // Mastery distribution
  masteryDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  
  // Study streak (30 days)
  studyStreak: {
    date: string;
    studied: number;
  }[];
  
  // Overall stats
  overallStats: {
    totalFlashcards: number;
    masteredCards: number;
    totalReviews: number;
    accuracy: number;
    currentStreak: number;
    longestStreak: number;
    averageDaily: number;
  };
}

export const useAnalytics = () => {
  const { user } = useAuth();

  // Get overall statistics
  const {
    data: overallStats,
    isLoading: overallStatsLoading
  } = useQuery({
    queryKey: ['analytics-overall-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get progress data
      const { data: progressData, error: progressError } = await supabase
        .from('user_flashcard_progress')
        .select('mastery_level, times_seen, times_correct, times_incorrect, last_reviewed_at')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Get session data for streak calculation
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('flashcard_study_sessions')
        .select('started_at, cards_studied')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      const totalCards = progressData.length;
      const masteredCards = progressData.filter(p => p.mastery_level >= 5).length;
      const totalReviews = progressData.reduce((sum, p) => sum + p.times_seen, 0);
      const totalCorrect = progressData.reduce((sum, p) => sum + p.times_correct, 0);
      const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

      // Calculate streaks
      const today = new Date();
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return date.toDateString();
      }).reverse();

      const studyDates = sessionsData
        .map(session => new Date(session.started_at).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index);

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      // Calculate current streak (from today backwards)
      for (let i = dates.length - 1; i >= 0; i--) {
        if (studyDates.includes(dates[i])) {
          if (i === dates.length - 1 || currentStreak > 0) {
            currentStreak++;
          }
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          if (i === dates.length - 1) {
            currentStreak = 0;
          }
          tempStreak = 0;
        }
      }

      // Calculate average daily
      const daysWithData = Math.min(30, dates.length);
      const averageDaily = daysWithData > 0 ? Math.round(totalReviews / daysWithData) : 0;

      return {
        totalFlashcards: totalCards,
        masteredCards,
        totalReviews,
        accuracy,
        currentStreak,
        longestStreak,
        averageDaily
      };
    },
    enabled: !!user?.id
  });

  // Get weekly progress data
  const {
    data: weeklyProgress,
    isLoading: weeklyProgressLoading
  } = useQuery({
    queryKey: ['analytics-weekly-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date();
      const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          dayName: weekDays[date.getDay()]
        };
      });

      // Get sessions for the last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('flashcard_study_sessions')
        .select('started_at, cards_studied, cards_correct, total_time_seconds')
        .eq('user_id', user.id)
        .gte('started_at', weekAgo.toISOString())
        .order('started_at');

      if (sessionsError) throw sessionsError;

      // Group by day
      const weeklyData = last7Days.map(({ date, dayName }) => {
        const daySessions = sessionsData.filter(session => 
          session.started_at.split('T')[0] === date
        );

        const flashcards = daySessions.reduce((sum, session) => sum + (session.cards_studied || 0), 0);
        const correct = daySessions.reduce((sum, session) => sum + (session.cards_correct || 0), 0);
        const timeSpent = Math.round(daySessions.reduce((sum, session) => sum + (session.total_time_seconds || 0), 0) / 60);
        const accuracy = flashcards > 0 ? Math.round((correct / flashcards) * 100) : 0;

        return {
          day: dayName,
          flashcards,
          accuracy,
          timeSpent
        };
      });

      return weeklyData;
    },
    enabled: !!user?.id
  });

  // Get category statistics
  const {
    data: categoryStats,
    isLoading: categoryStatsLoading
  } = useQuery({
    queryKey: ['analytics-category-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get categories with colors
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('flashcard_categories')
        .select('id, name, color');

      if (categoriesError) throw categoriesError;

      // Get flashcards with progress
      const { data: flashcardsData, error: flashcardsError } = await supabase
        .from('flashcards')
        .select(`
          id, 
          category_id,
          user_flashcard_progress!inner(mastery_level, times_seen, times_correct, times_incorrect)
        `)
        .eq('user_flashcard_progress.user_id', user.id);

      if (flashcardsError) throw flashcardsError;

      // Group by category
      const categoryStats = categoriesData.map(category => {
        const categoryFlashcards = flashcardsData.filter(f => f.category_id === category.id);
        
        const studied = categoryFlashcards.length;
        const mastered = categoryFlashcards.filter(f => 
          f.user_flashcard_progress?.[0]?.mastery_level >= 5
        ).length;
        
        const totalReviews = categoryFlashcards.reduce((sum, f) => 
          sum + (f.user_flashcard_progress?.[0]?.times_seen || 0), 0
        );
        const totalCorrect = categoryFlashcards.reduce((sum, f) => 
          sum + (f.user_flashcard_progress?.[0]?.times_correct || 0), 0
        );
        
        const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

        return {
          name: category.name,
          studied,
          mastered,
          accuracy,
          color: category.color
        };
      }).filter(stat => stat.studied > 0); // Only show categories with progress

      return categoryStats;
    },
    enabled: !!user?.id
  });

  // Get mastery distribution
  const {
    data: masteryDistribution,
    isLoading: masteryDistributionLoading
  } = useQuery({
    queryKey: ['analytics-mastery-distribution', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: progressData, error } = await supabase
        .from('user_flashcard_progress')
        .select('mastery_level')
        .eq('user_id', user.id);

      if (error) throw error;

      const masteryLevels = [
        { name: 'Novo', level: 0, color: '#ef4444' },
        { name: 'Iniciante', level: 1, color: '#f97316' },
        { name: 'Básico', level: 2, color: '#eab308' },
        { name: 'Intermediário', level: 3, color: '#22c55e' },
        { name: 'Avançado', level: 4, color: '#3b82f6' },
        { name: 'Dominado', level: 5, color: '#8b5cf6' }
      ];

      const distribution = masteryLevels.map(level => ({
        name: level.name,
        value: progressData.filter(p => p.mastery_level === level.level).length,
        color: level.color
      })).filter(item => item.value > 0);

      return distribution;
    },
    enabled: !!user?.id
  });

  // Get study streak data (30 days)
  const {
    data: studyStreak,
    isLoading: studyStreakLoading
  } = useQuery({
    queryKey: ['analytics-study-streak', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessionsData, error } = await supabase
        .from('flashcard_study_sessions')
        .select('started_at, cards_studied')
        .eq('user_id', user.id)
        .gte('started_at', thirtyDaysAgo.toISOString())
        .order('started_at');

      if (error) throw error;

      // Create array of last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          dateKey: date.toISOString().split('T')[0]
        };
      });

      // Group sessions by date
      const streakData = last30Days.map(({ date, dateKey }) => {
        const daySessions = sessionsData.filter(session => 
          session.started_at.split('T')[0] === dateKey
        );

        const studied = daySessions.reduce((sum, session) => sum + (session.cards_studied || 0), 0);

        return {
          date,
          studied
        };
      });

      return streakData;
    },
    enabled: !!user?.id
  });

  return {
    overallStats,
    weeklyProgress: weeklyProgress || [],
    categoryStats: categoryStats || [],
    masteryDistribution: masteryDistribution || [],
    studyStreak: studyStreak || [],
    
    // Loading states
    isLoading: overallStatsLoading || weeklyProgressLoading || categoryStatsLoading || 
               masteryDistributionLoading || studyStreakLoading
  };
};