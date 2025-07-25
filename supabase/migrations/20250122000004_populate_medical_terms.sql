-- Migração para popular dados reais do glossário médico
-- Data: 2025-01-22
-- Descrição: Migra dados mock para tabelas reais com UUIDs

-- Primeiro, inserir categorias
INSERT INTO public.glossary_categories (id, name, description, color) VALUES
  (gen_random_uuid(), 'Cardiovascular', 'Sistema circulatório e coração', '#EF4444'),
  (gen_random_uuid(), 'Respiratório', 'Sistema respiratório e pulmões', '#F59E0B'),
  (gen_random_uuid(), 'Neurológico', 'Sistema nervoso e cérebro', '#10B981'),
  (gen_random_uuid(), 'Gastrointestinal', 'Sistema digestivo', '#8B5CF6'),
  (gen_random_uuid(), 'Geniturinário', 'Sistema renal e genital', '#06B6D4'),
  (gen_random_uuid(), 'Endócrino', 'Hormônios e metabolismo', '#DC2626'),
  (gen_random_uuid(), 'Procedimentos', 'Técnicas e procedimentos', '#6B7280'),
  (gen_random_uuid(), 'Farmacologia', 'Medicamentos e drogas', '#EC4899'),
  (gen_random_uuid(), 'Sinais Vitais', 'Parâmetros vitais', '#F97316'),
  (gen_random_uuid(), 'Emergências', 'Urgência e emergência', '#84CC16'),
  (gen_random_uuid(), 'Fisiologia', 'Funcionamento do organismo', '#3B82F6')
ON CONFLICT (name) DO NOTHING;

-- Função temporária para mapear categoria para UUID
CREATE OR REPLACE FUNCTION get_category_uuid(category_name TEXT)
RETURNS UUID AS $$
DECLARE
    category_uuid UUID;
BEGIN
    SELECT id INTO category_uuid 
    FROM public.glossary_categories 
    WHERE name = category_name;
    
    IF category_uuid IS NULL THEN
        -- Se não encontrar, usar primeira categoria como fallback
        SELECT id INTO category_uuid 
        FROM public.glossary_categories 
        LIMIT 1;
    END IF;
    
    RETURN category_uuid;
END;
$$ LANGUAGE plpgsql;

-- Inserir termos médicos com UUIDs reais
-- SISTEMA CARDIOVASCULAR
INSERT INTO public.medical_terms (id, term, definition, category_id, synonyms, related_terms, difficulty_level) VALUES

-- Cardiovascular
(gen_random_uuid(), 'Taquicardia', 'Aumento da frequência cardíaca acima dos valores normais (>100 bpm em adultos).', get_category_uuid('Cardiovascular'), ARRAY['Ritmo cardíaco acelerado'], ARRAY['Bradicardia', 'Arritmia', 'Palpitação'], 'básico'),

(gen_random_uuid(), 'Bradicardia', 'Diminuição da frequência cardíaca abaixo dos valores normais (<60 bpm em adultos).', get_category_uuid('Cardiovascular'), ARRAY['Ritmo cardíaco lento'], ARRAY['Taquicardia', 'Arritmia', 'Bloqueio cardíaco'], 'básico'),

(gen_random_uuid(), 'Hipertensão', 'Pressão arterial sistólica ≥140 mmHg e/ou diastólica ≥90 mmHg, medida em pelo menos duas ocasiões.', get_category_uuid('Cardiovascular'), ARRAY['Pressão alta', 'HAS'], ARRAY['Hipotensão', 'Pré-eclâmpsia', 'Crise hipertensiva'], 'básico'),

(gen_random_uuid(), 'Hipotensão', 'Pressão arterial sistólica <90 mmHg ou queda >20 mmHg dos valores basais.', get_category_uuid('Cardiovascular'), ARRAY['Pressão baixa'], ARRAY['Hipertensão', 'Choque', 'Síncope'], 'básico'),

(gen_random_uuid(), 'Infarto Agudo do Miocárdio', 'Necrose do músculo cardíaco devido à interrupção do fluxo sanguíneo coronariano.', get_category_uuid('Cardiovascular'), ARRAY['IAM', 'Ataque cardíaco'], ARRAY['Angina', 'Isquemia', 'Cateterismo'], 'intermediário'),

