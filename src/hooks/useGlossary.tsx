import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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

  // Dados mock para desenvolvimento (simulando dados do banco)
  const mockCategories: GlossaryCategory[] = [
    { id: '1', name: 'Anatomia', description: 'Termos relacionados à estrutura do corpo humano', color: '#EF4444', created_at: new Date().toISOString() },
    { id: '2', name: 'Fisiologia', description: 'Termos sobre funcionamento dos sistemas corporais', color: '#F59E0B', created_at: new Date().toISOString() },
    { id: '3', name: 'Farmacologia', description: 'Medicamentos e suas ações no organismo', color: '#10B981', created_at: new Date().toISOString() },
    { id: '4', name: 'Patologia', description: 'Doenças e condições médicas', color: '#8B5CF6', created_at: new Date().toISOString() },
    { id: '5', name: 'Procedimentos', description: 'Técnicas e procedimentos de enfermagem', color: '#06B6D4', created_at: new Date().toISOString() },
    { id: '6', name: 'Emergência', description: 'Termos de urgência e emergência', color: '#DC2626', created_at: new Date().toISOString() },
    { id: '7', name: 'Materiais', description: 'Equipamentos e materiais hospitalares', color: '#6B7280', created_at: new Date().toISOString() },
    { id: '8', name: 'Sinais Vitais', description: 'Parâmetros de avaliação do paciente', color: '#EC4899', created_at: new Date().toISOString() },
  ];

  const mockTerms: MedicalTerm[] = [
    // Anatomia
    {
      id: '1',
      term: 'Aorta',
      definition: 'Maior artéria do corpo humano, que transporta sangue oxigenado do coração para todo o organismo.',
      pronunciation: 'a-OR-ta',
      category_id: '1',
      category_name: 'Anatomia',
      synonyms: ['artéria principal'],
      related_terms: ['ventrículo esquerdo', 'circulação sistêmica'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      term: 'Átrio',
      definition: 'Cada uma das duas cavidades superiores do coração que recebem o sangue.',
      pronunciation: 'Á-trio',
      category_id: '1',
      category_name: 'Anatomia',
      synonyms: ['aurícula'],
      related_terms: ['ventrículo', 'coração', 'válvula'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      term: 'Ventrículo',
      definition: 'Cada uma das duas cavidades inferiores do coração responsáveis por bombear o sangue.',
      pronunciation: 'ven-TRÍ-cu-lo',
      category_id: '1',
      category_name: 'Anatomia',
      synonyms: [],
      related_terms: ['átrio', 'coração', 'sístole'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Fisiologia
    {
      id: '4',
      term: 'Homeostase',
      definition: 'Capacidade do organismo de manter o equilíbrio interno apesar das variações do ambiente externo.',
      pronunciation: 'ho-me-os-TA-se',
      category_id: '2',
      category_name: 'Fisiologia',
      synonyms: ['equilíbrio fisiológico'],
      related_terms: ['metabolismo', 'regulação'],
      difficulty_level: 'intermediário',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      term: 'Sístole',
      definition: 'Fase de contração do coração em que o sangue é bombeado para fora dos ventrículos.',
      pronunciation: 'SÍS-to-le',
      category_id: '2',
      category_name: 'Fisiologia',
      synonyms: ['contração cardíaca'],
      related_terms: ['diástole', 'pressão arterial'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      term: 'Diástole',
      definition: 'Fase de relaxamento do coração em que os ventrículos se enchem de sangue.',
      pronunciation: 'di-ÁS-to-le',
      category_id: '2',
      category_name: 'Fisiologia',
      synonyms: ['relaxamento cardíaco'],
      related_terms: ['sístole', 'pressão arterial'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Farmacologia
    {
      id: '7',
      term: 'Analgésico',
      definition: 'Medicamento usado para alívio da dor sem causar perda de consciência.',
      pronunciation: 'a-nal-GÉ-si-co',
      category_id: '3',
      category_name: 'Farmacologia',
      synonyms: ['medicamento para dor'],
      related_terms: ['anti-inflamatório', 'opioide'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '8',
      term: 'Antibiótico',
      definition: 'Medicamento que combate infecções causadas por bactérias.',
      pronunciation: 'an-ti-bi-Ó-ti-co',
      category_id: '3',
      category_name: 'Farmacologia',
      synonyms: ['antimicrobiano'],
      related_terms: ['infecção', 'resistência bacteriana'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Patologia
    {
      id: '9',
      term: 'Hipertensão',
      definition: 'Condição caracterizada pela elevação persistente da pressão arterial.',
      pronunciation: 'hi-per-ten-SÃO',
      category_id: '4',
      category_name: 'Patologia',
      synonyms: ['pressão alta'],
      related_terms: ['pressão arterial', 'cardiovascular'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10',
      term: 'Diabetes',
      definition: 'Doença caracterizada por níveis elevados de glicose no sangue devido à deficiência ou resistência à insulina.',
      pronunciation: 'di-a-BE-tes',
      category_id: '4',
      category_name: 'Patologia',
      synonyms: ['diabetes mellitus'],
      related_terms: ['glicemia', 'insulina', 'glicose'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Sinais Vitais
    {
      id: '11',
      term: 'Pressão Arterial',
      definition: 'Força exercida pelo sangue contra as paredes das artérias durante a circulação.',
      pronunciation: 'pres-SÃO ar-te-ri-AL',
      category_id: '8',
      category_name: 'Sinais Vitais',
      synonyms: ['PA'],
      related_terms: ['sístole', 'diástole', 'hipertensão'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '12',
      term: 'Frequência Cardíaca',
      definition: 'Número de batimentos cardíacos por minuto.',
      pronunciation: 'fre-QUÊN-ci-a car-DÍ-a-ca',
      category_id: '8',
      category_name: 'Sinais Vitais',
      synonyms: ['FC', 'pulso'],
      related_terms: ['ritmo cardíaco', 'taquicardia'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '13',
      term: 'Temperatura',
      definition: 'Medida do calor corporal, indicador importante do estado de saúde.',
      pronunciation: 'tem-pe-ra-TU-ra',
      category_id: '8',
      category_name: 'Sinais Vitais',
      synonyms: ['febre'],
      related_terms: ['hipotermia', 'hipertermia'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '14',
      term: 'Taquicardia',
      definition: 'Aumento da frequência cardíaca acima dos valores normais (>100 bpm em adultos).',
      pronunciation: 'ta-qui-car-DI-a',
      category_id: '8',
      category_name: 'Sinais Vitais',
      synonyms: [],
      related_terms: ['frequência cardíaca', 'bradicardia'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '15',
      term: 'Bradicardia',
      definition: 'Diminuição da frequência cardíaca abaixo dos valores normais (<60 bpm em adultos).',
      pronunciation: 'bra-di-car-DI-a',
      category_id: '8',
      category_name: 'Sinais Vitais',
      synonyms: [],
      related_terms: ['frequência cardíaca', 'taquicardia'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Procedimentos
    {
      id: '16',
      term: 'Punção Venosa',
      definition: 'Procedimento de inserção de agulha ou cateter em uma veia para coleta de sangue ou administração de medicamentos.',
      pronunciation: 'pun-ÇÃO ve-NO-sa',
      category_id: '5',
      category_name: 'Procedimentos',
      synonyms: ['acesso venoso'],
      related_terms: ['cateter', 'flebotomia'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Materiais
    {
      id: '17',
      term: 'Estetoscópio',
      definition: 'Instrumento usado para auscultar sons internos do corpo, especialmente do coração e pulmões.',
      pronunciation: 'es-te-tos-CÓ-pi-o',
      category_id: '7',
      category_name: 'Materiais',
      synonyms: [],
      related_terms: ['ausculta', 'sinais vitais'],
      difficulty_level: 'básico',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Emergência
    {
      id: '18',
      term: 'RCP',
      definition: 'Ressuscitação Cardiopulmonar - conjunto de manobras para reverter parada cardiorrespiratória.',
      pronunciation: 'RCP',
      category_id: '6',
      category_name: 'Emergência',
      synonyms: ['ressuscitação cardiopulmonar'],
      related_terms: ['parada cardíaca', 'compressões torácicas'],
      difficulty_level: 'avançado',
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Buscar categorias (usando dados mock por enquanto)
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['glossary-categories'],
    queryFn: async () => {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockCategories;
    }
  });

  // Buscar termos médicos (usando dados mock por enquanto)
  const { data: terms = [], isLoading: termsLoading, refetch: refetchTerms } = useQuery({
    queryKey: ['medical-terms', filters],
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
          false
        );
      }

      if (filters.category && filters.category !== 'all') {
        filteredTerms = filteredTerms.filter(term => term.category_name === filters.category);
      }

      if (filters.difficulty && filters.difficulty !== 'all') {
        filteredTerms = filteredTerms.filter(term => term.difficulty_level === filters.difficulty);
      }

      // Ordenar por termo
      filteredTerms.sort((a, b) => a.term.localeCompare(b.term));
      
      return filteredTerms as MedicalTerm[];
    }
  });

  // Buscar favoritos do usuário (usando localStorage por enquanto)
  const { data: userFavorites = [] } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const stored = localStorage.getItem(`favorites_${user.id}`);
      return stored ? JSON.parse(stored) : [];
    },
    enabled: !!user
  });

  // Adicionar/remover favorito (usando localStorage por enquanto)
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ termId, isFavorite }: { termId: string; isFavorite: boolean }) => {
      if (!user) throw new Error('Usuário não logado');

      const stored = localStorage.getItem(`favorites_${user.id}`);
      let favorites: string[] = stored ? JSON.parse(stored) : [];

      if (isFavorite) {
        // Remover favorito
        favorites = favorites.filter(id => id !== termId);
      } else {
        // Adicionar favorito
        favorites.push(termId);
      }

      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
      return favorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast({
        title: "Favorito atualizado",
        description: "Sua lista de favoritos foi atualizada.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
      console.error('Erro ao atualizar favorito:', error);
    }
  });

  // Incrementar contador de uso (mock por enquanto)
  const incrementUsageMutation = useMutation({
    mutationFn: async (termId: string) => {
      // Simular incremento de uso
      console.log('Termo visualizado:', termId);
      return true;
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

  const toggleFavorite = (termId: string) => {
    const isFavorite = userFavorites.includes(termId);
    toggleFavoriteMutation.mutate({ termId, isFavorite });
  };

  const incrementUsage = (termId: string) => {
    incrementUsageMutation.mutate(termId);
  };

  // Filtrar termos por favoritos se necessário
  const filteredTerms = filters.favoritesOnly 
    ? terms.filter(term => userFavorites.includes(term.id))
    : terms;

  return {
    // Dados
    categories,
    terms: filteredTerms,
    userFavorites,
    filters,
    
    // Estados de carregamento
    categoriesLoading,
    termsLoading,
    isToggling: toggleFavoriteMutation.isPending,
    
    // Funções
    updateFilters,
    clearFilters,
    toggleFavorite,
    incrementUsage,
    refetchTerms,
    
    // Estatísticas
    totalTerms: terms.length,
    favoriteCount: userFavorites.length,
    categoriesCount: categories.length
  };
};