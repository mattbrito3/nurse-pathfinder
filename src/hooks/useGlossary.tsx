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

  // Dados fallback (mock) se banco não estiver disponível
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

  // Converter os termos expandidos para o formato do hook (fallback)
  const mockTerms: MedicalTerm[] = expandedMedicalTerms.map((term, index) => {
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

  // Verificar se as tabelas do glossário existem e têm dados
  const checkGlossaryTablesExist = async (): Promise<boolean> => {
    try {
      const { data: categories, error: categoriesError } = await supabase
        .from('glossary_categories')
        .select('id')
        .limit(1);

      const { data: terms, error: termsError } = await supabase
        .from('medical_terms')
        .select('id')
        .limit(1);

      return !categoriesError && !termsError && categories && terms && categories.length > 0 && terms.length > 0;
    } catch (error) {
      console.log('Tabelas do glossário não existem ou estão vazias:', error);
      return false;
    }
  };

  // Verificar se estamos usando dados reais do banco
  const [usingRealData, setUsingRealData] = useState<boolean | null>(null);

  useEffect(() => {
    checkGlossaryTablesExist().then(exists => {
      setUsingRealData(exists);
      if (exists) {
        console.log('✅ Usando dados reais do banco de dados');
      } else {
        console.log('⚠️ Usando dados mock como fallback');
      }
    });
  }, []);

  // Para dados mock, usar localStorage com chave específica para mock data
  const getMockFavoritesKey = (): string => {
    return user ? `mock_glossary_favorites_${user.id}` : 'mock_glossary_favorites_anonymous';
  };

  // Migrar favoritos do localStorage para o banco de dados (apenas para dados reais)
  const migrateFavoritesToDatabase = async (): Promise<void> => {
    if (!user || !usingRealData) return;

    try {
      const stored = localStorage.getItem(`favorites_${user.id}`);
      const mockStored = localStorage.getItem(getMockFavoritesKey());
      
      if (!stored && !mockStored) return;

      const localFavorites: string[] = stored ? JSON.parse(stored) : [];
      const mockFavorites: string[] = mockStored ? JSON.parse(mockStored) : [];
      const allLocalFavorites = [...localFavorites, ...mockFavorites];

      if (allLocalFavorites.length === 0) return;

      console.log(`Migrando ${allLocalFavorites.length} favoritos do localStorage para o banco...`);

      // Verificar quais favoritos já existem no banco
      const { data: existingFavorites } = await supabase
        .from('user_favorite_terms')
        .select('term_id')
        .eq('user_id', user.id);

      const existingTermIds = existingFavorites?.map(f => f.term_id) || [];
      
      // Filtrar apenas os favoritos que não existem no banco e são UUIDs válidos
      const favoritesToInsert = allLocalFavorites
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
      if (stored) localStorage.removeItem(`favorites_${user.id}`);
      if (mockStored) localStorage.removeItem(getMockFavoritesKey());
      console.log('LocalStorage de favoritos limpo após migração');

    } catch (error) {
      console.error('Erro na migração de favoritos:', error);
      // Manter dados no localStorage em caso de erro
    }
  };

  // Buscar favoritos do usuário do banco de dados (para dados reais) ou localStorage (para mock)
  const getUserFavoritesFromDB = async (): Promise<string[]> => {
    if (!user) return [];

    // Se estamos usando dados mock, usar localStorage
    if (usingRealData === false) {
      return getUserFavoritesFromLocalStorage();
    }

    // Se ainda estamos verificando, aguardar
    if (usingRealData === null) {
      return [];
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
    if (usingRealData === false) {
      const stored = localStorage.getItem(getMockFavoritesKey());
      return stored ? JSON.parse(stored) : [];
    }
    
    // Para dados reais, usar chave original
    const stored = localStorage.getItem(`favorites_${user.id}`);
    return stored ? JSON.parse(stored) : [];
  };

  // Buscar categorias do banco ou fallback para mock
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['glossary-categories', usingRealData],
    queryFn: async () => {
      if (usingRealData === null) {
        // Ainda verificando, retornar vazio
        return [];
      }

      if (usingRealData === false) {
        // Usar dados mock
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockCategories;
      }

      try {
        // Tentar buscar do banco
        const { data, error } = await supabase
          .from('glossary_categories')
          .select('*')
          .order('name');

        if (error) throw error;

        return data?.map(cat => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          color: cat.color,
          created_at: cat.created_at
        })) || [];
      } catch (error) {
        console.error('Erro ao buscar categorias, usando fallback:', error);
        return mockCategories;
      }
    },
    enabled: usingRealData !== null,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar favoritos do usuário
  const { data: userFavorites = [] } = useQuery({
    queryKey: ['user-favorites', user?.id, usingRealData],
    queryFn: getUserFavoritesFromDB,
    enabled: !!user && usingRealData !== null,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Buscar termos do banco ou fallback para mock
  const { data: allTerms = [], isLoading: termsLoadingRaw } = useQuery({
    queryKey: ['glossary-terms-raw', usingRealData],
    queryFn: async () => {
      if (usingRealData === null) {
        // Ainda verificando
        return [];
      }

      if (usingRealData === false) {
        // Usar dados mock
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockTerms;
      }

      try {
        // Buscar do banco
        const { data, error } = await supabase
          .from('medical_terms')
          .select(`
            id,
            term,
            definition,
            pronunciation,
            category_id,
            synonyms,
            related_terms,
            difficulty_level,
            usage_count,
            created_at,
            updated_at,
            glossary_categories!inner(name)
          `)
          .order('term');

        if (error) throw error;

        return data?.map(term => ({
          id: term.id,
          term: term.term,
          definition: term.definition,
          pronunciation: term.pronunciation,
          category_id: term.category_id,
          category_name: term.glossary_categories?.name,
          synonyms: term.synonyms || [],
          related_terms: term.related_terms || [],
          difficulty_level: term.difficulty_level as 'básico' | 'intermediário' | 'avançado',
          usage_count: term.usage_count || 0,
          created_at: term.created_at,
          updated_at: term.updated_at
        })) || [];
      } catch (error) {
        console.error('Erro ao buscar termos, usando fallback:', error);
        return mockTerms;
      }
    },
    enabled: usingRealData !== null,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Aplicar filtros aos termos
  const { data: terms = [], isLoading: termsLoading } = useQuery({
    queryKey: ['glossary-terms-filtered', filters, userFavorites, allTerms],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      let filteredTerms = [...allTerms];

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
    enabled: allTerms.length > 0,
    staleTime: 1 * 60 * 1000, // 1 minuto
  });

  // Mutation para alternar favorito
  const { mutate: toggleFavorite, isPending: isToggling } = useMutation({
    mutationFn: async (termId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const isCurrentlyFavorite = userFavorites.includes(termId);

      if (usingRealData) {
        // Usar banco de dados
        const tableExists = await checkFavoritesTableExists();

        if (tableExists) {
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
        }
      } else {
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
      }

      return termId;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['glossary-terms-filtered'] });
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
        if (!usingRealData) {
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
    if (user && usingRealData === true) {
      // Verificar e migrar dados do localStorage para o banco
      migrateFavoritesToDatabase().catch(console.error);
    }
  }, [user, usingRealData]);

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
  const totalTerms = allTerms.length;
  const favoriteCount = userFavorites.length;
  const categoriesCount = categories.length;

  return {
    // Dados
    categories,
    terms,
    userFavorites,
    filters,
    
    // Estados de loading
    categoriesLoading,
    termsLoading: termsLoadingRaw || termsLoading,
    isToggling,
    
    // Ações
    updateFilters,
    clearFilters,
    toggleFavorite,
    incrementUsage,
    
    // Estatísticas
    totalTerms,
    favoriteCount,
    categoriesCount,
    
    // Status
    usingRealData
  };
};