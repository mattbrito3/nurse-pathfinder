-- Migration: Populate Flashcard Initial Data
-- Description: Add categories and sample flashcards for nursing students

-- 1. Insert flashcard categories
INSERT INTO public.flashcard_categories (name, description, color, icon) VALUES
('Farmacologia', 'Medicamentos, dosagens e interações', '#DC2626', 'pill'),
('Anatomia', 'Estrutura do corpo humano', '#059669', 'heart'),
('Fisiologia', 'Funcionamento dos sistemas', '#2563EB', 'activity'),
('Cardiologia', 'Sistema cardiovascular', '#DC2626', 'heart-pulse'),
('Respiratório', 'Sistema respiratório', '#0EA5E9', 'lungs'),
('Neurologia', 'Sistema nervoso', '#7C3AED', 'brain'),
('Endócrino', 'Hormônios e metabolismo', '#EA580C', 'zap'),
('Geniturinário', 'Sistema renal e reprodutor', '#0D9488', 'droplets'),
('Emergências', 'Primeiros socorros e urgências', '#EF4444', 'alert-triangle'),
('Procedimentos', 'Técnicas de enfermagem', '#6366F1', 'stethoscope'),
('Cálculos', 'Dosagens e conversões', '#8B5CF6', 'calculator'),
('Microbiologia', 'Microrganismos e infecções', '#F59E0B', 'bug')
ON CONFLICT (name) DO NOTHING;