(gen_random_uuid(), 'Arritmia', 'Alteração do ritmo cardíaco normal, podendo ser irregular, muito rápido ou muito lento.', get_category_uuid('Cardiovascular'), ARRAY['Disritmia'], ARRAY['Taquicardia', 'Bradicardia', 'Fibrilação'], 'intermediário'),

(gen_random_uuid(), 'Insuficiência Cardíaca', 'Incapacidade do coração de bombear sangue adequadamente para suprir as necessidades do organismo.', get_category_uuid('Cardiovascular'), ARRAY['IC', 'Insuficiência cardíaca congestiva'], ARRAY['Edema pulmonar', 'Dispneia', 'Fadiga'], 'avançado'),

(gen_random_uuid(), 'Edema', 'Acúmulo anormal de líquido nos tecidos ou cavidades corporais.', get_category_uuid('Cardiovascular'), ARRAY['Inchaço'], ARRAY['Insuficiência cardíaca', 'Retenção hídrica', 'Hipoproteinemia'], 'básico'),

-- Respiratório
(gen_random_uuid(), 'Taquipneia', 'Aumento da frequência respiratória acima dos valores normais (>20 rpm em adultos).', get_category_uuid('Respiratório'), ARRAY['Respiração rápida'], ARRAY['Bradipneia', 'Dispneia', 'Hipóxia'], 'básico'),

(gen_random_uuid(), 'Bradipneia', 'Diminuição da frequência respiratória abaixo dos valores normais (<12 rpm em adultos).', get_category_uuid('Respiratório'), ARRAY['Respiração lenta'], ARRAY['Taquipneia', 'Apneia', 'Hipoventilação'], 'básico'),

(gen_random_uuid(), 'Dispneia', 'Sensação subjetiva de dificuldade para respirar ou falta de ar.', get_category_uuid('Respiratório'), ARRAY['Falta de ar', 'Dificuldade respiratória'], ARRAY['Ortopneia', 'Platipneia', 'Taquipneia'], 'básico'),

(gen_random_uuid(), 'Cianose', 'Coloração azulada da pele e mucosas devido à diminuição da oxigenação sanguínea.', get_category_uuid('Respiratório'), ARRAY['Coloração azulada'], ARRAY['Hipóxia', 'Dispneia', 'Insuficiência respiratória'], 'intermediário'),

(gen_random_uuid(), 'Pneumonia', 'Infecção que inflama os sacos aéreos de um ou ambos os pulmões, que podem se encher de líquido.', get_category_uuid('Respiratório'), ARRAY['Pneumopatia infecciosa'], ARRAY['Broncopneumonia', 'Derrame pleural', 'Sepse'], 'intermediário'),

-- Neurológico
(gen_random_uuid(), 'Cefaleia', 'Dor de cabeça de intensidade, duração e características variáveis.', get_category_uuid('Neurológico'), ARRAY['Dor de cabeça'], ARRAY['Enxaqueca', 'Hipertensão intracraniana', 'Meningite'], 'básico'),

(gen_random_uuid(), 'Convulsão', 'Episódio de atividade elétrica anormal no cérebro que causa movimentos involuntários.', get_category_uuid('Neurológico'), ARRAY['Crise convulsiva'], ARRAY['Epilepsia', 'Estado de mal epiléptico', 'Aura'], 'avançado'),

(gen_random_uuid(), 'AVC', 'Acidente Vascular Cerebral - interrupção do fluxo sanguíneo para parte do cérebro.', get_category_uuid('Neurológico'), ARRAY['Derrame', 'Acidente vascular cerebral'], ARRAY['AIT', 'Hemiplegia', 'Afasia'], 'avançado'),

-- Gastrointestinal
(gen_random_uuid(), 'Náusea', 'Sensação desagradável de mal-estar no estômago com vontade de vomitar.', get_category_uuid('Gastrointestinal'), ARRAY['Enjoo'], ARRAY['Vômito', 'Dispepsia', 'Vertigem'], 'básico'),

