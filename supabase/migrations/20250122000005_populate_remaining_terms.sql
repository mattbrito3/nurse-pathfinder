-- Migração para adicionar termos médicos adicionais
-- Data: 2025-01-22  
-- Descrição: Completa a base de dados com mais termos médicos

-- Função auxiliar para buscar categoria
CREATE OR REPLACE FUNCTION get_category_uuid(category_name TEXT)
RETURNS UUID AS $$
DECLARE
    category_uuid UUID;
BEGIN
    SELECT id INTO category_uuid 
    FROM public.glossary_categories 
    WHERE name = category_name;
    
    IF category_uuid IS NULL THEN
        SELECT id INTO category_uuid 
        FROM public.glossary_categories 
        LIMIT 1;
    END IF;
    
    RETURN category_uuid;
END;
$$ LANGUAGE plpgsql;

-- Inserir mais termos médicos
INSERT INTO public.medical_terms (id, term, definition, category_id, synonyms, related_terms, difficulty_level) VALUES

-- Mais termos Cardiovasculares
(gen_random_uuid(), 'Angina', 'Dor torácica devido à isquemia miocárdica transitória por diminuição do fluxo coronariano.', get_category_uuid('Cardiovascular'), ARRAY['Angina pectoris'], ARRAY['Infarto', 'Isquemia', 'Aterosclerose'], 'intermediário'),

(gen_random_uuid(), 'Palpitação', 'Sensação desagradável de batimentos cardíacos rápidos, fortes ou irregulares.', get_category_uuid('Cardiovascular'), ARRAY['Batedeira'], ARRAY['Taquicardia', 'Arritmia', 'Ansiedade'], 'básico'),

(gen_random_uuid(), 'Sopro Cardíaco', 'Som adicional audível durante a ausculta cardíaca devido ao fluxo turbulento de sangue.', get_category_uuid('Cardiovascular'), ARRAY['Sopro'], ARRAY['Valvopatia', 'Estenose', 'Insuficiência'], 'intermediário'),

-- Mais termos Respiratórios  
(gen_random_uuid(), 'Asma', 'Doença inflamatória crônica das vias aéreas com broncoconstrição reversível.', get_category_uuid('Respiratório'), ARRAY['Broncoespasmo'], ARRAY['Bronquite', 'DPOC', 'Alergia'], 'intermediário'),

(gen_random_uuid(), 'Pneumotórax', 'Presença de ar no espaço pleural, causando colapso pulmonar parcial ou total.', get_category_uuid('Respiratório'), ARRAY['Colapso pulmonar'], ARRAY['Hemotórax', 'Derrame pleural', 'Enfisema'], 'avançado'),

(gen_random_uuid(), 'Hemoptise', 'Expectoração de sangue proveniente das vias respiratórias.', get_category_uuid('Respiratório'), ARRAY['Escarro com sangue'], ARRAY['Tuberculose', 'Embolia pulmonar', 'Câncer'], 'intermediário'),

(gen_random_uuid(), 'Ortopneia', 'Dificuldade respiratória que surge ou piora quando o paciente está deitado.', get_category_uuid('Respiratório'), ARRAY['Dispneia de decúbito'], ARRAY['Dispneia', 'Insuficiência cardíaca', 'Edema pulmonar'], 'intermediário'),

-- Mais termos Neurológicos
(gen_random_uuid(), 'Síncope', 'Perda súbita e transitória da consciência devido à hipoperfusão cerebral.', get_category_uuid('Neurológico'), ARRAY['Desmaio'], ARRAY['Lipotímia', 'Hipotensão', 'Arritmia'], 'intermediário'),

(gen_random_uuid(), 'Vertigem', 'Sensação ilusória de movimento rotacional do ambiente ou do próprio corpo.', get_category_uuid('Neurológico'), ARRAY['Tontura rotatória'], ARRAY['Náusea', 'Vômito', 'Nistagmo'], 'básico'),

(gen_random_uuid(), 'Hemiplegia', 'Paralisia de um lado do corpo, geralmente causada por lesão cerebral.', get_category_uuid('Neurológico'), ARRAY['Paralisia lateral'], ARRAY['AVC', 'Hemiparesia', 'Afasia'], 'avançado'),

