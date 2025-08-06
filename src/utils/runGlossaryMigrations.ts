// Script para executar migrações do glossário médico
import { supabase } from '@/integrations/supabase/client';

export const runGlossaryDataMigrations = async (): Promise<void> => {
  console.log('🚀 Iniciando migração de dados do glossário médico...');

  try {
    // Verificar se já temos dados nas tabelas
    const { data: existingCategories } = await supabase
      .from('glossary_categories' as any)
      .select('id')
      .limit(1);

    const { data: existingTerms } = await supabase
      .from('medical_terms' as any)
      .select('id')
      .limit(1);

    if (existingCategories && existingCategories.length > 0 && 
        existingTerms && existingTerms.length > 0) {
      console.log('✅ Dados do glossário já existem no banco');
      return;
    }

    console.log('📦 Populando categorias...');
    
    // Inserir categorias
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

    const { data: insertedCategories, error: categoriesError } = await supabase
      .from('glossary_categories' as any)
      .insert(categoriesData)
      .select('id, name');

    if (categoriesError) {
      console.error('Erro ao inserir categorias:', categoriesError);
      throw categoriesError;
    }

    console.log(`✅ ${insertedCategories?.length || 0} categorias inseridas`);

    // Criar mapa de categorias para busca rápida
    const categoryMap = new Map();
    (insertedCategories as any)?.forEach((cat: any) => {
      categoryMap.set(cat.name, cat.id);
    });

    console.log('📚 Populando termos médicos...');

    // Preparar dados dos termos médicos
    const termsData = [
      // Cardiovascular
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
        definition: 'Pressão arterial sistólica ≥140 mmHg e/ou diastólica ≥90 mmHg, medida em pelo menos duas ocasiões.',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['Pressão alta', 'HAS'],
        related_terms: ['Hipotensão', 'Pré-eclâmpsia', 'Crise hipertensiva'],
        difficulty_level: 'básico'
      },
      {
        term: 'Hipotensão',
        definition: 'Pressão arterial sistólica <90 mmHg ou queda >20 mmHg dos valores basais.',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['Pressão baixa'],
        related_terms: ['Hipertensão', 'Choque', 'Síncope'],
        difficulty_level: 'básico'
      },
      {
        term: 'Infarto Agudo do Miocárdio',
        definition: 'Necrose do músculo cardíaco devido à interrupção do fluxo sanguíneo coronariano.',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['IAM', 'Ataque cardíaco'],
        related_terms: ['Angina', 'Isquemia', 'Cateterismo'],
        difficulty_level: 'intermediário'
      },
      {
        term: 'Arritmia',
        definition: 'Alteração do ritmo cardíaco normal, podendo ser irregular, muito rápido ou muito lento.',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['Disritmia'],
        related_terms: ['Taquicardia', 'Bradicardia', 'Fibrilação'],
        difficulty_level: 'intermediário'
      },
      {
        term: 'Angina',
        definition: 'Dor torácica devido à isquemia miocárdica transitória por diminuição do fluxo coronariano.',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['Angina pectoris'],
        related_terms: ['Infarto', 'Isquemia', 'Aterosclerose'],
        difficulty_level: 'intermediário'
      },
      {
        term: 'Palpitação',
        definition: 'Sensação desagradável de batimentos cardíacos rápidos, fortes ou irregulares.',
        category_id: categoryMap.get('Cardiovascular'),
        synonyms: ['Batedeira'],
        related_terms: ['Taquicardia', 'Arritmia', 'Ansiedade'],
        difficulty_level: 'básico'
      },

      // Respiratório
      {
        term: 'Taquipneia',
        definition: 'Aumento da frequência respiratória acima dos valores normais (>20 rpm em adultos).',
        category_id: categoryMap.get('Respiratório'),
        synonyms: ['Respiração rápida'],
        related_terms: ['Bradipneia', 'Dispneia', 'Hipóxia'],
        difficulty_level: 'básico'
      },
      {
        term: 'Bradipneia',
        definition: 'Diminuição da frequência respiratória abaixo dos valores normais (<12 rpm em adultos).',
        category_id: categoryMap.get('Respiratório'),
        synonyms: ['Respiração lenta'],
        related_terms: ['Taquipneia', 'Apneia', 'Hipoventilação'],
        difficulty_level: 'básico'
      },
      {
        term: 'Dispneia',
        definition: 'Sensação subjetiva de dificuldade para respirar ou falta de ar.',
        category_id: categoryMap.get('Respiratório'),
        synonyms: ['Falta de ar', 'Dificuldade respiratória'],
        related_terms: ['Ortopneia', 'Platipneia', 'Taquipneia'],
        difficulty_level: 'básico'
      },
      {
        term: 'Cianose',
        definition: 'Coloração azulada da pele e mucosas devido à diminuição da oxigenação sanguínea.',
        category_id: categoryMap.get('Respiratório'),
        synonyms: ['Coloração azulada'],
        related_terms: ['Hipóxia', 'Dispneia', 'Insuficiência respiratória'],
        difficulty_level: 'intermediário'
      },
      {
        term: 'Asma',
        definition: 'Doença inflamatória crônica das vias aéreas com broncoconstrição reversível.',
        category_id: categoryMap.get('Respiratório'),
        synonyms: ['Broncoespasmo'],
        related_terms: ['Bronquite', 'DPOC', 'Alergia'],
        difficulty_level: 'intermediário'
      },

      // Neurológico
      {
        term: 'Cefaleia',
        definition: 'Dor de cabeça de intensidade, duração e características variáveis.',
        category_id: categoryMap.get('Neurológico'),
        synonyms: ['Dor de cabeça'],
        related_terms: ['Enxaqueca', 'Hipertensão intracraniana', 'Meningite'],
        difficulty_level: 'básico'
      },
      {
        term: 'Convulsão',
        definition: 'Episódio de atividade elétrica anormal no cérebro que causa movimentos involuntários.',
        category_id: categoryMap.get('Neurológico'),
        synonyms: ['Crise convulsiva'],
        related_terms: ['Epilepsia', 'Estado de mal epiléptico', 'Aura'],
        difficulty_level: 'avançado'
      },
      {
        term: 'AVC',
        definition: 'Acidente Vascular Cerebral - interrupção do fluxo sanguíneo para parte do cérebro.',
        category_id: categoryMap.get('Neurológico'),
        synonyms: ['Derrame', 'Acidente vascular cerebral'],
        related_terms: ['AIT', 'Hemiplegia', 'Afasia'],
        difficulty_level: 'avançado'
      },
      {
        term: 'Síncope',
        definition: 'Perda súbita e transitória da consciência devido à hipoperfusão cerebral.',
        category_id: categoryMap.get('Neurológico'),
        synonyms: ['Desmaio'],
        related_terms: ['Lipotímia', 'Hipotensão', 'Arritmia'],
        difficulty_level: 'intermediário'
      },

      // Gastrointestinal
      {
        term: 'Náusea',
        definition: 'Sensação desagradável de mal-estar no estômago com vontade de vomitar.',
        category_id: categoryMap.get('Gastrointestinal'),
        synonyms: ['Enjoo'],
        related_terms: ['Vômito', 'Dispepsia', 'Vertigem'],
        difficulty_level: 'básico'
      },
      {
        term: 'Vômito',
        definition: 'Expulsão forçada do conteúdo gástrico através da boca.',
        category_id: categoryMap.get('Gastrointestinal'),
        synonyms: ['Emese'],
        related_terms: ['Náusea', 'Desidratação', 'Aspiração'],
        difficulty_level: 'básico'
      },
      {
        term: 'Diarreia',
        definition: 'Eliminação de fezes líquidas ou pastosas, em maior frequência que o normal.',
        category_id: categoryMap.get('Gastrointestinal'),
        synonyms: ['Fezes líquidas'],
        related_terms: ['Desidratação', 'Desequilíbrio eletrolítico', 'Gastroenterite'],
        difficulty_level: 'básico'
      },

      // Endócrino
      {
        term: 'Diabetes Mellitus',
        definition: 'Grupo de doenças metabólicas caracterizadas por hiperglicemia crônica.',
        category_id: categoryMap.get('Endócrino'),
        synonyms: ['Diabetes'],
        related_terms: ['Hiperglicemia', 'Cetoacidose', 'Neuropatia'],
        difficulty_level: 'intermediário'
      },
      {
        term: 'Hiperglicemia',
        definition: 'Aumento dos níveis de glicose no sangue acima dos valores normais.',
        category_id: categoryMap.get('Endócrino'),
        synonyms: ['Glicose alta'],
        related_terms: ['Diabetes', 'Cetoacidose', 'Poliúria'],
        difficulty_level: 'básico'
      },
      {
        term: 'Hipoglicemia',
        definition: 'Diminuição dos níveis de glicose no sangue abaixo dos valores normais.',
        category_id: categoryMap.get('Endócrino'),
        synonyms: ['Glicose baixa'],
        related_terms: ['Convulsão', 'Sudorese', 'Confusão mental'],
        difficulty_level: 'básico'
      },

      // Sinais Vitais
      {
        term: 'Febre',
        definition: 'Elevação da temperatura corporal acima dos valores normais (>37,8°C).',
        category_id: categoryMap.get('Sinais Vitais'),
        synonyms: ['Hipertermia'],
        related_terms: ['Hipotermia', 'Calafrios', 'Infecção'],
        difficulty_level: 'básico'
      },
      {
        term: 'Hipotermia',
        definition: 'Diminuição da temperatura corporal abaixo dos valores normais (<35°C).',
        category_id: categoryMap.get('Sinais Vitais'),
        synonyms: ['Temperatura baixa'],
        related_terms: ['Febre', 'Choque', 'Exposição ao frio'],
        difficulty_level: 'intermediário'
      },

      // Procedimentos
      {
        term: 'Punção Venosa',
        definition: 'Procedimento de inserção de agulha ou cateter em veia para acesso vascular.',
        category_id: categoryMap.get('Procedimentos'),
        synonyms: ['Acesso venoso'],
        related_terms: ['Flebite', 'Hematoma', 'Infiltração'],
        difficulty_level: 'básico'
      },
      {
        term: 'Curativo',
        definition: 'Procedimento de limpeza e proteção de feridas para promover cicatrização.',
        category_id: categoryMap.get('Procedimentos'),
        synonyms: ['Tratamento de ferida'],
        related_terms: ['Infecção', 'Cicatrização', 'Necrose'],
        difficulty_level: 'básico'
      },

      // Farmacologia
      {
        term: 'Analgésico',
        definition: 'Medicamento utilizado para alívio da dor sem perda da consciência.',
        category_id: categoryMap.get('Farmacologia'),
        synonyms: ['Antálgico'],
        related_terms: ['Opioide', 'Anti-inflamatório', 'Dipirona'],
        difficulty_level: 'básico'
      },
      {
        term: 'Antibiótico',
        definition: 'Medicamento usado para tratar infecções causadas por bactérias.',
        category_id: categoryMap.get('Farmacologia'),
        synonyms: ['Antimicrobiano'],
        related_terms: ['Resistência bacteriana', 'Penicilina', 'Cultura'],
        difficulty_level: 'intermediário'
      },

      // Emergências
      {
        term: 'Parada Cardiorrespiratória',
        definition: 'Cessação súbita e inesperada da circulação e respiração eficazes.',
        category_id: categoryMap.get('Emergências'),
        synonyms: ['PCR'],
        related_terms: ['RCP', 'Desfibrilação', 'Adrenalina'],
        difficulty_level: 'avançado'
      },
      {
        term: 'Choque',
        definition: 'Estado de hipoperfusão tecidual generalizada com inadequado suprimento de oxigênio.',
        category_id: categoryMap.get('Emergências'),
        synonyms: ['Estado de choque'],
        related_terms: ['Hipotensão', 'Taquicardia', 'Acidose'],
        difficulty_level: 'avançado'
      },

      // Fisiologia
      {
        term: 'Homeostase',
        definition: 'Capacidade do organismo de manter equilíbrio interno constante.',
        category_id: categoryMap.get('Fisiologia'),
        synonyms: ['Equilíbrio fisiológico'],
        related_terms: ['Regulação', 'Feedback', 'Adaptação'],
        difficulty_level: 'intermediário'
      }
    ];

    // Inserir termos em lotes para melhor performance
    const batchSize = 10;
    let insertedCount = 0;

    for (let i = 0; i < termsData.length; i += batchSize) {
      const batch = termsData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('medical_terms' as any)
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`Erro ao inserir lote ${Math.floor(i/batchSize) + 1}:`, error);
        throw error;
      }

      insertedCount += data?.length || 0;
      console.log(`📦 Lote ${Math.floor(i/batchSize) + 1} inserido: ${data?.length || 0} termos`);
    }

    console.log(`✅ ${insertedCount} termos médicos inseridos com sucesso!`);
    console.log('🎉 Migração de dados do glossário concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na migração de dados do glossário:', error);
    throw error;
  }
};
