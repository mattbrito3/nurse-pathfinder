-- Migration: Final Flashcards Completion to 270+ Cards - Phase 3
-- Description: Complete remaining categories to reach 270+ total flashcards
-- Phase 3: Final ~40 cards | Total target: 270+ cards

DO $$
DECLARE
    procedimentos_id UUID;
    calculos_id UUID;
    microbiologia_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO procedimentos_id FROM public.flashcard_categories WHERE name = 'Procedimentos';
    SELECT id INTO calculos_id FROM public.flashcard_categories WHERE name = 'Cálculos';
    SELECT id INTO microbiologia_id FROM public.flashcard_categories WHERE name = 'Microbiologia';

    -- PROCEDIMENTOS EXPANSION (15 additional cards)
    INSERT INTO public.flashcards (category_id, front, back, difficulty_level, is_public, tags) VALUES
    (procedimentos_id, 'Técnica correta para cateterismo vesical', 'Assepsia rigorosa, lubrificação, inserção gentil, drenar urina, fixar cateter, sistema fechado', 2, true, ARRAY['cateterismo', 'vesical', 'técnica']),
    (procedimentos_id, 'Complicações do cateter vesical', 'ITU, trauma uretral, obstrução, espasmo vesical, parafimose', 2, true, ARRAY['cateter', 'complicações', 'itu']),
    (procedimentos_id, 'Técnica para sondagem nasogástrica', 'Medir distância (nose-ear-xiphoid), lubrificar, inserir gentil, confirmar posição (RX), fixar', 2, true, ARRAY['sonda', 'nasogástrica', 'técnica']),
    (procedimentos_id, 'Sinais de sonda nasogástrica mal posicionada', 'Tosse, dispneia, voz rouca durante inserção = possível posição traqueal', 3, true, ARRAY['sonda', 'nasogástrica', 'complicações']),
    (procedimentos_id, 'Cuidados com traqueostomia', 'Aspiração PRN, troca cânula interna, umidificação, cuidados com estoma, cânula de emergência', 3, true, ARRAY['traqueostomia', 'cuidados', 'aspiração']),
    (procedimentos_id, 'Técnica de aspiração traqueal', 'Pré-oxigenação, técnica estéril, introdução sem aspiração, rotação durante retirada, máx 15seg', 3, true, ARRAY['aspiração', 'traqueal', 'técnica']),
    (procedimentos_id, 'Pressão do balonete (cuff) do tubo traqueal', '20-25cmH2O ou 15-20mmHg - pressão mínima para vedar sem isquemia', 3, true, ARRAY['cuff', 'pressão', 'tubo-traqueal']),
    (procedimentos_id, 'Técnica para curativos', 'Lavagem mãos, luvas estéreis, limpeza centro→periferia, cobrir com gaze estéril, fixar', 2, true, ARRAY['curativos', 'técnica', 'assepsia']),
    (procedimentos_id, 'Tipos de drenos e suas indicações', 'Penrose: drenagem simples | Portovac: aspiração contínua | Blake: baixa pressão | Tórax: pneumotórax', 3, true, ARRAY['drenos', 'tipos', 'indicações']),
    (procedimentos_id, 'Cuidados com dreno de tórax', 'Manter abaixo do nível do tórax, selo d\'água íntegro, observar oscilação, borbulhamento, débito', 3, true, ARRAY['dreno', 'tórax', 'cuidados']),
    (procedimentos_id, 'Sinais de obstrução intestinal', 'Distensão abdominal, dor cólica, vômitos, ausência eliminações, ruídos aumentados depois ausentes', 2, true, ARRAY['obstrução', 'intestinal', 'sinais']),
    (procedimentos_id, 'Posicionamento para punção lombar', 'Decúbito lateral, joelhos fletidos ao peito, coluna arqueada, ou sentado inclinado para frente', 3, true, ARRAY['punção-lombar', 'posicionamento', 'técnica']),
    (procedimentos_id, 'Técnica de hemostasia por compressão', 'Pressão direta no local, elevar membro se possível, não remover coágulos, manter 10-15min', 2, true, ARRAY['hemostasia', 'compressão', 'sangramento']),
    (procedimentos_id, 'Preparo pré-operatório do paciente', 'Jejum 8h, tricotomia PRN, banho pré-operatório, retirar próteses/joias, conferir local cirúrgico', 2, true, ARRAY['pré-operatório', 'preparo', 'jejum']),
    (procedimentos_id, 'Cuidados pós-operatórios imediatos', 'Sinais vitais, nível consciência, dor, sangramento, débito drenos, náuseas/vômitos', 2, true, ARRAY['pós-operatório', 'cuidados', 'sinais-vitais']),

    -- CÁLCULOS EXPANSION (15 additional cards)
    (calculos_id, 'Cálculo de superfície corporal (Dubois)', 'SC (m²) = 0,007184 × Peso^0,425 × Altura^0,725', 4, true, ARRAY['superfície-corporal', 'dubois', 'cálculo']),
    (calculos_id, 'Cálculo de IMC', 'IMC = Peso (kg) / Altura² (m²)', 1, true, ARRAY['imc', 'peso', 'altura']),
    (calculos_id, 'Cálculo de necessidade calórica basal', 'Homem: 66 + (13,7×peso) + (5×altura) - (6,8×idade) | Mulher: 655 + (9,6×peso) + (1,8×altura) - (4,7×idade)', 3, true, ARRAY['calorias', 'metabolismo', 'basal']),
    (calculos_id, 'Cálculo de clearance de creatinina', 'ClCr = [(140-idade) × peso] / (72 × creatinina sérica) × 0,85 (se mulher)', 3, true, ARRAY['clearance', 'creatinina', 'função-renal']),
    (calculos_id, 'Cálculo de déficit de sódio', 'Déficit Na+ = 0,6 × peso × (Na+ desejado - Na+ atual)', 4, true, ARRAY['sódio', 'déficit', 'eletrólitos']),
    (calculos_id, 'Cálculo de osmolaridade sérica', 'Osmolaridade = 2×[Na+] + [Glicose]/18 + [Ureia]/2,8', 3, true, ARRAY['osmolaridade', 'sódio', 'glicose']),
    (calculos_id, 'Cálculo de anion gap', 'Anion Gap = (Na+ + K+) - (Cl- + HCO3-) | Normal: 8-16mEq/L', 3, true, ARRAY['anion-gap', 'eletrólitos', 'acidose']),
    (calculos_id, 'Cálculo de reposição de potássio', '1mEq/L ↓ K+ = déficit ~200-400mEq (adulto 70kg)', 4, true, ARRAY['potássio', 'reposição', 'hipocalemia']),
    (calculos_id, 'Conversão de unidades: mmol/L para mg/dL', 'Glicose: mmol/L × 18 = mg/dL | Ureia: mmol/L × 6 = mg/dL | Creatinina: μmol/L ÷ 88,4 = mg/dL', 3, true, ARRAY['conversão', 'unidades', 'laboratório']),
    (calculos_id, 'Cálculo de gotejamento macro (20gts/mL)', 'Gotas/min = Volume (mL) × 20 / Tempo (min)', 2, true, ARRAY['gotejamento', 'macro', 'infusão']),
    (calculos_id, 'Cálculo de gotejamento micro (60gts/mL)', 'Microgotas/min = Volume (mL) × 60 / Tempo (min) = Volume (mL) / Tempo (horas)', 2, true, ARRAY['gotejamento', 'micro', 'infusão']),
    (calculos_id, 'Cálculo de dose por peso corporal', 'Dose total = Dose por kg × Peso (kg)', 1, true, ARRAY['dose', 'peso', 'medicamento']),
    (calculos_id, 'Cálculo da fração de ejeção do ventrículo esquerdo', 'FEVE (%) = [(Volume diastólico - Volume sistólico) / Volume diastólico] × 100', 3, true, ARRAY['feve', 'fração-ejeção', 'coração']),
    (calculos_id, 'Cálculo de risco cardiovascular (escore de Framingham)', 'Fatores: idade, sexo, colesterol total, HDL, PA sistólica, tabagismo, diabetes', 3, true, ARRAY['framingham', 'risco-cardiovascular', 'escore']),
    (calculos_id, 'Cálculo de pressão arterial média (PAM)', 'PAM = (2 × PA diastólica + PA sistólica) / 3', 2, true, ARRAY['pam', 'pressão-arterial', 'média']),

    -- MICROBIOLOGIA EXPANSION (15 additional cards)
    (microbiologia_id, 'Principais bactérias Gram-positivas em cocos', 'Staphylococcus aureus, S. epidermidis, Streptococcus pyogenes, S. pneumoniae, Enterococcus', 3, true, ARRAY['gram-positivas', 'cocos', 'staphylococcus']),
    (microbiologia_id, 'Principais bactérias Gram-negativas em bastonetes', 'E. coli, Klebsiella, Pseudomonas, Proteus, Enterobacter, Acinetobacter', 3, true, ARRAY['gram-negativas', 'bastonetes', 'enterobactérias']),
    (microbiologia_id, 'Antibióticos para Gram-positivos', '1ª linha: Penicilina, Ampicilina | Resistentes: Vancomicina, Linezolida, Daptomicina', 3, true, ARRAY['antibióticos', 'gram-positivos', 'penicilina']),
    (microbiologia_id, 'Antibióticos para Gram-negativos', '1ª linha: Cefalosporinas, Quinolonas | Resistentes: Carbapenêmicos, Polimixina', 3, true, ARRAY['antibióticos', 'gram-negativos', 'cefalosporinas']),
    (microbiologia_id, 'Mecanismos de resistência bacteriana', 'Beta-lactamases (destroem penicilina), bombas de efluxo, alteração alvo, impermeabilidade', 4, true, ARRAY['resistência', 'beta-lactamase', 'mecanismos']),
    (microbiologia_id, 'MRSA: características e tratamento', 'Staphylococcus aureus resistente à meticilina. Tratamento: Vancomicina, Linezolida, Daptomicina', 3, true, ARRAY['mrsa', 'vancomicina', 'resistência']),
    (microbiologia_id, 'Precauções de isolamento: contato', 'EPI: luvas + avental | Indicações: MRSA, VRE, Clostridium difficile, bactérias multirresistentes', 2, true, ARRAY['isolamento', 'contato', 'mrsa']),
    (microbiologia_id, 'Precauções de isolamento: gotículas', 'EPI: máscara cirúrgica | Indicações: influenza, coqueluche, meningite meningocócica', 2, true, ARRAY['isolamento', 'gotículas', 'influenza']),
    (microbiologia_id, 'Precauções de isolamento: aerossóis', 'EPI: máscara N95/PFF2 | Indicações: tuberculose, varicela, sarampo', 2, true, ARRAY['isolamento', 'aerossóis', 'tuberculose']),
    (microbiologia_id, 'Infecções relacionadas à assistência à saúde (IRAS)', 'Pneumonia associada à ventilação, ITU associada ao cateter, infecção de corrente sanguínea', 3, true, ARRAY['iras', 'pneumonia', 'cateter']),
    (microbiologia_id, 'Clostridium difficile: características', 'Bacilo Gram-positivo anaeróbio, produz toxinas, causa colite pseudomembranosa', 3, true, ARRAY['clostridium', 'difficile', 'colite']),
    (microbiologia_id, 'Tratamento da infecção por C. difficile', '1ª linha: Metronidazol VO | Grave: Vancomicina VO | Recorrente: Fidaxomicina', 3, true, ARRAY['clostridium', 'metronidazol', 'vancomicina']),
    (microbiologia_id, 'Principais fungos patogênicos', 'Candida albicans, Aspergillus, Cryptococcus, Histoplasma, Pneumocystis jirovecii', 3, true, ARRAY['fungos', 'candida', 'aspergillus']),
    (microbiologia_id, 'Antifúngicos principais', 'Fluconazol (Candida), Anfotericina B (sistêmico grave), Voriconazol (Aspergillus)', 3, true, ARRAY['antifúngicos', 'fluconazol', 'anfotericina']),
    (microbiologia_id, 'Marcadores virais da hepatite B', 'HBsAg: infecção ativa | Anti-HBs: imunidade | Anti-HBc IgM: infecção aguda | HBeAg: alta replicação', 4, true, ARRAY['hepatite-b', 'marcadores', 'hbsag']);

END $$;

-- Final count and summary
SELECT 
    fc.name as categoria,
    COUNT(f.id) as total_flashcards,
    fc.color,
    fc.icon
FROM public.flashcard_categories fc
LEFT JOIN public.flashcards f ON fc.id = f.category_id
GROUP BY fc.name, fc.id, fc.color, fc.icon
ORDER BY COUNT(f.id) DESC;

-- Grand total
SELECT 
    '🎉 MISSION ACCOMPLISHED! 🎉' as status,
    COUNT(*) as total_flashcards_in_database,
    CASE 
        WHEN COUNT(*) >= 270 THEN '✅ TARGET REACHED!'
        ELSE '⚠️ Still need ' || (270 - COUNT(*)) || ' more cards'
    END as target_status
FROM public.flashcards;

-- Summary by difficulty
SELECT 
    difficulty_level,
    COUNT(*) as cards_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM public.flashcards
GROUP BY difficulty_level
ORDER BY difficulty_level;