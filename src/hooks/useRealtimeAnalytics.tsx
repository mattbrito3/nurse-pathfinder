import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useRealtimeAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to changes in flashcard_study_sessions table
    const sessionChannel = supabase
      .channel('flashcard_study_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'flashcard_study_sessions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Mudança detectada na sessão:', payload);
          
          // Invalidate analytics queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['analytics-overall-stats'] });
          queryClient.invalidateQueries({ queryKey: ['analytics-weekly-progress'] });
          queryClient.invalidateQueries({ queryKey: ['analytics-study-streak'] });
        }
      )
      .subscribe();

    // Subscribe to changes in user_flashcard_progress table
    const progressChannel = supabase
      .channel('user_flashcard_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_flashcard_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📊 Mudança detectada no progresso:', payload);
          
          // Invalidate analytics queries that depend on progress
          queryClient.invalidateQueries({ queryKey: ['analytics-overall-stats'] });
          queryClient.invalidateQueries({ queryKey: ['analytics-category-stats'] });
          queryClient.invalidateQueries({ queryKey: ['analytics-mastery-distribution'] });
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🧹 Limpando subscriptions do Analytics');
      supabase.removeChannel(sessionChannel);
      supabase.removeChannel(progressChannel);
    };
  }, [user?.id, queryClient]);

  return {
    // This hook doesn't return data, it just manages subscriptions
    isSubscribed: !!user?.id
  };
};