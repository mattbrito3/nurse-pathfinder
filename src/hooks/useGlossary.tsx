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

  // Verificar se a tabela user_favorite_terms existe
  const checkFavoritesTableExists = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_favorite_terms')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.log('Tabela user_favorite_terms não existe ainda:', error);
      return false;
    }
  };

  // Verificar se estamos usando dados mock (IDs não são UUIDs)
  const isUsingMockData = (): boolean => {
    return mockTerms.length > 0 && !mockTerms[0].id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  };

  // Para dados mock, usar localStorage com chave específica para mock data
  const getMockFavoritesKey = (): string => {
    return user ? `mock_glossary_favorites_${user.id}` : 'mock_glossary_favorites_anonymous';
  };

  // Migrar favoritos do localStorage para o banco de dados (apenas para dados reais)
  const migrateFavoritesToDatabase = async (): Promise<void> => {
    if (!user || isUsingMockData()) return;

    try {
      const stored = localStorage.getItem(`favorites_${user.id}`);
      if (!stored) return;

      const localFavorites: string[] = JSON.parse(stored);
      if (localFavorites.length === 0) return;

      console.log(`Migrando ${localFavorites.length} favoritos do localStorage para o banco...`);

      // Verificar quais favoritos já existem no banco
      const { data: existingFavorites } = await supabase
        .from('user_favorite_terms')
        .select('term_id')
        .eq('user_id', user.id);

      const existingTermIds = existingFavorites?.map(f => f.term_id) || [];
      
      // Filtrar apenas os favoritos que não existem no banco e são UUIDs válidos
      const favoritesToInsert = localFavorites
        .filter(termId => !existingTermIds.includes(termId))
        .filter(termId => termId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))
        .map(termId => ({
          user_id: user.id,
          term_id: termId
        }));

      if (favoritesToInsert.length > 0) {
        const { error } = await supabase
          .from('user_favorite_terms')
          .insert(favoritesToInsert);

        if (error) {
          console.error('Erro ao migrar favoritos:', error);
          throw error;
        }

        console.log(`${favoritesToInsert.length} favoritos migrados com sucesso!`);
      }

      // Remover do localStorage após migração bem-sucedida
      localStorage.removeItem(`favorites_${user.id}`);
      console.log('LocalStorage de favoritos limpo após migração');

    } catch (error) {
      console.error('Erro na migração de favoritos:', error);
      // Manter dados no localStorage em caso de erro
    }
  };

  // Buscar favoritos do usuário do banco de dados (apenas para dados reais)
  const getUserFavoritesFromDB = async (): Promise<string[]> => {
    if (!user) return [];

    // Se estamos usando dados mock, usar localStorage
    if (isUsingMockData()) {
      return getUserFavoritesFromLocalStorage();
    }

    try {
      const tableExists = await checkFavoritesTableExists();
      if (!tableExists) {
        console.log('Tabela user_favorite_terms não existe, usando localStorage como fallback');
        return getUserFavoritesFromLocalStorage();
      }

      const { data, error } = await supabase
        .from('user_favorite_terms')
        .select('term_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao buscar favoritos do banco:', error);
        return getUserFavoritesFromLocalStorage();
      }

      const favorites = data?.map(f => f.term_id) || [];
      
      // Migrar dados do localStorage se o banco estiver vazio mas houver dados locais
      if (favorites.length === 0) {
        await migrateFavoritesToDatabase();
        // Buscar novamente após migração
        const { data: newData } = await supabase
          .from('user_favorite_terms')
          .select('term_id')
          .eq('user_id', user.id);
        return newData?.map(f => f.term_id) || [];
      }

      return favorites;
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return getUserFavoritesFromLocalStorage();
    }
  };

  // Fallback para localStorage
  const getUserFavoritesFromLocalStorage = (): string[] => {
    if (!user) return [];
    
    // Para dados mock, usar chave específica
    if (isUsingMockData()) {
      const stored = localStorage.getItem(getMockFavoritesKey());
      return stored ? JSON.parse(stored) : [];
    }
    
    // Para dados reais, usar chave original
    const stored = localStorage.getItem(`favorites_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  };

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

  // Buscar favoritos do usuário
  const { data: userFavorites = [] } = useQuery({
    queryKey: ['user-favorites', user?.id, isUsingMockData()],
    queryFn: getUserFavoritesFromDB,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Buscar termos com filtros aplicados
  const { data: terms = [], isLoading: termsLoading } = useQuery({
    queryKey: ['glossary-terms', filters, userFavorites],
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
        filteredTerms = filteredTerms.filter(term => userFavorites.includes(term.id));
      }

      return filteredTerms as MedicalTerm[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para alternar favorito
  const { mutate: toggleFavorite, isPending: isToggling } = useMutation({
    mutationFn: async (termId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const isCurrentlyFavorite = userFavorites.includes(termId);
      const usingMockData = isUsingMockData();

      if (usingMockData) {
        // Para dados mock, usar localStorage com chave específica
        console.log('Usando localStorage para dados mock');
        const storageKey = getMockFavoritesKey();
        const stored = localStorage.getItem(storageKey);
        let favorites: string[] = stored ? JSON.parse(stored) : [];
        
        if (isCurrentlyFavorite) {
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
        
        localStorage.setItem(storageKey, JSON.stringify(favorites));
        return termId;
      }

      // Para dados reais, usar banco de dados
      const tableExists = await checkFavoritesTableExists();

      if (tableExists) {
        // Usar banco de dados
        try {
          if (isCurrentlyFavorite) {
            // Remover favorito
            const { error } = await supabase
              .from('user_favorite_terms')
              .delete()
              .eq('user_id', user.id)
              .eq('term_id', termId);

            if (error) throw error;

            toast({
              title: "Removido dos favoritos",
              description: "Termo removido da sua lista de favoritos."
            });
          } else {
            // Adicionar favorito
            const { error } = await supabase
              .from('user_favorite_terms')
              .insert({
                user_id: user.id,
                term_id: termId
              });

            if (error) throw error;

            toast({
              title: "Adicionado aos favoritos",
              description: "Termo adicionado à sua lista de favoritos."
            });
          }
        } catch (error) {
          console.error('Erro ao alterar favorito no banco:', error);
          throw error;
        }
      } else {
        // Fallback para localStorage
        console.log('Usando localStorage como fallback para favoritos');
        const stored = localStorage.getItem(`favorites_${user.id}`);
        let favorites: string[] = stored ? JSON.parse(stored) : [];
        
        if (isCurrentlyFavorite) {
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
      }

      return termId;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['glossary-terms'] });
    },
    onError: (error) => {
      console.error('Erro ao alterar favoritos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar os favoritos. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutation para incrementar uso do termo
  const { mutate: incrementUsage } = useMutation({
    mutationFn: async (termId: string) => {
      try {
        // Para dados mock, apenas log
        if (isUsingMockData()) {
          console.log(`Incrementando uso do termo mock: ${termId}`);
          return;
        }

        // Para dados reais, usar função RPC
        const { error } = await supabase.rpc('increment_term_usage', {
          term_id: termId
        });

        if (error) {
          console.log('Função increment_term_usage não encontrada, usando log:', error);
          console.log(`Incrementando uso do termo: ${termId}`);
        }
      } catch (error) {
        console.log(`Incrementando uso do termo: ${termId}`);
      }
    }
  });

  // Efeito para migrar dados na inicialização (apenas para dados reais)
  useEffect(() => {
    if (user && !isUsingMockData()) {
      // Verificar e migrar dados do localStorage para o banco
      migrateFavoritesToDatabase().catch(console.error);
    }
  }, [user]);

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