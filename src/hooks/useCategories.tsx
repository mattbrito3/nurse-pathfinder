import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FlashcardCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
  flashcard_count?: number;
  avg_difficulty?: number;
  user_progress?: {
    studied_count: number;
    mastered_count: number;
  };
}

export const useCategories = () => {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['flashcard-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_categories')
        .select(`
          id,
          name,
          description,
          color,
          icon,
          created_at,
          updated_at
        `)
        .order('name');

      if (error) throw error;
      return data as FlashcardCategory[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    categories,
    categoriesLoading,
    categoriesError,
    refetchCategories
  };
};