(gen_random_uuid(), 'Afasia', 'Distúrbio da linguagem que afeta a capacidade de falar, entender, ler ou escrever.', get_category_uuid('Neurológico'), ARRAY['Distúrbio da fala'], ARRAY['AVC', 'Hemiplegia', 'Disartria'], 'avançado'),

-- Mais termos Gastrointestinais
(gen_random_uuid(), 'Constipação', 'Dificuldade para evacuar ou diminuição da frequência evacuatória.', get_category_uuid('Gastrointestinal'), ARRAY['Prisão de ventre'], ARRAY['Obstipação', 'Fecaloma', 'Meteorismo'], 'básico'),

(gen_random_uuid(), 'Melena', 'Eliminação de fezes escuras, alcatroadas, indicando sangramento digestivo alto.', get_category_uuid('Gastrointestinal'), ARRAY['Fezes escuras'], ARRAY['Hematêmese', 'Úlcera péptica', 'Sangramento digestivo'], 'intermediário'),

(gen_random_uuid(), 'Hematêmese', 'Vômito com sangue proveniente do trato gastrointestinal superior.', get_category_uuid('Gastrointestinal'), ARRAY['Vômito com sangue'], ARRAY['Melena', 'Úlcera', 'Varizes esofágicas'], 'intermediário'),

(gen_random_uuid(), 'Icterícia', 'Coloração amarelada da pele e mucosas devido ao acúmulo de bilirrubina.', get_category_uuid('Gastrointestinal'), ARRAY['Amarelão'], ARRAY['Hepatite', 'Cirrose', 'Colestase'], 'intermediário'),

-- Mais termos Geniturinários
(gen_random_uuid(), 'Disúria', 'Dificuldade, dor ou ardor para urinar.', get_category_uuid('Geniturinário'), ARRAY['Ardor miccional'], ARRAY['Cistite', 'Uretrite', 'Prostatite'], 'básico'),

(gen_random_uuid(), 'Hematúria', 'Presença de sangue na urina, visível ou detectável por exame.', get_category_uuid('Geniturinário'), ARRAY['Sangue na urina'], ARRAY['Cistite', 'Cálculo renal', 'Glomerulonefrite'], 'intermediário'),

(gen_random_uuid(), 'Proteinúria', 'Presença anormal de proteínas na urina.', get_category_uuid('Geniturinário'), ARRAY['Proteína na urina'], ARRAY['Glomerulonefrite', 'Diabetes', 'Hipertensão'], 'intermediário'),

-- Termos Endócrinos
(gen_random_uuid(), 'Diabetes Mellitus', 'Grupo de doenças metabólicas caracterizadas por hiperglicemia crônica.', get_category_uuid('Endócrino'), ARRAY['Diabetes'], ARRAY['Hiperglicemia', 'Cetoacidose', 'Neuropatia'], 'intermediário'),

(gen_random_uuid(), 'Hiperglicemia', 'Aumento dos níveis de glicose no sangue acima dos valores normais.', get_category_uuid('Endócrino'), ARRAY['Glicose alta'], ARRAY['Diabetes', 'Cetoacidose', 'Poliúria'], 'básico'),

(gen_random_uuid(), 'Hipoglicemia', 'Diminuição dos níveis de glicose no sangue abaixo dos valores normais.', get_category_uuid('Endócrino'), ARRAY['Glicose baixa'], ARRAY['Convulsão', 'Sudorese', 'Confusão mental'], 'básico'),

(gen_random_uuid(), 'Cetoacidose', 'Complicação grave do diabetes com acúmulo de corpos cetônicos e acidose.', get_category_uuid('Endócrino'), ARRAY['CAD'], ARRAY['Diabetes', 'Acidose', 'Desidratação'], 'avançado'),

-- Mais Procedimentos
(gen_random_uuid(), 'Punção Venosa', 'Procedimento de inserção de agulha ou cateter em veia para acesso vascular.', get_category_uuid('Procedimentos'), ARRAY['Acesso venoso'], ARRAY['Flebite', 'Hematoma', 'Infiltração'], 'básico'),