(gen_random_uuid(), 'Vômito', 'Expulsão forçada do conteúdo gástrico através da boca.', get_category_uuid('Gastrointestinal'), ARRAY['Emese'], ARRAY['Náusea', 'Desidratação', 'Aspiração'], 'básico'),

(gen_random_uuid(), 'Diarreia', 'Eliminação de fezes líquidas ou pastosas, em maior frequência que o normal.', get_category_uuid('Gastrointestinal'), ARRAY['Fezes líquidas'], ARRAY['Desidratação', 'Desequilíbrio eletrolítico', 'Gastroenterite'], 'básico'),

-- Geniturinário
(gen_random_uuid(), 'Anúria', 'Ausência total ou quase total de produção de urina (<100ml/24h).', get_category_uuid('Geniturinário'), ARRAY['Ausência de urina'], ARRAY['Oligúria', 'Insuficiência renal', 'Obstrução urinária'], 'avançado'),

(gen_random_uuid(), 'Oligúria', 'Diminuição do volume urinário (<400ml/24h em adultos).', get_category_uuid('Geniturinário'), ARRAY['Pouca urina'], ARRAY['Anúria', 'Desidratação', 'Insuficiência renal'], 'intermediário'),

(gen_random_uuid(), 'Poliúria', 'Aumento excessivo do volume urinário (>3L/24h em adultos).', get_category_uuid('Geniturinário'), ARRAY['Excesso de urina'], ARRAY['Diabetes', 'Diabetes insípido', 'Polidipsia'], 'intermediário'),

-- Sinais Vitais
(gen_random_uuid(), 'Febre', 'Elevação da temperatura corporal acima dos valores normais (>37,8°C).', get_category_uuid('Sinais Vitais'), ARRAY['Hipertermia'], ARRAY['Hipotermia', 'Calafrios', 'Infecção'], 'básico'),

(gen_random_uuid(), 'Hipotermia', 'Diminuição da temperatura corporal abaixo dos valores normais (<35°C).', get_category_uuid('Sinais Vitais'), ARRAY['Temperatura baixa'], ARRAY['Febre', 'Choque', 'Exposição ao frio'], 'intermediário'),

-- Procedimentos
(gen_random_uuid(), 'Cateterismo Vesical', 'Introdução de cateter na bexiga através da uretra para drenagem ou instilação.', get_category_uuid('Procedimentos'), ARRAY['Sondagem vesical'], ARRAY['Retenção urinária', 'Infecção urinária', 'Irrigação vesical'], 'intermediário'),

(gen_random_uuid(), 'Intubação Orotraqueal', 'Inserção de tubo endotraqueal pela boca para ventilação mecânica.', get_category_uuid('Procedimentos'), ARRAY['IOT'], ARRAY['Ventilação mecânica', 'Via aérea difícil', 'Extubação'], 'avançado'),

-- Farmacologia
(gen_random_uuid(), 'Analgésico', 'Medicamento utilizado para alívio da dor sem perda da consciência.', get_category_uuid('Farmacologia'), ARRAY['Antálgico'], ARRAY['Opioide', 'Anti-inflamatório', 'Dipirona'], 'básico'),

(gen_random_uuid(), 'Antibiótico', 'Medicamento usado para tratar infecções causadas por bactérias.', get_category_uuid('Farmacologia'), ARRAY['Antimicrobiano'], ARRAY['Resistência bacteriana', 'Penicilina', 'Cultura'], 'intermediário'),

-- Emergências
(gen_random_uuid(), 'Parada Cardiorrespiratória', 'Cessação súbita e inesperada da circulação e respiração eficazes.', get_category_uuid('Emergências'), ARRAY['PCR'], ARRAY['RCP', 'Desfibrilação', 'Adrenalina'], 'avançado'),

(gen_random_uuid(), 'Choque', 'Estado de hipoperfusão tecidual generalizada com inadequado suprimento de oxigênio.', get_category_uuid('Emergências'), ARRAY['Estado de choque'], ARRAY['Hipotensão', 'Taquicardia', 'Acidose'], 'avançado')

ON CONFLICT (term) DO NOTHING;

-- Remover função temporária
DROP FUNCTION IF EXISTS get_category_uuid(TEXT);