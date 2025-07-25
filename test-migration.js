// Script para executar migrações manualmente
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

const runMigration = async () => {
  console.log('🚀 Iniciando migração manual...');

  try {
    // 1. Inserir categorias
    console.log('📦 Inserindo categorias...');
    
    const categoriesData = [
      { name: 'Cardiovascular', description: 'Sistema circulatório e coração', color: '#EF4444' },
      { name: 'Respiratório', description: 'Sistema respiratório e pulmões', color: '#F59E0B' },
      { name: 'Neurológico', description: 'Sistema nervoso e cérebro', color: '#10B981' },
      { name: 'Gastrointestinal', description: 'Sistema digestivo', color: '#8B5CF6' },
      { name: 'Geniturinário', description: 'Sistema renal e genital', color: '#06B6D4' },
      { name: 'Endócrino', description: 'Hormônios e metabolismo', color: '#DC2626' },
      { name: 'Procedimentos', description: 'Técnicas e procedimentos', color: '#6B7280' },
      { name: 'Farmacologia', description: 'Medicamentos e drogas', color: '#EC4899' },
      { name: 'Sinais Vitais', description: 'Parâmetros vitais', color: '#F97316' },
      { name: 'Emergências', description: 'Urgência e emergência', color: '#84CC16' },
      { name: 'Fisiologia', description: 'Funcionamento do organismo', color: '#3B82F6' }
    ];

    const { data: categories, error: catError } = await supabase
      .from('glossary_categories')
      .insert(categoriesData)
      .select('id, name');

    if (catError) {
      console.error('❌ Erro ao inserir categorias:', catError);
      return;
    }

    console.log(`✅ ${categories.length} categorias inseridas`);

    // 2. Criar mapa de categorias
    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    // 3. Inserir termos médicos
    console.log('📚 Inserindo termos médicos...');

    const termsData = [
      {
        term: 'Taquicardia',
        definition: 'Aumento da frequência cardíaca acima dos valores normais (>100 bpm em adultos).',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['Ritmo cardíaco acelerado'],
        related_terms: ['Bradicardia', 'Arritmia', 'Palpitação'],
        difficulty_level: 'básico'
      },
      {
        term: 'Bradicardia',
        definition: 'Diminuição da frequência cardíaca abaixo dos valores normais (<60 bpm em adultos).',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['Ritmo cardíaco lento'],
        related_terms: ['Taquicardia', 'Arritmia', 'Bloqueio cardíaco'],
        difficulty_level: 'básico'
      },
      {
        term: 'Hipertensão',
        definition: 'Pressão arterial sistólica ≥140 mmHg e/ou diastólica ≥90 mmHg.',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['Pressão alta', 'HAS'],
        related_terms: ['Hipotensão', 'Pré-eclâmpsia'],
        difficulty_level: 'básico'
      },
      {
        term: 'Dispneia',
        definition: 'Sensação subjetiva de dificuldade para respirar ou falta de ar.',
        category_id: categoryMap.get('Respiratório'),
        synonyms: ['Falta de ar'],
        related_terms: ['Taquipneia', 'Cianose'],
        difficulty_level: 'básico'
      },
      {
        term: 'Febre',
        definition: 'Elevação da temperatura corporal acima dos valores normais (>37,8°C).',
        category_id: categoryMap.get('Sinais Vitais'),
        synonyms: ['Hipertermia'],
        related_terms: ['Hipotermia', 'Infecção'],
        difficulty_level: 'básico'
      }
    ];

    const { data: terms, error: termsError } = await supabase
      .from('medical_terms')
      .insert(termsData)
      .select('id');

    if (termsError) {
      console.error('❌ Erro ao inserir termos:', termsError);
      return;
    }

    console.log(`✅ ${terms.length} termos inseridos`);
    console.log('🎉 Migração concluída com sucesso!');
    
    // Verificar resultado
    const { data: result } = await supabase
      .from('glossary_categories')
      .select('id')
      .limit(1);
    
    console.log('📊 Verificação:', result ? 'Dados disponíveis no banco' : 'Erro na verificação');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
};

runMigration();