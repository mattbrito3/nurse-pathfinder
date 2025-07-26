-- EXECUTE ALL FLASHCARD EXPANSIONS TO REACH 270+ CARDS
-- Copy and paste this entire script in Supabase SQL Editor

-- Check current count first
SELECT 'BEFORE EXPANSION: ' || COUNT(*) || ' flashcards' as status FROM public.flashcards;

-- Execute all expansions in one go
INSERT INTO public.flashcards (category_id, front, back, difficulty_level, is_public, tags)
SELECT 
    fc.id as category_id,
    cards.front,
    cards.back,
    cards.difficulty_level,
    cards.is_public,
    cards.tags
FROM public.flashcard_categories fc
CROSS JOIN (
    -- FARMACOLOGIA (25 cards)
    VALUES 
    ('Farmacologia', 'Mecanismo de ação da Morfina', 'Agonista de receptores opioides μ (mu), δ (delta) e κ (kappa), principalmente μ no SNC', 3, true, ARRAY['morfina', 'opioide', 'analgesia']),
    ('Farmacologia', 'Antídoto para intoxicação por Morfina', 'Naloxona (Narcan) 0,4-2mg IV, pode repetir a cada 2-3 minutos', 4, true, ARRAY['naloxona', 'antídoto', 'opioide']),
    ('Farmacologia', 'Dose de Adrenalina na parada cardíaca', '1mg (1mL de 1:1000) IV/IO a cada 3-5 minutos durante RCP', 3, true, ARRAY['adrenalina', 'epinefrina', 'parada-cardíaca']),
    ('Farmacologia', 'Efeitos colaterais da Warfarina', 'Sangramento, necrose cutânea, teratogenicidade, interações medicamentosas', 3, true, ARRAY['warfarina', 'anticoagulante', 'sangramento']),
    ('Farmacologia', 'Monitorização da Warfarina', 'INR (International Normalized Ratio), meta terapêutica: 2,0-3,0 para maioria das indicações', 3, true, ARRAY['warfarina', 'inr', 'monitorização']),
    ('Farmacologia', 'Dose de Heparina para TVP', 'Bolus: 80UI/kg IV + infusão 18UI/kg/h, ajustar conforme TTPA', 4, true, ARRAY['heparina', 'tvp', 'anticoagulação']),
    ('Farmacologia', 'Diferença entre Heparina e Enoxaparina', 'Heparina: IV, monitorização TTPA | Enoxaparina: SC, dose fixa, sem monitorização', 3, true, ARRAY['heparina', 'enoxaparina', 'anticoagulante']),
    ('Farmacologia', 'Dose de Furosemida em edema agudo pulmonar', '40-80mg IV em bolus, pode repetir em 1-2h se necessário', 3, true, ARRAY['furosemida', 'diurético', 'edema-agudo']),
    ('Farmacologia', 'Contraindicações da Metformina', 'Insuficiência renal (TFG <30), insuficiência hepática, acidose, desidratação', 2, true, ARRAY['metformina', 'diabetes', 'contraindicações']),
    ('Farmacologia', 'Efeito colateral grave da Metformina', 'Acidose láctica (raro mas grave), especialmente em insuficiência renal', 3, true, ARRAY['metformina', 'acidose-láctica', 'efeito-adverso']),
    ('Farmacologia', 'Dose inicial de Insulina regular em cetoacidose', '0,1UI/kg/h em infusão contínua IV após bolus de 0,1UI/kg', 4, true, ARRAY['insulina', 'cetoacidose', 'emergência']),
    ('Farmacologia', 'Tipos de Insulina por tempo de ação', 'Ultrarrápida (Lispro): 15min | Rápida (Regular): 30min | Intermediária (NPH): 2h | Lenta (Glargina): 2-4h', 3, true, ARRAY['insulina', 'tipos', 'farmacocinética']),
    ('Farmacologia', 'Dose de Amiodarona em arritmia ventricular', 'Bolus: 150mg IV em 10min + infusão 1mg/min por 6h, depois 0,5mg/min', 4, true, ARRAY['amiodarona', 'arritmia', 'ventricular']),
    ('Farmacologia', 'Efeitos colaterais da Amiodarona', 'Toxicidade pulmonar, tireoidiana, hepática, fotossensibilidade, depósitos corneanos', 3, true, ARRAY['amiodarona', 'toxicidade', 'efeitos-adversos']),
    ('Farmacologia', 'Dose de Nitroglicerina sublingual', '0,4mg SL, pode repetir a cada 5min até 3 doses para angina', 2, true, ARRAY['nitroglicerina', 'angina', 'sublingual']),
    ('Farmacologia', 'Contraindicação absoluta da Nitroglicerina', 'Uso de inibidores de PDE5 (sildenafila) nas últimas 24-48h - risco de hipotensão grave', 3, true, ARRAY['nitroglicerina', 'sildenafila', 'contraindicação']),
    ('Farmacologia', 'Dose de Captopril para hipertensão', 'Inicial: 12,5-25mg VO 2-3x/dia, máximo: 150mg/dia dividido', 2, true, ARRAY['captopril', 'ieca', 'hipertensão']),
    ('Farmacologia', 'Efeito colateral característico dos IECAs', 'Tosse seca não produtiva (10-15% dos pacientes), por acúmulo de bradicinina', 2, true, ARRAY['ieca', 'tosse', 'bradicinina']),
    ('Farmacologia', 'Dose de Prednisona em exacerbação de asma', '40-60mg VO por 5-7 dias, não necessita desmame se uso <2 semanas', 3, true, ARRAY['prednisona', 'corticoide', 'asma']),
    ('Farmacologia', 'Diferença entre Prednisona e Prednisolona', 'Prednisona: pró-droga oral | Prednisolona: forma ativa, pode ser IV/VO', 3, true, ARRAY['prednisona', 'prednisolona', 'corticoide']),
    ('Farmacologia', 'Dose de Omeprazol para úlcera péptica', '20-40mg VO em jejum pela manhã, 30-60min antes do café', 2, true, ARRAY['omeprazol', 'ibp', 'úlcera']),
    ('Farmacologia', 'Interações do Omeprazol', 'Reduz absorção de: ferro, B12, cálcio | Aumenta efeito de: varfarina, fenitoína', 3, true, ARRAY['omeprazol', 'interações', 'absorção']),
    ('Farmacologia', 'Dose de Lorazepam para agitação', '0,5-2mg VO/IV a cada 6-8h PRN, máximo 10mg/dia', 3, true, ARRAY['lorazepam', 'benzodiazepínico', 'agitação']),
    ('Farmacologia', 'Antídoto para benzodiazepínicos', 'Flumazenil 0,2mg IV, pode repetir até 1mg total (cuidado com convulsões)', 4, true, ARRAY['flumazenil', 'benzodiazepínico', 'antídoto']),
    ('Farmacologia', 'Dose de Haloperidol para agitação psicótica', '5-10mg VO/IM, pode repetir a cada 30-60min conforme necessário', 3, true, ARRAY['haloperidol', 'antipsicótico', 'agitação']),
    
    -- CARDIOLOGIA (15 cards)
    ('Cardiologia', 'Sinais de ICC descompensada', 'Dispneia aos esforços/repouso, ortopneia, DPN, edema MMII, ascite, estase jugular', 2, true, ARRAY['icc', 'insuficiência-cardíaca', 'descompensação']),
    ('Cardiologia', 'Classificação NYHA da ICC', 'I: sem sintomas | II: sintomas aos grandes esforços | III: sintomas aos pequenos esforços | IV: sintomas em repouso', 2, true, ARRAY['nyha', 'icc', 'classificação']),
    ('Cardiologia', 'Medicamentos para ICC crônica', 'IECA/BRA + betabloqueador + diurético + espironolactona (se FEVE <35%)', 3, true, ARRAY['icc', 'tratamento', 'medicamentos']),
    ('Cardiologia', 'Critérios para fibrilação atrial', 'ECG: ausência onda P, intervalos RR irregulares, ondas fibrilatórias', 3, true, ARRAY['fibrilação-atrial', 'ecg', 'arritmia']),
    ('Cardiologia', 'Anticoagulação em fibrilação atrial', 'CHA2DS2-VASc ≥2 (homens) ou ≥3 (mulheres): anticoagulação oral', 3, true, ARRAY['fibrilação-atrial', 'anticoagulação', 'cha2ds2vasc']),
    ('Cardiologia', 'Sinais de tamponamento cardíaco', 'Tríade de Beck: ↓PA, ↑PVC, abafamento bulhas + pulso paradoxal >10mmHg', 4, true, ARRAY['tamponamento', 'beck', 'emergência']),
    ('Cardiologia', 'Critérios de Sgarbossa para IAM em BRE', 'Elevação ST ≥1mm concordante (5pts), Depressão ST ≥1mm V1-V3 (3pts), Elevação ST ≥5mm discordante (2pts)', 4, true, ARRAY['sgarbossa', 'iam', 'bre']),
    ('Cardiologia', 'Drogas vasoativas: Dopamina', '2-5mcg/kg/min: dopaminérgico | 5-10mcg/kg/min: β1 | >10mcg/kg/min: α1 (vasoconstrição)', 4, true, ARRAY['dopamina', 'vasoativo', 'doses']),
    ('Cardiologia', 'Drogas vasoativas: Noradrenalina', 'Vasopressor potente (α1 >> β1), usar em choque distributivo, 0,1-3mcg/kg/min', 4, true, ARRAY['noradrenalina', 'vasopressor', 'choque']),
    ('Cardiologia', 'Classificação de Killip no IAM', 'I: sem ICC (6%) | II: estertores <50% (17%) | III: edema agudo (38%) | IV: choque cardiogênico (67%)', 3, true, ARRAY['killip', 'iam', 'prognóstico']),
    ('Cardiologia', 'Indicações para desfibrilação', 'FV (fibrilação ventricular) e TV sem pulso - energia: 200J bifásico', 3, true, ARRAY['desfibrilação', 'fv', 'tv-sem-pulso']),
    ('Cardiologia', 'Indicações para cardioversão elétrica', 'FA, Flutter, TV com pulso instável - energia: 100-200J sincronizada', 3, true, ARRAY['cardioversão', 'fa', 'flutter']),
    ('Cardiologia', 'Medicamentos na TV com pulso estável', '1ª linha: Amiodarona 150mg IV | 2ª linha: Lidocaína 1-1,5mg/kg IV', 3, true, ARRAY['tv', 'amiodarona', 'lidocaína']),
    ('Cardiologia', 'Sinais de dissecção aórtica', 'Dor torácica em rasgamento, diferença PA >20mmHg entre braços, sopro aórtico novo', 4, true, ARRAY['dissecção-aórtica', 'dor-torácica', 'emergência']),
    ('Cardiologia', 'Classificação da dissecção aórtica', 'Stanford A: aorta ascendente (cirúrgica) | Stanford B: aorta descendente (clínica)', 3, true, ARRAY['dissecção-aórtica', 'stanford', 'classificação'])
    
) as cards(category_name, front, back, difficulty_level, is_public, tags)
WHERE fc.name = cards.category_name;

-- Check final count
SELECT 'AFTER EXPANSION: ' || COUNT(*) || ' flashcards' as final_status FROM public.flashcards;

-- Show summary by category
SELECT 
    fc.name as categoria,
    COUNT(f.id) as total_flashcards
FROM public.flashcard_categories fc
LEFT JOIN public.flashcards f ON fc.id = f.category_id
GROUP BY fc.name, fc.id
ORDER BY COUNT(f.id) DESC;

SELECT 
    CASE 
        WHEN COUNT(*) >= 270 THEN '🎉 TARGET REACHED! 🎉'
        ELSE '⚠️ Still need ' || (270 - COUNT(*)) || ' more cards'
    END as mission_status,
    COUNT(*) as total_flashcards
FROM public.flashcards;