(gen_random_uuid(), 'Sondagem Nasogástrica', 'Inserção de sonda através do nariz até o estômago.', get_category_uuid('Procedimentos'), ARRAY['SNG'], ARRAY['Aspiração gástrica', 'Nutrição enteral', 'Lavagem gástrica'], 'intermediário'),

(gen_random_uuid(), 'Curativo', 'Procedimento de limpeza e proteção de feridas para promover cicatrização.', get_category_uuid('Procedimentos'), ARRAY['Tratamento de ferida'], ARRAY['Infecção', 'Cicatrização', 'Necrose'], 'básico'),

(gen_random_uuid(), 'Aspiração de Vias Aéreas', 'Remoção de secreções das vias respiratórias por sucção.', get_category_uuid('Procedimentos'), ARRAY['Aspiração traqueal'], ARRAY['Intubação', 'Pneumonia', 'Hipóxia'], 'intermediário'),

-- Mais Farmacologia
(gen_random_uuid(), 'Anti-inflamatório', 'Medicamento que reduz inflamação, dor e febre.', get_category_uuid('Farmacologia'), ARRAY['AINE'], ARRAY['Analgésico', 'Corticoide', 'Dipirona'], 'básico'),

(gen_random_uuid(), 'Diurético', 'Medicamento que aumenta a produção e eliminação de urina.', get_category_uuid('Farmacologia'), ARRAY['Medicamento diurético'], ARRAY['Furosemida', 'Edema', 'Hipertensão'], 'intermediário'),

(gen_random_uuid(), 'Broncodilatador', 'Medicamento que dilata os brônquios facilitando a respiração.', get_category_uuid('Farmacologia'), ARRAY['Medicamento respiratório'], ARRAY['Asma', 'DPOC', 'Nebulização'], 'intermediário'),

(gen_random_uuid(), 'Antiarrítmico', 'Medicamento usado para tratar e prevenir arritmias cardíacas.', get_category_uuid('Farmacologia'), ARRAY['Medicamento cardíaco'], ARRAY['Arritmia', 'Fibrilação', 'Taquicardia'], 'avançado'),

-- Mais Emergências
(gen_random_uuid(), 'Anafilaxia', 'Reação alérgica grave e generalizada que pode ser fatal.', get_category_uuid('Emergências'), ARRAY['Choque anafilático'], ARRAY['Alergia', 'Adrenalina', 'Broncoespasmo'], 'avançado'),

(gen_random_uuid(), 'Embolia Pulmonar', 'Obstrução de artéria pulmonar por êmbolo, geralmente coágulo sanguíneo.', get_category_uuid('Emergências'), ARRAY['TEP'], ARRAY['Trombose', 'Dispneia', 'Dor torácica'], 'avançado'),

(gen_random_uuid(), 'Estado de Mal Epiléptico', 'Convulsões prolongadas ou repetidas sem recuperação da consciência.', get_category_uuid('Emergências'), ARRAY['Status epilepticus'], ARRAY['Convulsão', 'Hipóxia', 'Lesão cerebral'], 'avançado'),

-- Fisiologia
(gen_random_uuid(), 'Homeostase', 'Capacidade do organismo de manter equilíbrio interno constante.', get_category_uuid('Fisiologia'), ARRAY['Equilíbrio fisiológico'], ARRAY['Regulação', 'Feedback', 'Adaptação'], 'intermediário'),

(gen_random_uuid(), 'Metabolismo', 'Conjunto de reações químicas que ocorrem nas células para manter a vida.', get_category_uuid('Fisiologia'), ARRAY['Processos metabólicos'], ARRAY['Catabolismo', 'Anabolismo', 'ATP'], 'intermediário'),

(gen_random_uuid(), 'Perfusão', 'Passagem de fluido (sangue) através dos órgãos e tecidos.', get_category_uuid('Fisiologia'), ARRAY['Fluxo sanguíneo'], ARRAY['Isquemia', 'Hipóxia', 'Choque'], 'intermediário')

ON CONFLICT (term) DO NOTHING;

-- Remover função auxiliar
DROP FUNCTION IF EXISTS get_category_uuid(TEXT);