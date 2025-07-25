import { supabase } from '@/integrations/supabase/client';

// Executar inicialização de dados do glossário médico
export const runGlossaryMigrations = async () => {
  try {
    console.log('🔄 Inicializando dados do glossário médico...');

    // 1. Verificar se já existem dados
    const { data: existingCategories } = await supabase
      .from('glossary_categories' as any)
      .select('id')
      .limit(1);

    if (!existingCategories || existingCategories.length === 0) {
      console.log('📝 Inserindo categorias iniciais...');
      
      // 2. Inserir categorias
      const { error: categoriesError } = await supabase
      .from('glossary_categories' as any)
      .insert([
        { name: 'Anatomia', description: 'Termos relacionados à estrutura do corpo humano', color: '#EF4444' },
        { name: 'Fisiologia', description: 'Termos sobre funcionamento dos sistemas corporais', color: '#F59E0B' },
        { name: 'Farmacologia', description: 'Medicamentos e suas ações no organismo', color: '#10B981' },
        { name: 'Patologia', description: 'Doenças e condições médicas', color: '#8B5CF6' },
        { name: 'Procedimentos', description: 'Técnicas e procedimentos de enfermagem', color: '#06B6D4' },
        { name: 'Emergência', description: 'Termos de urgência e emergência', color: '#DC2626' },
        { name: 'Materiais', description: 'Equipamentos e materiais hospitalares', color: '#6B7280' },
        { name: 'Sinais Vitais', description: 'Parâmetros de avaliação do paciente', color: '#EC4899' }
      ] as any);

      if (categoriesError) {
        console.error('Erro ao inserir categorias:', categoriesError);
        return false;
      }

      console.log('✅ Categorias inseridas');

      // 3. Buscar categorias para obter IDs
      const { data: categories } = await supabase
        .from('glossary_categories' as any)
        .select('id, name');

      if (!categories) {
        console.error('Erro ao buscar categorias');
        return false;
      }

      // 4. Inserir termos médicos básicos
      const anatomiaId = categories.find(c => c.name === 'Anatomia')?.id;
      const fisiologiaId = categories.find(c => c.name === 'Fisiologia')?.id;
      const farmacologiaId = categories.find(c => c.name === 'Farmacologia')?.id;
      const patologiaId = categories.find(c => c.name === 'Patologia')?.id;
      const procedimentosId = categories.find(c => c.name === 'Procedimentos')?.id;
      const emergenciaId = categories.find(c => c.name === 'Emergência')?.id;
      const materiaisId = categories.find(c => c.name === 'Materiais')?.id;
      const sinaisVitaisId = categories.find(c => c.name === 'Sinais Vitais')?.id;

      const terms = [
        // Anatomia
        {
          term: 'Aorta',
          definition: 'Maior artéria do corpo humano, que transporta sangue oxigenado do coração para todo o organismo.',
          pronunciation: 'a-OR-ta',
          category_id: anatomiaId,
          synonyms: ['artéria principal'],
          related_terms: ['ventrículo esquerdo', 'circulação sistêmica'],
          difficulty_level: 'básico'
        },
        {
          term: 'Átrio',
          definition: 'Cada uma das duas cavidades superiores do coração que recebem o sangue.',
          pronunciation: 'Á-trio',
          category_id: anatomiaId,
          synonyms: ['aurícula'],
          related_terms: ['ventrículo', 'coração', 'válvula'],
          difficulty_level: 'básico'
        },
        {
          term: 'Ventrículo',
          definition: 'Cada uma das duas cavidades inferiores do coração responsáveis por bombear o sangue.',
          pronunciation: 'ven-TRÍ-cu-lo',
          category_id: anatomiaId,
          synonyms: [],
          related_terms: ['átrio', 'coração', 'sístole'],
          difficulty_level: 'básico'
        },

        // Fisiologia
        {
          term: 'Homeostase',
          definition: 'Capacidade do organismo de manter o equilíbrio interno apesar das variações do ambiente externo.',
          pronunciation: 'ho-me-os-TA-se',
          category_id: fisiologiaId,
          synonyms: ['equilíbrio fisiológico'],
          related_terms: ['metabolismo', 'regulação'],
          difficulty_level: 'intermediário'
        },
        {
          term: 'Sístole',
          definition: 'Fase de contração do coração em que o sangue é bombeado para fora dos ventrículos.',
          pronunciation: 'SÍS-to-le',
          category_id: fisiologiaId,
          synonyms: ['contração cardíaca'],
          related_terms: ['diástole', 'pressão arterial'],
          difficulty_level: 'básico'
        },
        {
          term: 'Diástole',
          definition: 'Fase de relaxamento do coração em que os ventrículos se enchem de sangue.',
          pronunciation: 'di-ÁS-to-le',
          category_id: fisiologiaId,
          synonyms: ['relaxamento cardíaco'],
          related_terms: ['sístole', 'pressão arterial'],
          difficulty_level: 'básico'
        },

        // Farmacologia
        {
          term: 'Analgésico',
          definition: 'Medicamento usado para alívio da dor sem causar perda de consciência.',
          pronunciation: 'a-nal-GÉ-si-co',
          category_id: farmacologiaId,
          synonyms: ['medicamento para dor'],
          related_terms: ['anti-inflamatório', 'opioide'],
          difficulty_level: 'básico'
        },
        {
          term: 'Antibiótico',
          definition: 'Medicamento que combate infecções causadas por bactérias.',
          pronunciation: 'an-ti-bi-Ó-ti-co',
          category_id: farmacologiaId,
          synonyms: ['antimicrobiano'],
          related_terms: ['infecção', 'resistência bacteriana'],
          difficulty_level: 'básico'
        },

        // Patologia
        {
          term: 'Hipertensão',
          definition: 'Condição caracterizada pela elevação persistente da pressão arterial.',
          pronunciation: 'hi-per-ten-SÃO',
          category_id: patologiaId,
          synonyms: ['pressão alta'],
          related_terms: ['pressão arterial', 'cardiovascular'],
          difficulty_level: 'básico'
        },
        {
          term: 'Diabetes',
          definition: 'Doença caracterizada por níveis elevados de glicose no sangue devido à deficiência ou resistência à insulina.',
          pronunciation: 'di-a-BE-tes',
          category_id: patologiaId,
          synonyms: ['diabetes mellitus'],
          related_terms: ['glicemia', 'insulina', 'glicose'],
          difficulty_level: 'básico'
        },

        // Sinais Vitais
        {
          term: 'Pressão Arterial',
          definition: 'Força exercida pelo sangue contra as paredes das artérias durante a circulação.',
          pronunciation: 'pres-SÃO ar-te-ri-AL',
          category_id: sinaisVitaisId,
          synonyms: ['PA'],
          related_terms: ['sístole', 'diástole', 'hipertensão'],
          difficulty_level: 'básico'
        },
        {
          term: 'Frequência Cardíaca',
          definition: 'Número de batimentos cardíacos por minuto.',
          pronunciation: 'fre-QUÊN-ci-a car-DÍ-a-ca',
          category_id: sinaisVitaisId,
          synonyms: ['FC', 'pulso'],
          related_terms: ['ritmo cardíaco', 'taquicardia'],
          difficulty_level: 'básico'
        }
      ];

      console.log('📝 Inserindo termos médicos...');
      
      const { error: termsError } = await supabase
        .from('medical_terms' as any)
        .insert(terms);

      if (termsError) {
        console.error('Erro ao inserir termos:', termsError);
        return false;
      }

      console.log('✅ Termos médicos inseridos');
    } else {
      console.log('ℹ️ Dados já existem, pulando inserção');
    }

    console.log('🎉 Inicialização do glossário médico concluída com sucesso!');
    return true;

  } catch (error) {
    console.error('❌ Erro ao inicializar dados do glossário:', error);
    
    // Se as tabelas não existem, mostrar instruções
    if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
      console.log(`
📋 INSTRUÇÕES PARA CRIAR TABELAS:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor  
3. Execute este SQL:

-- Criar tabelas do glossário
CREATE TABLE IF NOT EXISTS public.glossary_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.medical_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  pronunciation TEXT,
  category_id UUID REFERENCES public.glossary_categories(id),
  synonyms TEXT[],
  related_terms TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('básico', 'intermediário', 'avançado')) DEFAULT 'básico',
  is_favorite BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_favorite_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  term_id UUID REFERENCES public.medical_terms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, term_id)
);

-- Habilitar RLS
ALTER TABLE public.glossary_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorite_terms ENABLE ROW LEVEL SECURITY;
      `);
    }
    
    return false;
  }
};