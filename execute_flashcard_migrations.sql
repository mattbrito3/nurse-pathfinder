-- EXECUTE ALL FLASHCARD MIGRATIONS TO REACH 270+ CARDS
-- Run this entire script in Supabase SQL Editor

-- ======================================================================
-- MIGRATION 1: PHASE 1 - Farmacologia, Anatomia, Fisiologia, Cardiologia
-- ======================================================================

DO $$
DECLARE
    farmacologia_id UUID;
    anatomia_id UUID;
    fisiologia_id UUID;
    cardiologia_id UUID;
    respiratorio_id UUID;
    neurologia_id UUID;
    endocrino_id UUID;
    geniturinario_id UUID;
    emergencias_id UUID;
    procedimentos_id UUID;
    calculos_id UUID;
    microbiologia_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO farmacologia_id FROM public.flashcard_categories WHERE name = 'Farmacologia';
    SELECT id INTO anatomia_id FROM public.flashcard_categories WHERE name = 'Anatomia';
    SELECT id INTO fisiologia_id FROM public.flashcard_categories WHERE name = 'Fisiologia';
    SELECT id INTO cardiologia_id FROM public.flashcard_categories WHERE name = 'Cardiologia';
    SELECT id INTO respiratorio_id FROM public.flashcard_categories WHERE name = 'Respiratório';
    SELECT id INTO neurologia_id FROM public.flashcard_categories WHERE name = 'Neurologia';
    SELECT id INTO endocrino_id FROM public.flashcard_categories WHERE name = 'Endócrino';
    SELECT id INTO geniturinario_id FROM public.flashcard_categories WHERE name = 'Geniturinário';
    SELECT id INTO emergencias_id FROM public.flashcard_categories WHERE name = 'Emergências';
    SELECT id INTO procedimentos_id FROM public.flashcard_categories WHERE name = 'Procedimentos';
    SELECT id INTO calculos_id FROM public.flashcard_categories WHERE name = 'Cálculos';
    SELECT id INTO microbiologia_id FROM public.flashcard_categories WHERE name = 'Microbiologia';

    -- FARMACOLOGIA EXPANSION (25 additional cards)
    INSERT INTO public.flashcards (category_id, front, back, difficulty_level, is_public, tags) VALUES
    (farmacologia_id, 'Mecanismo de ação da Morfina', 'Agonista de receptores opioides μ (mu), δ (delta) e κ (kappa), principalmente μ no SNC', 3, true, ARRAY['morfina', 'opioide', 'analgesia']),
    (farmacologia_id, 'Antídoto para intoxicação por Morfina', 'Naloxona (Narcan) 0,4-2mg IV, pode repetir a cada 2-3 minutos', 4, true, ARRAY['naloxona', 'antídoto', 'opioide']),
    (farmacologia_id, 'Dose de Adrenalina na parada cardíaca', '1mg (1mL de 1:1000) IV/IO a cada 3-5 minutos durante RCP', 3, true, ARRAY['adrenalina', 'epinefrina', 'parada-cardíaca']),
    (farmacologia_id, 'Efeitos colaterais da Warfarina', 'Sangramento, necrose cutânea, teratogenicidade, interações medicamentosas', 3, true, ARRAY['warfarina', 'anticoagulante', 'sangramento']),
    (farmacologia_id, 'Monitorização da Warfarina', 'INR (International Normalized Ratio), meta terapêutica: 2,0-3,0 para maioria das indicações', 3, true, ARRAY['warfarina', 'inr', 'monitorização']),
    (farmacologia_id, 'Dose de Heparina para TVP', 'Bolus: 80UI/kg IV + infusão 18UI/kg/h, ajustar conforme TTPA', 4, true, ARRAY['heparina', 'tvp', 'anticoagulação']),
    (farmacologia_id, 'Diferença entre Heparina e Enoxaparina', 'Heparina: IV, monitorização TTPA | Enoxaparina: SC, dose fixa, sem monitorização', 3, true, ARRAY['heparina', 'enoxaparina', 'anticoagulante']),
    (farmacologia_id, 'Dose de Furosemida em edema agudo pulmonar', '40-80mg IV em bolus, pode repetir em 1-2h se necessário', 3, true, ARRAY['furosemida', 'diurético', 'edema-agudo']),
    (farmacologia_id, 'Contraindicações da Metformina', 'Insuficiência renal (TFG <30), insuficiência hepática, acidose, desidratação', 2, true, ARRAY['metformina', 'diabetes', 'contraindicações']),
    (farmacologia_id, 'Efeito colateral grave da Metformina', 'Acidose láctica (raro mas grave), especialmente em insuficiência renal', 3, true, ARRAY['metformina', 'acidose-láctica', 'efeito-adverso']),
    (farmacologia_id, 'Dose inicial de Insulina regular em cetoacidose', '0,1UI/kg/h em infusão contínua IV após bolus de 0,1UI/kg', 4, true, ARRAY['insulina', 'cetoacidose', 'emergência']),
    (farmacologia_id, 'Tipos de Insulina por tempo de ação', 'Ultrarrápida (Lispro): 15min | Rápida (Regular): 30min | Intermediária (NPH): 2h | Lenta (Glargina): 2-4h', 3, true, ARRAY['insulina', 'tipos', 'farmacocinética']),
    (farmacologia_id, 'Dose de Amiodarona em arritmia ventricular', 'Bolus: 150mg IV em 10min + infusão 1mg/min por 6h, depois 0,5mg/min', 4, true, ARRAY['amiodarona', 'arritmia', 'ventricular']),
    (farmacologia_id, 'Efeitos colaterais da Amiodarona', 'Toxicidade pulmonar, tireoidiana, hepática, fotossensibilidade, depósitos corneanos', 3, true, ARRAY['amiodarona', 'toxicidade', 'efeitos-adversos']),
    (farmacologia_id, 'Dose de Nitroglicerina sublingual', '0,4mg SL, pode repetir a cada 5min até 3 doses para angina', 2, true, ARRAY['nitroglicerina', 'angina', 'sublingual']),
    (farmacologia_id, 'Contraindicação absoluta da Nitroglicerina', 'Uso de inibidores de PDE5 (sildenafila) nas últimas 24-48h - risco de hipotensão grave', 3, true, ARRAY['nitroglicerina', 'sildenafila', 'contraindicação']),
    (farmacologia_id, 'Dose de Captopril para hipertensão', 'Inicial: 12,5-25mg VO 2-3x/dia, máximo: 150mg/dia dividido', 2, true, ARRAY['captopril', 'ieca', 'hipertensão']),
    (farmacologia_id, 'Efeito colateral característico dos IECAs', 'Tosse seca não produtiva (10-15% dos pacientes), por acúmulo de bradicinina', 2, true, ARRAY['ieca', 'tosse', 'bradicinina']),
    (farmacologia_id, 'Dose de Prednisona em exacerbação de asma', '40-60mg VO por 5-7 dias, não necessita desmame se uso <2 semanas', 3, true, ARRAY['prednisona', 'corticoide', 'asma']),
    (farmacologia_id, 'Diferença entre Prednisona e Prednisolona', 'Prednisona: pró-droga oral | Prednisolona: forma ativa, pode ser IV/VO', 3, true, ARRAY['prednisona', 'prednisolona', 'corticoide']),
    (farmacologia_id, 'Dose de Omeprazol para úlcera péptica', '20-40mg VO em jejum pela manhã, 30-60min antes do café', 2, true, ARRAY['omeprazol', 'ibp', 'úlcera']),
    (farmacologia_id, 'Interações do Omeprazol', 'Reduz absorção de: ferro, B12, cálcio | Aumenta efeito de: varfarina, fenitoína', 3, true, ARRAY['omeprazol', 'interações', 'absorção']),
    (farmacologia_id, 'Dose de Lorazepam para agitação', '0,5-2mg VO/IV a cada 6-8h PRN, máximo 10mg/dia', 3, true, ARRAY['lorazepam', 'benzodiazepínico', 'agitação']),
    (farmacologia_id, 'Antídoto para benzodiazepínicos', 'Flumazenil 0,2mg IV, pode repetir até 1mg total (cuidado com convulsões)', 4, true, ARRAY['flumazenil', 'benzodiazepínico', 'antídoto']),
    (farmacologia_id, 'Dose de Haloperidol para agitação psicótica', '5-10mg VO/IM, pode repetir a cada 30-60min conforme necessário', 3, true, ARRAY['haloperidol', 'antipsicótico', 'agitação']),

    -- ANATOMIA EXPANSION (20 additional cards)
    (anatomia_id, 'Ossos do crânio (8 principais)', 'Frontal, Parietais (2), Temporais (2), Occipital, Etmoide, Esfenoide', 2, true, ARRAY['crânio', 'ossos', 'neuroanatomia']),
    (anatomia_id, 'Músculos da respiração (inspiração)', 'Diafragma (principal), intercostais externos, escalenos, esternocleidomastoideo', 2, true, ARRAY['respiração', 'músculos', 'inspiração']),
    (anatomia_id, 'Músculos da respiração (expiração forçada)', 'Intercostais internos, músculos abdominais (reto, oblíquos, transverso)', 2, true, ARRAY['respiração', 'expiração', 'músculos-abdominais']),
    (anatomia_id, 'Segmentos do intestino delgado', 'Duodeno (25cm), Jejuno (2,5m), Íleo (3,6m) - total ~6m', 2, true, ARRAY['intestino-delgado', 'segmentos', 'digestão']),
    (anatomia_id, 'Partes do estômago', 'Fundo, Corpo, Antro, Canal pilórico | Curvaturas: menor e maior', 2, true, ARRAY['estômago', 'anatomia', 'digestão']),
    (anatomia_id, 'Válvulas venosas e sua função', 'Impedem refluxo sanguíneo, mais numerosas em MMII, auxiliam retorno venoso', 2, true, ARRAY['válvulas', 'veias', 'retorno-venoso']),
    (anatomia_id, 'Lobos pulmonares', 'Pulmão direito: 3 lobos (superior, médio, inferior) | Pulmão esquerdo: 2 lobos (superior, inferior)', 1, true, ARRAY['pulmões', 'lobos', 'respiratório']),
    (anatomia_id, 'Estrutura do néfron', 'Corpúsculo renal (glomérulo + cápsula de Bowman) + túbulos (contorcido proximal, alça de Henle, contorcido distal)', 3, true, ARRAY['néfron', 'rim', 'filtração']),
    (anatomia_id, 'Camadas do coração', 'Epicárdio (externa), Miocárdio (média/muscular), Endocárdio (interna)', 2, true, ARRAY['coração', 'camadas', 'anatomia-cardíaca']),
    (anatomia_id, 'Artérias coronárias principais', 'Artéria coronária direita (ACD) e Artéria coronária esquerda (ACE: descendente anterior + circunflexa)', 2, true, ARRAY['coronárias', 'irrigação', 'coração']),
    (anatomia_id, 'Músculos do assoalho pélvico', 'Levantador do ânus (pubococcígeo, puboretal, iliococcígeo) e coccígeo', 3, true, ARRAY['assoalho-pélvico', 'músculos', 'pelve']),
    (anatomia_id, 'Ossos da pelve', 'Ílio, Ísquio, Púbis (formam o osso do quadril) + Sacro + Cóccix', 2, true, ARRAY['pelve', 'ossos', 'quadril']),
    (anatomia_id, 'Nervos cranianos motores puros', 'III (Oculomotor), IV (Troclear), VI (Abducente), XI (Acessório), XII (Hipoglosso)', 3, true, ARRAY['nervos-cranianos', 'motores', 'neurologia']),
    (anatomia_id, 'Nervos cranianos sensitivos puros', 'I (Olfatório), II (Óptico), VIII (Vestibulococlear)', 3, true, ARRAY['nervos-cranianos', 'sensitivos', 'neurologia']),
    (anatomia_id, 'Linfonodos superficiais palpáveis', 'Cervicais, supraclaviculares, axilares, epitrocleares, inguinais', 2, true, ARRAY['linfonodos', 'palpação', 'exame-físico']),
    (anatomia_id, 'Músculos do core', 'Diafragma, multífidos, transverso do abdome, assoalho pélvico', 2, true, ARRAY['core', 'músculos', 'estabilização']),
    (anatomia_id, 'Articulações sinoviais tipos', 'Esferóidea (ombro), gínglimo (cotovelo), pivô (radioulnar), selar (CMC polegar)', 3, true, ARRAY['articulações', 'sinoviais', 'movimento']),
    (anatomia_id, 'Plexos nervosos principais', 'Cervical (C1-C4), Braquial (C5-T1), Lombar (L1-L4), Sacral (L4-S4)', 3, true, ARRAY['plexos', 'nervos', 'inervação']),
    (anatomia_id, 'Músculos do manguito rotador', 'Supraespinhal, Infraespinhal, Redondo menor, Subescapular (SITS)', 2, true, ARRAY['manguito-rotador', 'ombro', 'estabilização']),
    (anatomia_id, 'Fáscias do pescoço', 'Superficial, cervical profunda (investe músculos), pré-vertebral (músculos profundos)', 4, true, ARRAY['fáscias', 'pescoço', 'anatomia-cervical']),

    -- FISIOLOGIA EXPANSION (20 additional cards)
    (fisiologia_id, 'Fases do potencial de ação cardíaco', 'Fase 0: despolarização (Na+), 1: repolarização inicial (K+), 2: platô (Ca2+), 3: repolarização (K+), 4: repouso', 4, true, ARRAY['potencial-ação', 'coração', 'eletrofisiologia']),
    (fisiologia_id, 'Regulação da pressão arterial', 'Débito cardíaco × Resistência vascular periférica | Regulação: SNA, SRAA, hormônios', 3, true, ARRAY['pressão-arterial', 'regulação', 'fisiologia-cardiovascular']),
    (fisiologia_id, 'Curva de dissociação da oxihemoglobina', 'Sigmoidal, desvia esquerda: ↑pH, ↓temperatura, ↓2,3-DPG | Direita: ↓pH, ↑temperatura, ↑2,3-DPG', 4, true, ARRAY['oxihemoglobina', 'transporte-oxigênio', 'curva-dissociação']),
    (fisiologia_id, 'Mecanismo da filtração glomerular', 'Pressão hidrostática glomerular - pressão oncótica - pressão cápsula Bowman = pressão filtração efetiva', 3, true, ARRAY['filtração-glomerular', 'rim', 'pressões']),
    (fisiologia_id, 'Hormônios do eixo hipotálamo-hipófise', 'ADH, Ocitocina (neuro-hipófise) | GH, ACTH, TSH, FSH, LH, Prolactina (adeno-hipófise)', 3, true, ARRAY['hipófise', 'hormônios', 'eixo-neuroendócrino']),
    (fisiologia_id, 'Reflexo barorreceptor', 'PA↑ → barorreceptores→ bulbo → ↓SNA simpático + ↑SNA parassimpático → ↓FC, ↓contratilidade, ↓PA', 3, true, ARRAY['barorreceptor', 'pressão-arterial', 'reflexo']),
    (fisiologia_id, 'Mecanismo da contração muscular', 'Ca2+ liga troponina C → move tropomiosina → exposição sítios ativos → ligação actina-miosina → contração', 3, true, ARRAY['contração-muscular', 'cálcio', 'actina-miosina']),
    (fisiologia_id, 'Regulação do equilíbrio ácido-base', 'Pulmões: eliminação CO2 (resposta rápida) | Rins: excreção H+, reabsorção HCO3- (resposta lenta)', 3, true, ARRAY['equilíbrio-ácido-base', 'pulmões', 'rins']),
    (fisiologia_id, 'Fases do ciclo menstrual', 'Menstrual (1-5), Folicular (1-14), Ovulatória (14), Lútea (15-28)', 2, true, ARRAY['ciclo-menstrual', 'fases', 'reprodução']),
    (fisiologia_id, 'Hormônios do ciclo menstrual', 'FSH, LH (hipófise) | Estradiol, Progesterona (ovários) | Feedback positivo (meio do ciclo) e negativo', 3, true, ARRAY['hormônios', 'ciclo-menstrual', 'feedback']),
    (fisiologia_id, 'Mecanismo da digestão de proteínas', 'Estômago: pepsina | Pâncreas: tripsina, quimotripsina | Intestino: peptidases → aminoácidos', 3, true, ARRAY['digestão', 'proteínas', 'enzimas']),
    (fisiologia_id, 'Absorção de ferro', 'Fe3+ → Fe2+ (ácido gástrico) → absorção duodeno → transferrina → depósitos (ferritina)', 3, true, ARRAY['ferro', 'absorção', 'anemia']),
    (fisiologia_id, 'Regulação da glicemia', 'Insulina: ↓glicemia | Glucagon, cortisol, GH, adrenalina: ↑glicemia', 2, true, ARRAY['glicemia', 'insulina', 'hormônios']),
    (fisiologia_id, 'Fases do sono', 'NREM: N1 (transição), N2 (sono leve), N3 (sono profundo) | REM: sono paradoxal, sonhos', 2, true, ARRAY['sono', 'fases', 'nrem-rem']),
    (fisiologia_id, 'Regulação da temperatura corporal', 'Hipotálamo: termostato | Calor: vasodilatação, sudorese | Frio: vasoconstrição, tremor, arrepio', 2, true, ARRAY['temperatura', 'termorregulação', 'hipotálamo']),
    (fisiologia_id, 'Mecanismo da sede', 'Osmolaridade↑ ou volume↓ → osmorreceptores hipotalâmicos → liberação ADH + sensação sede', 3, true, ARRAY['sede', 'adh', 'osmolaridade']),
    (fisiologia_id, 'Cascata da coagulação (simplificada)', 'Via extrínseca (fator tecidual) + via intrínseca → via comum → protrombina→trombina → fibrinogênio→fibrina', 4, true, ARRAY['coagulação', 'hemostasia', 'trombina']),
    (fisiologia_id, 'Regulação da eritropoiese', 'Hipóxia renal → eritropoietina → medula óssea → ↑produção eritrócitos', 3, true, ARRAY['eritropoiese', 'eritropoietina', 'hipóxia']),
    (fisiologia_id, 'Mecanismo da visão', 'Luz → córnea → cristalino → retina → fotorreceptores → nervo óptico → córtex visual', 2, true, ARRAY['visão', 'retina', 'fotorreceptores']),
    (fisiologia_id, 'Regulação da função tireoidiana', 'TRH (hipotálamo) → TSH (hipófise) → T3/T4 (tireoide) → feedback negativo', 3, true, ARRAY['tireoide', 'tsh', 'feedback']),

    -- CARDIOLOGIA EXPANSION (15 additional cards)
    (cardiologia_id, 'Sinais de ICC descompensada', 'Dispneia aos esforços/repouso, ortopneia, DPN, edema MMII, ascite, estase jugular', 2, true, ARRAY['icc', 'insuficiência-cardíaca', 'descompensação']),
    (cardiologia_id, 'Classificação NYHA da ICC', 'I: sem sintomas | II: sintomas aos grandes esforços | III: sintomas aos pequenos esforços | IV: sintomas em repouso', 2, true, ARRAY['nyha', 'icc', 'classificação']),
    (cardiologia_id, 'Medicamentos para ICC crônica', 'IECA/BRA + betabloqueador + diurético + espironolactona (se FEVE <35%)', 3, true, ARRAY['icc', 'tratamento', 'medicamentos']),
    (cardiologia_id, 'Critérios para fibrilação atrial', 'ECG: ausência onda P, intervalos RR irregulares, ondas fibrilatórias', 3, true, ARRAY['fibrilação-atrial', 'ecg', 'arritmia']),
    (cardiologia_id, 'Anticoagulação em fibrilação atrial', 'CHA2DS2-VASc ≥2 (homens) ou ≥3 (mulheres): anticoagulação oral', 3, true, ARRAY['fibrilação-atrial', 'anticoagulação', 'cha2ds2vasc']),
    (cardiologia_id, 'Sinais de tamponamento cardíaco', 'Tríade de Beck: ↓PA, ↑PVC, abafamento bulhas + pulso paradoxal >10mmHg', 4, true, ARRAY['tamponamento', 'beck', 'emergência']),
    (cardiologia_id, 'Critérios de Sgarbossa para IAM em BRE', 'Elevação ST ≥1mm concordante (5pts), Depressão ST ≥1mm V1-V3 (3pts), Elevação ST ≥5mm discordante (2pts)', 4, true, ARRAY['sgarbossa', 'iam', 'bre']),
    (cardiologia_id, 'Drogas vasoativas: Dopamina', '2-5mcg/kg/min: dopaminérgico | 5-10mcg/kg/min: β1 | >10mcg/kg/min: α1 (vasoconstrição)', 4, true, ARRAY['dopamina', 'vasoativo', 'doses']),
    (cardiologia_id, 'Drogas vasoativas: Noradrenalina', 'Vasopressor potente (α1 >> β1), usar em choque distributivo, 0,1-3mcg/kg/min', 4, true, ARRAY['noradrenalina', 'vasopressor', 'choque']),
    (cardiologia_id, 'Classificação de Killip no IAM', 'I: sem ICC (6%) | II: estertores <50% (17%) | III: edema agudo (38%) | IV: choque cardiogênico (67%)', 3, true, ARRAY['killip', 'iam', 'prognóstico']),
    (cardiologia_id, 'Indicações para desfibrilação', 'FV (fibrilação ventricular) e TV sem pulso - energia: 200J bifásico', 3, true, ARRAY['desfibrilação', 'fv', 'tv-sem-pulso']),
    (cardiologia_id, 'Indicações para cardioversão elétrica', 'FA, Flutter, TV com pulso instável - energia: 100-200J sincronizada', 3, true, ARRAY['cardioversão', 'fa', 'flutter']),
    (cardiologia_id, 'Medicamentos na TV com pulso estável', '1ª linha: Amiodarona 150mg IV | 2ª linha: Lidocaína 1-1,5mg/kg IV', 3, true, ARRAY['tv', 'amiodarona', 'lidocaína']),
    (cardiologia_id, 'Sinais de dissecção aórtica', 'Dor torácica em rasgamento, diferença PA >20mmHg entre braços, sopro aórtico novo', 4, true, ARRAY['dissecção-aórtica', 'dor-torácica', 'emergência']),
    (cardiologia_id, 'Classificação da dissecção aórtica', 'Stanford A: aorta ascendente (cirúrgica) | Stanford B: aorta descendente (clínica)', 3, true, ARRAY['dissecção-aórtica', 'stanford', 'classificação']);

END $$;

-- Show phase 1 progress
SELECT 'Phase 1 completed - Farmacologia, Anatomia, Fisiologia, Cardiologia added' as status;
SELECT COUNT(*) as current_total FROM public.flashcards;