-- 2. Get category IDs for reference
DO $$
DECLARE
    farmacologia_id UUID;
    anatomia_id UUID;
    fisiologia_id UUID;
    cardiologia_id UUID;
    respiratorio_id UUID;
    neurologia_id UUID;
    endocrino_id UUID;
    emergencias_id UUID;
    procedimentos_id UUID;
    calculos_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO farmacologia_id FROM public.flashcard_categories WHERE name = 'Farmacologia';
    SELECT id INTO anatomia_id FROM public.flashcard_categories WHERE name = 'Anatomia';
    SELECT id INTO fisiologia_id FROM public.flashcard_categories WHERE name = 'Fisiologia';
    SELECT id INTO cardiologia_id FROM public.flashcard_categories WHERE name = 'Cardiologia';
    SELECT id INTO respiratorio_id FROM public.flashcard_categories WHERE name = 'Respiratório';
    SELECT id INTO neurologia_id FROM public.flashcard_categories WHERE name = 'Neurologia';
    SELECT id INTO endocrino_id FROM public.flashcard_categories WHERE name = 'Endócrino';
    SELECT id INTO emergencias_id FROM public.flashcard_categories WHERE name = 'Emergências';
    SELECT id INTO procedimentos_id FROM public.flashcard_categories WHERE name = 'Procedimentos';
    SELECT id INTO calculos_id FROM public.flashcard_categories WHERE name = 'Cálculos';

    -- 3. Insert sample flashcards for each category
    
    -- Farmacologia
    INSERT INTO public.flashcards (category_id, front, back, difficulty_level, is_public, tags) VALUES
    (farmacologia_id, 'Qual a dose usual de Paracetamol para adultos?', '500-1000mg a cada 6-8h, máximo 4g/dia', 2, true, ARRAY['paracetamol', 'analgésico', 'dose']),
    (farmacologia_id, 'Principais efeitos colaterais da Dipirona', 'Hipotensão, agranulocitose (raro), reações alérgicas', 3, true, ARRAY['dipirona', 'efeitos-colaterais']),
    (farmacologia_id, 'Via de administração mais rápida para emergências', 'Via endovenosa (IV) - ação em 1-3 minutos', 1, true, ARRAY['vias', 'emergência', 'iv']),
    (farmacologia_id, 'Antídoto para intoxicação por Paracetamol', 'N-acetilcisteína (NAC)', 4, true, ARRAY['antídoto', 'intoxicação', 'paracetamol']),
    
    -- Anatomia
    (anatomia_id, 'Quantas câmaras tem o coração humano?', '4 câmaras: 2 átrios (direito e esquerdo) e 2 ventrículos (direito e esquerdo)', 1, true, ARRAY['coração', 'câmaras', 'básico']),
    (anatomia_id, 'Onde se localiza o fígado?', 'Quadrante superior direito do abdome, abaixo do diafragma', 2, true, ARRAY['fígado', 'anatomia', 'abdome']),
    (anatomia_id, 'Quantas costelas tem o ser humano?', '24 costelas (12 pares): 7 verdadeiras, 3 falsas, 2 flutuantes', 2, true, ARRAY['costelas', 'tórax', 'esqueleto']),
    (anatomia_id, 'Principal músculo da respiração', 'Diafragma - separa tórax do abdome', 1, true, ARRAY['diafragma', 'respiração', 'músculo']),
    
    -- Fisiologia
    (fisiologia_id, 'Valores normais da pressão arterial', 'Sistólica: 90-139 mmHg / Diastólica: 60-89 mmHg', 2, true, ARRAY['pressão-arterial', 'sinais-vitais', 'normal']),
    (fisiologia_id, 'Frequência cardíaca normal em adultos', '60-100 bpm (bradicardia <60, taquicardia >100)', 1, true, ARRAY['frequência-cardíaca', 'sinais-vitais']),
    (fisiologia_id, 'Temperatura corporal normal', '36,1°C a 37,2°C (axilar) / 36,6°C a 37,7°C (oral)', 1, true, ARRAY['temperatura', 'sinais-vitais', 'febre']),
    (fisiologia_id, 'O que é homeostase?', 'Capacidade do organismo manter equilíbrio interno constante', 3, true, ARRAY['homeostase', 'equilíbrio', 'fisiologia']),
    
    -- Cardiologia
    (cardiologia_id, 'Sinais de Infarto Agudo do Miocárdio', 'Dor precordial, irradiação para braço esquerdo, sudorese, náusea, dispneia', 3, true, ARRAY['infarto', 'iam', 'sinais']),
    (cardiologia_id, 'Medicamento de escolha na parada cardíaca', 'Adrenalina 1mg IV a cada 3-5 minutos', 4, true, ARRAY['parada-cardíaca', 'adrenalina', 'emergência']),
    (cardiologia_id, 'Sequência do BLS (Suporte Básico de Vida)', 'C-A-B: Compressões, Abertura de vias aéreas, Ventilação', 3, true, ARRAY['bls', 'rcp', 'emergência']),
    
    -- Respiratório
    (respiratorio_id, 'Frequência respiratória normal do adulto', '12-20 irpm (incursões respiratórias por minuto)', 1, true, ARRAY['frequência-respiratória', 'sinais-vitais']),
    (respiratorio_id, 'Sinais de insuficiência respiratória', 'Dispneia, cianose, uso de musculatura acessória, tiragem', 2, true, ARRAY['insuficiência-respiratória', 'dispneia', 'cianose']),
    (respiratorio_id, 'Posição ideal para paciente dispneico', 'Fowler (cabeceira elevada 45-90°) ou ortopneica', 2, true, ARRAY['posicionamento', 'dispneia', 'fowler']),
    
    -- Neurologia
    (neurologia_id, 'Componentes da Escala de Coma de Glasgow', 'Abertura ocular (4pts) + Resposta verbal (5pts) + Resposta motora (6pts) = 15 total', 3, true, ARRAY['glasgow', 'coma', 'neurologia']),
    (neurologia_id, 'Sinais de hipertensão intracraniana', 'Cefaleia, vômitos em jato, alteração do nível de consciência, bradicardia', 4, true, ARRAY['hipertensão-intracraniana', 'sinais', 'neurologia']),
    
    -- Endócrino
    (endocrino_id, 'Valores normais da glicemia', 'Jejum: 70-99 mg/dL / Pós-prandial: <140 mg/dL', 2, true, ARRAY['glicemia', 'diabetes', 'normal']),
    (endocrino_id, 'Sinais de hipoglicemia', 'Sudorese, tremores, taquicardia, confusão mental, fome', 2, true, ARRAY['hipoglicemia', 'sinais', 'diabetes']),
    
    -- Emergências
    (emergencias_id, 'Prioridades no atendimento de emergência', 'ABCDE: Airway, Breathing, Circulation, Disability, Exposure', 3, true, ARRAY['abcde', 'emergência', 'prioridades']),
    (emergencias_id, 'Manobra de Heimlich em adultos', 'Compressões abdominais súbitas para cima, entre umbigo e apêndice xifoide', 3, true, ARRAY['heimlich', 'engasgo', 'emergência']),
    
    -- Procedimentos
    (procedimentos_id, 'Cinco certos da administração de medicamentos', '1.Medicamento certo 2.Paciente certo 3.Dose certa 4.Via certa 5.Horário certo', 2, true, ARRAY['cinco-certos', 'medicação', 'segurança']),
    (procedimentos_id, 'Técnica correta para lavagem das mãos', '40-60 segundos com água e sabão ou 20-30 segundos com álcool gel', 1, true, ARRAY['lavagem-mãos', 'higiene', 'infecção']),
    
    -- Cálculos
    (calculos_id, 'Como calcular dosagem por peso?', 'Dose = Peso (kg) × Dose por kg prescrita', 2, true, ARRAY['dosagem', 'peso', 'cálculo']),
    (calculos_id, 'Fórmula para calcular gotejamento', 'Gotas/min = (Volume × 20) / Tempo em minutos', 3, true, ARRAY['gotejamento', 'infusão', 'cálculo']);
    
END $$;

-- 4. Show summary of inserted data
SELECT 
    'Categorias inseridas: ' || COUNT(*) as summary
FROM public.flashcard_categories;

SELECT 
    'Flashcards inseridos: ' || COUNT(*) as summary  
FROM public.flashcards;