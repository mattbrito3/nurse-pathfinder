import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { expandedMedicalTerms, medicalCategories } from '@/data/expandedMedicalTerms';

// Tipos
export interface GlossaryCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface MedicalTerm {
  id: string;
  term: string;
  definition: string;
  pronunciation?: string;
  category_id?: string;
  category_name?: string;
  synonyms?: string[];
  related_terms?: string[];
  difficulty_level: 'básico' | 'intermediário' | 'avançado';
  is_favorite?: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  search: string;
  category: string;
  difficulty: string;
  favoritesOnly: boolean;
}

export const useGlossary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    category: '',
    difficulty: '',
    favoritesOnly: false
  });

  // Dados expandidos baseados na nova base de termos
  const categoryColors = [
    '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#06B6D4', 
    '#DC2626', '#6B7280', '#EC4899', '#F97316', '#84CC16', '#3B82F6'
  ];

  const categoryDescriptions: Record<string, string> = {
    'Cardiovascular': 'Sistema circulatório e coração',
    'Respiratório': 'Sistema respiratório e pulmões',
    'Neurológico': 'Sistema nervoso e cérebro',
    'Gastrointestinal': 'Sistema digestivo',
    'Geniturinário': 'Sistema renal e genital',
    'Endócrino': 'Hormônios e metabolismo',
    'Procedimentos': 'Técnicas e procedimentos',
    'Farmacologia': 'Medicamentos e drogas',
    'Sinais Vitais': 'Parâmetros vitais',
    'Emergências': 'Urgência e emergência',
    'Fisiologia': 'Funcionamento do organismo'
  };

  const mockCategories: GlossaryCategory[] = medicalCategories.map((category, index) => ({
    id: (index + 1).toString(),
    name: category,
    description: categoryDescriptions[category] || 'Categoria médica',
    color: categoryColors[index] || '#6B7280',
    created_at: new Date().toISOString()
  }));

  // Converter os termos expandidos para o formato do hook
  const mockTerms: MedicalTerm[] = expandedMedicalTerms.map((term, index) => {
    // Encontrar a categoria correspondente
    const categoryIndex = medicalCategories.findIndex(cat => cat === term.category);
    const categoryId = (categoryIndex + 1).toString();
    
    return {
      id: term.id,
      term: term.term,
      definition: term.definition,
      category_id: categoryId,
      category_name: term.category,
      synonyms: term.synonyms || [],
      related_terms: term.relatedTerms || [],
      difficulty_level: term.difficulty as 'básico' | 'intermediário' | 'avançado',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  });

  // Buscar categorias (usando dados mock por enquanto)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['glossary-categories'],
    queryFn: async () => {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockCategories;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar termos com filtros aplicados
  const { data: terms = [], isLoading: termsLoading } = useQuery({
    queryKey: ['glossary-terms', filters],
    queryFn: async () => {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let filteredTerms = [...mockTerms];

      // Aplicar filtros
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTerms = filteredTerms.filter(term =>
          term.term.toLowerCase().includes(searchLower) ||
          term.definition.toLowerCase().includes(searchLower) ||
          term.synonyms?.some(synonym => synonym.toLowerCase().includes(searchLower)) ||
          term.related_terms?.some(related => related.toLowerCase().includes(searchLower))
        );
      }

      if (filters.category) {
        filteredTerms = filteredTerms.filter(term => term.category_name === filters.category);
      }

      if (filters.difficulty) {
        filteredTerms = filteredTerms.filter(term => term.difficulty_level === filters.difficulty);
      }

      if (filters.favoritesOnly && user) {
        const favorites = getUserFavorites();
        filteredTerms = filteredTerms.filter(term => favorites.includes(term.id));
      }

      return filteredTerms as MedicalTerm[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Função para obter favoritos do usuário
  const getUserFavorites = (): string[] => {
    if (!user) return [];
    
    const stored = localStorage.getItem(`favorites_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  };

  // Buscar favoritos do usuário
  const { data: userFavorites = [] } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: getUserFavorites,
    enabled: !!user,
  });

  // Mutation para alternar favorito
  const { mutate: toggleFavorite, isPending: isToggling } = useMutation({
    mutationFn: async (termId: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const stored = localStorage.getItem(`favorites_${user.id}`);
      let favorites: string[] = stored ? JSON.parse(stored) : [];
      
      if (favorites.includes(termId)) {
        favorites = favorites.filter(id => id !== termId);
        toast({
          title: "Removido dos favoritos",
          description: "Termo removido da sua lista de favoritos."
        });
      } else {
        favorites.push(termId);
        toast({
          title: "Adicionado aos favoritos",
          description: "Termo adicionado à sua lista de favoritos."
        });
      }
      
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
      return favorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível alterar os favoritos.",
        variant: "destructive"
      });
    }
  });

  // Mutation para incrementar uso do termo
  const { mutate: incrementUsage } = useMutation({
    mutationFn: async (termId: string) => {
      // Em produção, isso seria uma chamada para o backend
      console.log(`Incrementando uso do termo: ${termId}`);
    }
  });

  // Funções auxiliares
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      difficulty: '',
      favoritesOnly: false
    });
  };

  // Estatísticas
  const totalTerms = mockTerms.length;
  const favoriteCount = userFavorites.length;
  const categoriesCount = mockCategories.length;

  return {
    // Dados
    categories,
    terms,
    userFavorites,
    filters,
    
    // Estados de loading
    categoriesLoading,
    termsLoading,
    isToggling,
    
    // Ações
    updateFilters,
    clearFilters,
    toggleFavorite,
    incrementUsage,
    
    // Estatísticas
    totalTerms,
    favoriteCount,
    categoriesCount
  };
};