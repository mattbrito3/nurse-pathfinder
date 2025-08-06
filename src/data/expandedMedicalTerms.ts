// Base expandida de termos médicos para estudantes de enfermagem
export const expandedMedicalTerms = [
  // SISTEMA CARDIOVASCULAR
  {
    id: 'cv001',
    term: 'Taquicardia',
    definition: 'Aumento da frequência cardíaca acima dos valores normais (>100 bpm em adultos).',
    category: 'Cardiovascular',
    difficulty: 'básico',
    synonyms: ['Ritmo cardíaco acelerado'],
    relatedTerms: ['Bradicardia', 'Arritmia', 'Palpitação']
  },
  {
    id: 'cv002',
    term: 'Bradicardia',
    definition: 'Diminuição da frequência cardíaca abaixo dos valores normais (<60 bpm em adultos).',
    category: 'Cardiovascular',
    difficulty: 'básico',
    synonyms: ['Ritmo cardíaco lento'],
    relatedTerms: ['Taquicardia', 'Arritmia', 'Bloqueio cardíaco']
  },
  {
    id: 'cv003',
    term: 'Hipertensão',
    definition: 'Pressão arterial sistólica ≥140 mmHg e/ou diastólica ≥90 mmHg, medida em pelo menos duas ocasiões.',
    category: 'Cardiovascular',
    difficulty: 'básico',
    synonyms: ['Pressão alta', 'HAS'],
    relatedTerms: ['Hipotensão', 'Pré-eclâmpsia', 'Crise hipertensiva']
  },
  {
    id: 'cv004',
    term: 'Hipotensão',
    definition: 'Pressão arterial sistólica <90 mmHg ou queda >20 mmHg dos valores basais.',
    category: 'Cardiovascular',
    difficulty: 'básico',
    synonyms: ['Pressão baixa'],
    relatedTerms: ['Hipertensão', 'Choque', 'Síncope']
  },
  {
    id: 'cv005',
    term: 'Infarto Agudo do Miocárdio',
    definition: 'Necrose do músculo cardíaco devido à interrupção do fluxo sanguíneo coronariano.',
    category: 'Cardiovascular',
    difficulty: 'intermediário',
    synonyms: ['IAM', 'Ataque cardíaco'],
    relatedTerms: ['Angina', 'Isquemia', 'Cateterismo']
  },
  {
    id: 'cv006',
    term: 'Arritmia',
    definition: 'Alteração no ritmo normal dos batimentos cardíacos.',
    category: 'Cardiovascular',
    difficulty: 'intermediário',
    synonyms: ['Disritmia'],
    relatedTerms: ['Fibrilação atrial', 'Taquicardia', 'Bradicardia']
  },
  {
    id: 'cv007',
    term: 'Insuficiência Cardíaca',
    definition: 'Incapacidade do coração em bombear sangue adequadamente para suprir as necessidades do organismo.',
    category: 'Cardiovascular',
    difficulty: 'intermediário',
    synonyms: ['IC', 'Falência cardíaca'],
    relatedTerms: ['Edema pulmonar', 'Dispneia', 'Cardiomiopatia']
  },
  {
    id: 'cv008',
    term: 'Fibrilação Atrial',
    definition: 'Arritmia cardíaca caracterizada por contração irregular e desorganizada dos átrios.',
    category: 'Cardiovascular',
    difficulty: 'avançado',
    synonyms: ['FA', 'Fibrilação auricular'],
    relatedTerms: ['Anticoagulação', 'AVC', 'Cardioversão']
  },

  // SISTEMA RESPIRATÓRIO
  {
    id: 'resp001',
    term: 'Dispneia',
    definition: 'Sensação subjetiva de dificuldade respiratória ou falta de ar.',
    category: 'Respiratório',
    difficulty: 'básico',
    synonyms: ['Falta de ar', 'Dificuldade respiratória'],
    relatedTerms: ['Taquipneia', 'Cianose', 'Ortopneia']
  },
  {
    id: 'resp002',
    term: 'Taquipneia',
    definition: 'Aumento da frequência respiratória acima dos valores normais (>20 irpm em adultos).',
    category: 'Respiratório',
    difficulty: 'básico',
    synonyms: ['Respiração rápida'],
    relatedTerms: ['Bradipneia', 'Dispneia', 'Hipóxia']
  },
  {
    id: 'resp003',
    term: 'Bradipneia',
    definition: 'Diminuição da frequência respiratória abaixo dos valores normais (<12 irpm em adultos).',
    category: 'Respiratório',
    difficulty: 'básico',
    synonyms: ['Respiração lenta'],
    relatedTerms: ['Taquipneia', 'Apneia', 'Hipoventilação']
  },
  {
    id: 'resp004',
    term: 'Cianose',
    definition: 'Coloração azulada da pele e mucosas devido à diminuição da oxigenação sanguínea.',
    category: 'Respiratório',
    difficulty: 'básico',
    synonyms: ['Coloração azulada'],
    relatedTerms: ['Hipóxia', 'Saturação', 'Oximetria']
  },
  {
    id: 'resp005',
    term: 'Pneumonia',
    definition: 'Infecção que inflama os sacos aéreos em um ou ambos os pulmões.',
    category: 'Respiratório',
    difficulty: 'intermediário',
    synonyms: ['Pneumonite'],
    relatedTerms: ['Bronquite', 'Sepse', 'Ventilação mecânica']
  },
  {
    id: 'resp006',
    term: 'Pneumotórax',
    definition: 'Presença de ar na cavidade pleural, causando colapso pulmonar.',
    category: 'Respiratório',
    difficulty: 'avançado',
    synonyms: ['Colapso pulmonar'],
    relatedTerms: ['Drenagem torácica', 'Dispneia', 'Hemotórax']
  },
  {
    id: 'resp007',
    term: 'Edema Pulmonar',
    definition: 'Acúmulo anormal de líquido nos alvéolos e interstício pulmonar.',
    category: 'Respiratório',
    difficulty: 'avançado',
    synonyms: ['Encharcamento pulmonar'],
    relatedTerms: ['Insuficiência cardíaca', 'Dispneia', 'Ortopneia']
  },

  // SISTEMA NEUROLÓGICO
  {
    id: 'neuro001',
    term: 'Cefaleia',
    definition: 'Dor de cabeça que pode ser primária ou secundária a outras condições.',
    category: 'Neurológico',
    difficulty: 'básico',
    synonyms: ['Dor de cabeça'],
    relatedTerms: ['Enxaqueca', 'Hipertensão intracraniana', 'Meningite']
  },
  {
    id: 'neuro002',
    term: 'Convulsão',
    definition: 'Episódio de atividade elétrica anormal no cérebro que causa alterações temporárias.',
    category: 'Neurológico',
    difficulty: 'intermediário',
    synonyms: ['Crise convulsiva'],
    relatedTerms: ['Epilepsia', 'Status epilepticus', 'Anticonvulsivante']
  },
  {
    id: 'neuro003',
    term: 'AVC',
    definition: 'Acidente Vascular Cerebral - interrupção do fluxo sanguíneo para parte do cérebro.',
    category: 'Neurológico',
    difficulty: 'intermediário',
    synonyms: ['Derrame', 'Acidente vascular encefálico'],
    relatedTerms: ['Hemiplegia', 'Afasia', 'Trombólise']
  },
  {
    id: 'neuro004',
    term: 'Hemiplegia',
    definition: 'Paralisia completa de um lado do corpo, geralmente causada por lesão cerebral.',
    category: 'Neurológico',
    difficulty: 'intermediário',
    synonyms: ['Paralisia lateral'],
    relatedTerms: ['AVC', 'Hemiparesia', 'Fisioterapia']
  },
  {
    id: 'neuro005',
    term: 'Glasgow',
    definition: 'Escala de Coma de Glasgow - avalia o nível de consciência através de resposta ocular, verbal e motora.',
    category: 'Neurológico',
    difficulty: 'avançado',
    synonyms: ['ECG', 'Escala de Glasgow'],
    relatedTerms: ['Coma', 'Traumatismo craniano', 'Pupilas']
  },

  // SISTEMA GASTROINTESTINAL
  {
    id: 'gi001',
    term: 'Náusea',
    definition: 'Sensação desagradável de ânsia de vômito, geralmente precedendo o vômito.',
    category: 'Gastrointestinal',
    difficulty: 'básico',
    synonyms: ['Enjoo', 'Ânsia'],
    relatedTerms: ['Vômito', 'Êmese', 'Antiemético']
  },
  {
    id: 'gi002',
    term: 'Vômito',
    definition: 'Expulsão forçada do conteúdo gástrico através da boca.',
    category: 'Gastrointestinal',
    difficulty: 'básico',
    synonyms: ['Êmese', 'Regurgitação'],
    relatedTerms: ['Náusea', 'Desidratação', 'Aspiração']
  },
  {
    id: 'gi003',
    term: 'Diarreia',
    definition: 'Evacuação de fezes líquidas ou semi-líquidas, geralmente frequentes.',
    category: 'Gastrointestinal',
    difficulty: 'básico',
    synonyms: ['Evacuação líquida'],
    relatedTerms: ['Desidratação', 'Gastroenterite', 'Constipação']
  },
  {
    id: 'gi004',
    term: 'Constipação',
    definition: 'Dificuldade ou diminuição da frequência das evacuações.',
    category: 'Gastrointestinal',
    difficulty: 'básico',
    synonyms: ['Prisão de ventre', 'Obstipação'],
    relatedTerms: ['Diarreia', 'Fibras', 'Laxante']
  },
  {
    id: 'gi005',
    term: 'Melena',
    definition: 'Fezes escuras, pastosas e com odor fétido, indicando sangramento digestivo alto.',
    category: 'Gastrointestinal',
    difficulty: 'avançado',
    synonyms: ['Fezes escuras'],
    relatedTerms: ['Hemorragia digestiva', 'Úlcera', 'Anemia']
  },

  // SISTEMA GENITURINÁRIO
  {
    id: 'gu001',
    term: 'Disúria',
    definition: 'Dor ou ardor durante a micção.',
    category: 'Geniturinário',
    difficulty: 'básico',
    synonyms: ['Ardor ao urinar'],
    relatedTerms: ['ITU', 'Cistite', 'Bacteriúria']
  },
  {
    id: 'gu002',
    term: 'Poliúria',
    definition: 'Produção excessiva de urina (>3 litros/dia em adultos).',
    category: 'Geniturinário',
    difficulty: 'básico',
    synonyms: ['Urina em excesso'],
    relatedTerms: ['Diabetes', 'Polidipsia', 'Diurese']
  },
  {
    id: 'gu003',
    term: 'Oligúria',
    definition: 'Diminuição da produção de urina (<500ml/dia em adultos).',
    category: 'Geniturinário',
    difficulty: 'intermediário',
    synonyms: ['Pouca urina'],
    relatedTerms: ['Anúria', 'Insuficiência renal', 'Desidratação']
  },
  {
    id: 'gu004',
    term: 'ITU',
    definition: 'Infecção do Trato Urinário - infecção bacteriana em qualquer parte do sistema urinário.',
    category: 'Geniturinário',
    difficulty: 'intermediário',
    synonyms: ['Infecção urinária'],
    relatedTerms: ['Cistite', 'Pielonefrite', 'Disúria']
  },

  // SISTEMA ENDÓCRINO
  {
    id: 'endo001',
    term: 'Hipoglicemia',
    definition: 'Diminuição dos níveis de glicose no sangue abaixo de 70 mg/dL.',
    category: 'Endócrino',
    difficulty: 'básico',
    synonyms: ['Glicose baixa'],
    relatedTerms: ['Hiperglicemia', 'Diabetes', 'Insulina']
  },
  {
    id: 'endo002',
    term: 'Hiperglicemia',
    definition: 'Aumento dos níveis de glicose no sangue acima de 126 mg/dL em jejum.',
    category: 'Endócrino',
    difficulty: 'básico',
    synonyms: ['Glicose alta'],
    relatedTerms: ['Hipoglicemia', 'Diabetes', 'Cetoacidose']
  },
  {
    id: 'endo003',
    term: 'Diabetes Mellitus',
    definition: 'Doença metabólica caracterizada por hiperglicemia crônica devido à deficiência ou resistência à insulina.',
    category: 'Endócrino',
    difficulty: 'intermediário',
    synonyms: ['Diabetes'],
    relatedTerms: ['Insulina', 'HbA1c', 'Cetoacidose']
  },
  {
    id: 'endo004',
    term: 'Cetoacidose',
    definition: 'Complicação grave do diabetes caracterizada por hiperglicemia, cetose e acidose metabólica.',
    category: 'Endócrino',
    difficulty: 'avançado',
    synonyms: ['CAD'],
    relatedTerms: ['Diabetes', 'Insulina', 'pH sanguíneo']
  },

  // PROCEDIMENTOS E CUIDADOS
  {
    id: 'proc001',
    term: 'Assepsia',
    definition: 'Conjunto de medidas para prevenir a contaminação por microrganismos.',
    category: 'Procedimentos',
    difficulty: 'básico',
    synonyms: ['Esterilização', 'Desinfecção'],
    relatedTerms: ['Antissepsia', 'Infecção hospitalar', 'EPI']
  },
  {
    id: 'proc002',
    term: 'Antissepsia',
    definition: 'Processo de eliminação ou inibição do crescimento de microrganismos em tecidos vivos.',
    category: 'Procedimentos',
    difficulty: 'básico',
    synonyms: ['Desinfecção da pele'],
    relatedTerms: ['Assepsia', 'Curativo', 'Cirurgia']
  },
  {
    id: 'proc003',
    term: 'Cateter',
    definition: 'Tubo fino e flexível inserido no corpo para drenagem, administração de medicamentos ou diagnóstico.',
    category: 'Procedimentos',
    difficulty: 'intermediário',
    synonyms: ['Sonda'],
    relatedTerms: ['Cateterismo', 'Infecção', 'Assepsia']
  },
  {
    id: 'proc004',
    term: 'Intubação',
    definition: 'Inserção de tubo na traqueia para manter a via aérea aberta e permitir ventilação mecânica.',
    category: 'Procedimentos',
    difficulty: 'avançado',
    synonyms: ['Entubação'],
    relatedTerms: ['Ventilação mecânica', 'Sedação', 'Extubação']
  },
  {
    id: 'proc005',
    term: 'RCP',
    definition: 'Ressuscitação Cardiopulmonar - conjunto de manobras para restabelecer circulação e respiração.',
    category: 'Procedimentos',
    difficulty: 'avançado',
    synonyms: ['Reanimação', 'Massagem cardíaca'],
    relatedTerms: ['Desfibrilação', 'Adrenalina', 'Parada cardíaca']
  },

  // MEDICAMENTOS E FARMACOLOGIA
  {
    id: 'farm001',
    term: 'Analgésico',
    definition: 'Medicamento que alivia ou elimina a dor sem causar perda de consciência.',
    category: 'Farmacologia',
    difficulty: 'básico',
    synonyms: ['Calmante da dor'],
    relatedTerms: ['Dipirona', 'Morfina', 'Anti-inflamatório']
  },
  {
    id: 'farm002',
    term: 'Antibiótico',
    definition: 'Medicamento que combate infecções causadas por bactérias.',
    category: 'Farmacologia',
    difficulty: 'básico',
    synonyms: ['Antimicrobiano'],
    relatedTerms: ['Resistência bacteriana', 'Penicilina', 'Infecção']
  },
  {
    id: 'farm003',
    term: 'Anti-hipertensivo',
    definition: 'Medicamento usado para reduzir a pressão arterial.',
    category: 'Farmacologia',
    difficulty: 'intermediário',
    synonyms: ['Hipotensor'],
    relatedTerms: ['Captopril', 'Amlodipina', 'Hipertensão']
  },
  {
    id: 'farm004',
    term: 'Diurético',
    definition: 'Medicamento que aumenta a produção e eliminação de urina.',
    category: 'Farmacologia',
    difficulty: 'intermediário',
    synonyms: ['Eliminador de líquido'],
    relatedTerms: ['Furosemida', 'Edema', 'Potássio']
  },
  {
    id: 'farm005',
    term: 'Vasodilatador',
    definition: 'Medicamento que relaxa e dilata os vasos sanguíneos.',
    category: 'Farmacologia',
    difficulty: 'avançado',
    synonyms: ['Dilatador vascular'],
    relatedTerms: ['Nitroglicerina', 'Angina', 'Pressão arterial']
  },

  // SINAIS VITAIS E MONITORIZAÇÃO
  {
    id: 'sv001',
    term: 'Pressão Arterial',
    definition: 'Força exercida pelo sangue contra as paredes das artérias durante o ciclo cardíaco.',
    category: 'Sinais Vitais',
    difficulty: 'básico',
    synonyms: ['PA', 'Tensão arterial'],
    relatedTerms: ['Sistólica', 'Diastólica', 'Esfigmomanômetro']
  },
  {
    id: 'sv002',
    term: 'Temperatura Corporal',
    definition: 'Medida do calor produzido e eliminado pelo organismo.',
    category: 'Sinais Vitais',
    difficulty: 'básico',
    synonyms: ['Temperatura', 'TC'],
    relatedTerms: ['Febre', 'Hipotermia', 'Termômetro']
  },
  {
    id: 'sv003',
    term: 'Saturação de Oxigênio',
    definition: 'Porcentagem de hemoglobina saturada com oxigênio no sangue.',
    category: 'Sinais Vitais',
    difficulty: 'intermediário',
    synonyms: ['SpO2', 'Saturação'],
    relatedTerms: ['Oximetria', 'Hipóxia', 'Cianose']
  },
  {
    id: 'sv004',
    term: 'Pulso',
    definition: 'Expansão rítmica das artérias causada pela ejeção de sangue do ventrículo esquerdo.',
    category: 'Sinais Vitais',
    difficulty: 'básico',
    synonyms: ['Frequência cardíaca', 'FC'],
    relatedTerms: ['Taquicardia', 'Bradicardia', 'Arritmia']
  },

  // EMERGÊNCIAS E URGÊNCIAS
  {
    id: 'emerg001',
    term: 'Choque',
    definition: 'Síndrome de inadequação circulatória com hipoperfusão tecidual.',
    category: 'Emergências',
    difficulty: 'avançado',
    synonyms: ['Colapso circulatório'],
    relatedTerms: ['Hipotensão', 'Taquicardia', 'Vasodilatador']
  },
  {
    id: 'emerg002',
    term: 'Parada Cardíaca',
    definition: 'Cessação súbita e inesperada da atividade cardíaca efetiva.',
    category: 'Emergências',
    difficulty: 'avançado',
    synonyms: ['PCR', 'Parada cardiorrespiratória'],
    relatedTerms: ['RCP', 'Desfibrilação', 'Adrenalina']
  },
  {
    id: 'emerg003',
    term: 'Anafilaxia',
    definition: 'Reação alérgica grave e potencialmente fatal que ocorre rapidamente.',
    category: 'Emergências',
    difficulty: 'avançado',
    synonyms: ['Choque anafilático'],
    relatedTerms: ['Adrenalina', 'Alergia', 'Broncoespasmo']
  },

  // ANATOMIA E FISIOLOGIA
  {
    id: 'anat001',
    term: 'Homeostase',
    definition: 'Capacidade do organismo de manter o equilíbrio interno apesar das variações externas.',
    category: 'Fisiologia',
    difficulty: 'intermediário',
    synonyms: ['Equilíbrio interno'],
    relatedTerms: ['Feedback', 'Regulação', 'Metabolismo']
  },
  {
    id: 'anat002',
    term: 'Hematócrito',
    definition: 'Porcentagem do volume sanguíneo ocupado pelos glóbulos vermelhos.',
    category: 'Fisiologia',
    difficulty: 'intermediário',
    synonyms: ['Ht', 'Volume globular'],
    relatedTerms: ['Hemoglobina', 'Anemia', 'Policitemia']
  },
  {
    id: 'anat003',
    term: 'pH Sanguíneo',
    definition: 'Medida do grau de acidez ou alcalinidade do sangue (normal: 7,35-7,45).',
    category: 'Fisiologia',
    difficulty: 'avançado',
    synonyms: ['Equilíbrio ácido-base'],
    relatedTerms: ['Acidose', 'Alcalose', 'Gasometria']
  }
];

// Categorias disponíveis
export const medicalCategories = [
  'Cardiovascular',
  'Respiratório', 
  'Neurológico',
  'Gastrointestinal',
  'Geniturinário',
  'Endócrino',
  'Procedimentos',
  'Farmacologia',
  'Sinais Vitais',
  'Emergências',
  'Fisiologia'
];

// Níveis de dificuldade
export const difficultyLevels = ['básico', 'intermediário', 'avançado'];
