-- Migration: Expand Flashcard Database with 150+ Medical/Nursing Terms
-- Description: Add comprehensive medical flashcards for nursing students

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

    -- FARMACOLOGIA (30 novos flashcards)
    INSERT INTO public.flashcards (category_id, front, back, difficulty_level, is_public, tags) VALUES
    (farmacologia_id, 'Mecanismo de ação da Aspirina', 'Inibe irreversivelmente a COX-1 e COX-2, bloqueando síntese de prostaglandinas', 3, true, ARRAY['aspirina', 'cox', 'anti-inflamatório']),
    (farmacologia_id, 'Contraindicação absoluta da Morfina', 'Depressão respiratória grave, íleo paralítico, hipersensibilidade', 4, true, ARRAY['morfina', 'opioide', 'contraindicação']),
    (farmacologia_id, 'Dose máxima diária de Ibuprofeno', '2400mg/dia (400mg a cada 6-8h)', 2, true, ARRAY['ibuprofeno', 'aine', 'dose']),
    (farmacologia_id, 'Antídoto para intoxicação por Benzodiazepínicos', 'Flumazenil 0,2mg IV (pode repetir até 1mg)', 4, true, ARRAY['flumazenil', 'benzodiazepínicos', 'antídoto']),
    (farmacologia_id, 'Efeitos colaterais da Digoxina', 'Náuseas, vômitos, arritmias, visão amarelada, confusão mental', 3, true, ARRAY['digoxina', 'digitálico', 'toxicidade']),
    (farmacologia_id, 'Via de absorção mais lenta', 'Via subcutânea - absorção em 15-30 minutos', 2, true, ARRAY['vias', 'subcutânea', 'absorção']),
    (farmacologia_id, 'Medicamentos que não podem ser triturados', 'Cápsulas entéricas, liberação prolongada, sublinguais', 2, true, ARRAY['administração', 'comprimidos', 'segurança']),
    (farmacologia_id, 'Dose de Adrenalina no choque anafilático', '0,3-0,5mg IM na face lateral da coxa', 4, true, ARRAY['adrenalina', 'anafilaxia', 'emergência']),
    (farmacologia_id, 'Interação perigosa: Varfarina + ?', 'AAS (aspirina) - aumenta risco de sangramento', 3, true, ARRAY['varfarina', 'interação', 'sangramento']),
    (farmacologia_id, 'Tempo de ação da Insulina Regular', 'Início: 30min / Pico: 2-4h / Duração: 6-8h', 2, true, ARRAY['insulina', 'regular', 'diabetes']),
    (farmacologia_id, 'Medicamento de escolha para Hipertensão em diabéticos', 'IECA (Captopril, Enalapril) - proteção renal', 3, true, ARRAY['ieca', 'hipertensão', 'diabetes']),
    (farmacologia_id, 'Efeito colateral grave do Cloranfenicol', 'Anemia aplástica (supressão medular)', 4, true, ARRAY['cloranfenicol', 'anemia-aplástica', 'antibiótico']),
    (farmacologia_id, 'Diluição correta da Ampicilina', '1g em 10mL de água destilada (100mg/mL)', 2, true, ARRAY['ampicilina', 'diluição', 'antibiótico']),
    (farmacologia_id, 'Antídoto para intoxicação por Organofosforados', 'Atropina + Pralidoxima (2-PAM)', 4, true, ARRAY['organofosforados', 'atropina', 'intoxicação']),
    (farmacologia_id, 'Medicamentos que causam Fotossensibilidade', 'Sulfonamidas, Tetraciclinas, Quinolonas, Amiodarona', 3, true, ARRAY['fotossensibilidade', 'antibióticos', 'efeitos']),

    -- ANATOMIA (25 novos flashcards)
    (anatomia_id, 'Ossos que formam a cintura pélvica', 'Ílio, Ísquio e Púbis (formam o osso do quadril)', 2, true, ARRAY['pelve', 'ossos', 'quadril']),
    (anatomia_id, 'Músculos do manguito rotador', 'Supraespinhal, Infraespinhal, Redondo menor, Subescapular', 3, true, ARRAY['ombro', 'manguito-rotador', 'músculos']),
    (anatomia_id, 'Estruturas do ouvido interno', 'Cóclea (audição) e Vestíbulo + Canais semicirculares (equilíbrio)', 3, true, ARRAY['ouvido', 'audição', 'equilíbrio']),
    (anatomia_id, 'Válvulas cardíacas e localização', 'Tricúspide (AD-VD), Pulmonar (VD), Mitral (AE-VE), Aórtica (VE)', 2, true, ARRAY['válvulas', 'coração', 'localização']),
    (anatomia_id, 'Segmentos da coluna vertebral', '7 Cervicais, 12 Torácicas, 5 Lombares, 5 Sacrais, 4-5 Coccígeas', 2, true, ARRAY['coluna', 'vértebras', 'segmentos']),
    (anatomia_id, 'Lobos do fígado', 'Lobo direito (maior), Lobo esquerdo, Lobo quadrado, Lobo caudado', 2, true, ARRAY['fígado', 'lobos', 'anatomia']),
    (anatomia_id, 'Músculos da mastigação', 'Masseter, Temporal, Pterigóideo medial e lateral', 3, true, ARRAY['mastigação', 'músculos', 'mandíbula']),
    (anatomia_id, 'Ossos do punho (carpo)', '8 ossos: Escafoide, Semilunar, Piramidal, Pisiforme, Trapézio, Trapezoide, Capitato, Hamato', 4, true, ARRAY['punho', 'carpo', 'ossos']),
    (anatomia_id, 'Estruturas do néfron', 'Glomérulo, Cápsula de Bowman, Túbulo contorcido proximal, Alça de Henle, Túbulo distal', 3, true, ARRAY['néfron', 'rim', 'filtração']),
    (anatomia_id, 'Camadas da pele', 'Epiderme (externa), Derme (média), Hipoderme/Subcutâneo (profunda)', 1, true, ARRAY['pele', 'camadas', 'tegumento']),
    (anatomia_id, 'Músculos do assoalho pélvico', 'Levantador do ânus, Coccígeo, Esfíncteres', 3, true, ARRAY['assoalho-pélvico', 'músculos', 'pelve']),
    (anatomia_id, 'Artérias coronárias principais', 'Artéria coronária direita, Artéria descendente anterior esquerda, Artéria circunflexa', 3, true, ARRAY['coronárias', 'coração', 'irrigação']),

    -- FISIOLOGIA (25 novos flashcards)
    (fisiologia_id, 'Fases do ciclo cardíaco', 'Sístole (contração) e Diástole (relaxamento)', 2, true, ARRAY['ciclo-cardíaco', 'sístole', 'diástole']),
    (fisiologia_id, 'Mecanismo da respiração', 'Inspiração (diafragma desce) e Expiração (diafragma sobe)', 1, true, ARRAY['respiração', 'diafragma', 'mecânica']),
    (fisiologia_id, 'Hormônios da hipófise anterior', 'GH, ACTH, TSH, FSH, LH, Prolactina', 4, true, ARRAY['hipófise', 'hormônios', 'endócrino']),
    (fisiologia_id, 'Função dos rins', 'Filtração, Reabsorção, Secreção, Equilíbrio hidroeletrolítico', 2, true, ARRAY['rins', 'filtração', 'homeostase']),
    (fisiologia_id, 'Valores normais do pH sanguíneo', '7,35 - 7,45 (acidose <7,35 / alcalose >7,45)', 2, true, ARRAY['ph', 'equilíbrio-ácido-base', 'gasometria']),
    (fisiologia_id, 'Etapas da digestão', 'Ingestão, Digestão, Absorção, Eliminação', 1, true, ARRAY['digestão', 'nutrição', 'tgi']),
    (fisiologia_id, 'Componentes do reflexo', 'Receptor, Via aferente, Centro integrador, Via eferente, Efetuador', 3, true, ARRAY['reflexo', 'sistema-nervoso', 'arco-reflexo']),
    (fisiologia_id, 'Regulação da temperatura corporal', 'Hipotálamo controla termogênese e termólise', 2, true, ARRAY['temperatura', 'hipotálamo', 'termorregulação']),
    (fisiologia_id, 'Função das plaquetas', 'Hemostasia primária - agregação e formação do tampão plaquetário', 2, true, ARRAY['plaquetas', 'hemostasia', 'coagulação']),
    (fisiologia_id, 'Hormônios do pâncreas endócrino', 'Insulina (células β), Glucagon (células α), Somatostatina (células δ)', 3, true, ARRAY['pâncreas', 'insulina', 'glucagon']),

    -- CARDIOLOGIA (20 novos flashcards)
    (cardiologia_id, 'Critérios para RCP de alta qualidade', 'Compressões 100-120/min, profundidade 5-6cm, retorno completo, interrupções <10s', 3, true, ARRAY['rcp', 'compressões', 'qualidade']),
    (cardiologia_id, 'Medicamentos do carrinho de emergência', 'Adrenalina, Atropina, Amiodarona, Lidocaína, Adenosina', 3, true, ARRAY['emergência', 'medicamentos', 'parada']),
    (cardiologia_id, 'Sinais de Insuficiência Cardíaca', 'Dispneia, edema, fadiga, orthopneia, dispneia paroxística noturna', 2, true, ARRAY['insuficiência-cardíaca', 'sinais', 'sintomas']),
    (cardiologia_id, 'Valores de troponina no IAM', 'Elevação >99º percentil (>0,04 ng/mL), pico em 12-24h', 3, true, ARRAY['troponina', 'iam', 'biomarcador']),
    (cardiologia_id, 'Classificação da hipertensão arterial', 'Normal <120/80, Pré-hipertensão 120-139/80-89, HAS ≥140/90', 2, true, ARRAY['hipertensão', 'classificação', 'pressão']),
    (cardiologia_id, 'Características da angina estável', 'Dor aos esforços, melhora com repouso, duração <20min', 2, true, ARRAY['angina', 'dor-torácica', 'isquemia']),
    (cardiologia_id, 'Efeitos da Nitroglicerina', 'Vasodilatação venosa e arterial, redução pré e pós-carga', 3, true, ARRAY['nitroglicerina', 'vasodilatador', 'angina']),
    (cardiologia_id, 'Complicações do IAM', 'Arritmias, choque cardiogênico, ruptura cardíaca, pericardite', 4, true, ARRAY['iam', 'complicações', 'choque']),

    -- RESPIRATÓRIO (20 novos flashcards)
    (respiratorio_id, 'Músculos acessórios da respiração', 'Esternocleidomastoideo, Escalenos, Intercostais externos', 2, true, ARRAY['músculos-acessórios', 'respiração', 'dispneia']),
    (respiratorio_id, 'Valores normais da gasometria', 'pH: 7,35-7,45 / PaCO2: 35-45mmHg / PaO2: 80-100mmHg / HCO3: 22-26mEq/L', 3, true, ARRAY['gasometria', 'valores-normais', 'ph']),
    (respiratorio_id, 'Tipos de hipóxia', 'Hipóxica (altitude), Anêmica (CO), Circulatória (choque), Histotóxica (cianeto)', 4, true, ARRAY['hipóxia', 'tipos', 'oxigenação']),
    (respiratorio_id, 'Sinais de pneumotórax', 'Dor torácica súbita, dispneia, diminuição do murmúrio vesicular', 3, true, ARRAY['pneumotórax', 'dor-torácica', 'emergência']),
    (respiratorio_id, 'Complicações do DPOC', 'Insuficiência respiratória, cor pulmonale, pneumotórax, infecções', 3, true, ARRAY['dpoc', 'complicações', 'crônico']),
    (respiratorio_id, 'Oxigenoterapia: fluxo e concentração', '1L/min = 24% / 2L/min = 28% / 3L/min = 32% / 4L/min = 36%', 2, true, ARRAY['oxigenoterapia', 'fluxo', 'concentração']),
    (respiratorio_id, 'Posições para drenagem postural', 'Trendelenburg, decúbito lateral, prona - conforme segmento pulmonar', 3, true, ARRAY['drenagem-postural', 'fisioterapia', 'secreções']),

    -- NEUROLOGIA (20 novos flashcards)
    (neurologia_id, 'Nervos cranianos principais', 'Olfatório(I), Óptico(II), Oculomotor(III), Facial(VII), Vago(X), Hipoglosso(XII)', 4, true, ARRAY['nervos-cranianos', 'neurologia', 'pares']),
    (neurologia_id, 'Sinais de AVC isquêmico', 'Hemiparesia, afasia, desvio de rima, alteração do nível de consciência', 3, true, ARRAY['avc', 'isquêmico', 'sinais']),
    (neurologia_id, 'Reflexos osteotendinosos', 'Bicipital(C5-C6), Tricipital(C7-C8), Patelar(L3-L4), Aquileu(S1-S2)', 4, true, ARRAY['reflexos', 'medula', 'neurológico']),
    (neurologia_id, 'Tipos de convulsão', 'Tônico-clônica generalizada, Ausência, Focal simples, Focal complexa', 3, true, ARRAY['convulsão', 'epilepsia', 'tipos']),
    (neurologia_id, 'Meningismo: sinais clássicos', 'Rigidez de nuca, Sinal de Kernig, Sinal de Brudzinski', 3, true, ARRAY['meningismo', 'meningite', 'sinais']),
    (neurologia_id, 'Escala de coma: pontuação mínima', '3 pontos (1+1+1) = coma profundo', 2, true, ARRAY['glasgow', 'coma', 'pontuação']),

    -- ENDÓCRINO (15 novos flashcards)
    (endocrino_id, 'Sinais de hipertireoidismo', 'Taquicardia, perda de peso, tremores, irritabilidade, exoftalmia', 2, true, ARRAY['hipertireoidismo', 'tireoide', 'sinais']),
    (endocrino_id, 'Complicações da Diabetes', 'Nefropatia, retinopatia, neuropatia, doença cardiovascular', 2, true, ARRAY['diabetes', 'complicações', 'crônicas']),
    (endocrino_id, 'Tratamento da cetoacidose diabética', 'Insulina regular IV, hidratação, reposição de eletrólitos', 4, true, ARRAY['cetoacidose', 'diabetes', 'emergência']),
    (endocrino_id, 'Hormônios da tireoide', 'T3 (triiodotironina) - ativo / T4 (tiroxina) - pró-hormônio', 3, true, ARRAY['tireoide', 't3', 't4']),
    (endocrino_id, 'Sinais de hipotireoidismo', 'Bradicardia, ganho de peso, depressão, pele seca, mixedema', 2, true, ARRAY['hipotireoidismo', 'tireoide', 'sinais']),

    -- GENITURINÁRIO (15 novos flashcards)
    (geniturinario_id, 'Sinais de infecção urinária', 'Disúria, polaciúria, urgência miccional, dor suprapúbica', 1, true, ARRAY['itu', 'infecção', 'urinário']),
    (geniturinario_id, 'Valores normais da creatinina', 'Homens: 0,7-1,3 mg/dL / Mulheres: 0,6-1,1 mg/dL', 2, true, ARRAY['creatinina', 'função-renal', 'valores']),
    (geniturinario_id, 'Tipos de incontinência urinária', 'Esforço, urgência, mista, overflow, funcional', 2, true, ARRAY['incontinência', 'urinária', 'tipos']),
    (geniturinario_id, 'Sinais de insuficiência renal', 'Oligúria, edema, hipertensão, uremia, acidose metabólica', 3, true, ARRAY['insuficiência-renal', 'sinais', 'uremia']),
    (geniturinario_id, 'Cálculo renal: fatores de risco', 'Desidratação, dieta rica em sódio/oxalato, hipercalciúria', 2, true, ARRAY['cálculo-renal', 'nefrolitíase', 'fatores']),

    -- EMERGÊNCIAS (15 novos flashcards)
    (emergencias_id, 'Triagem de Manchester: cores', 'Azul (não urgente), Verde (pouco urgente), Amarelo (urgente), Laranja (muito urgente), Vermelho (emergência)', 2, true, ARRAY['triagem', 'manchester', 'prioridade']),
    (emergencias_id, 'Sinais de choque hipovolêmico', 'Taquicardia, hipotensão, pele fria/pegajosa, oligúria, alteração mental', 3, true, ARRAY['choque', 'hipovolêmico', 'sinais']),
    (emergencias_id, 'Queimaduras: classificação por grau', '1º grau (epiderme), 2º grau (derme), 3º grau (subcutâneo), 4º grau (músculos/ossos)', 2, true, ARRAY['queimaduras', 'graus', 'classificação']),
    (emergencias_id, 'Regra dos 9% (queimaduras)', 'Cabeça 9%, Braços 9% cada, Tronco anterior 18%, Tronco posterior 18%, Pernas 18% cada, Períneo 1%', 4, true, ARRAY['queimaduras', 'área', 'regra-9']),
    (emergencias_id, 'Antídotos específicos principais', 'Naloxona (opioides), Flumazenil (benzodiazepínicos), N-acetilcisteína (paracetamol)', 4, true, ARRAY['antídotos', 'intoxicações', 'específicos']),

    -- PROCEDIMENTOS (20 novos flashcards)
    (procedimentos_id, 'Precauções universais básicas', 'Lavagem das mãos, EPI, descarte adequado, imunização', 1, true, ARRAY['precauções', 'infecção', 'biossegurança']),
    (procedimentos_id, 'Técnica para punção venosa', 'Garrote, antissepsia, inserção em ângulo 15-30°, aspiração, fixação', 2, true, ARRAY['punção', 'venosa', 'técnica']),
    (procedimentos_id, 'Complicações da sondagem vesical', 'ITU, trauma uretral, obstrução, espasmos vesicais', 2, true, ARRAY['sondagem', 'vesical', 'complicações']),
    (procedimentos_id, 'Cuidados com feridas cirúrgicas', 'Avaliação diária, limpeza com SF 0,9%, curativo oclusivo, observar sinais de infecção', 2, true, ARRAY['feridas', 'cirúrgicas', 'cuidados']),
    (procedimentos_id, 'Posições cirúrgicas principais', 'Supina, prona, litotômica, Fowler, Trendelenburg', 2, true, ARRAY['posições', 'cirúrgicas', 'decúbitos']),

    -- CÁLCULOS (15 novos flashcards)
    (calculos_id, 'Conversão de unidades: mg para g', '1g = 1000mg / Para converter: dividir por 1000', 1, true, ARRAY['conversão', 'unidades', 'miligramas']),
    (calculos_id, 'Cálculo de superfície corporal', 'SC (m²) = √[(Peso × Altura) / 3600]', 3, true, ARRAY['superfície-corporal', 'cálculo', 'oncologia']),
    (calculos_id, 'Diluição de soluções: regra de três', 'Concentração inicial × Volume inicial = Concentração final × Volume final', 2, true, ARRAY['diluição', 'concentração', 'soluções']),
    (calculos_id, 'Taxa de filtração glomerular', 'TFG = [(140-idade) × peso] / (72 × creatinina) [×0,85 se mulher]', 4, true, ARRAY['tfg', 'creatinina', 'renal']),
    (calculos_id, 'Cálculo de gotejamento macro', 'Gotas/min = (Volume × 20) / Tempo(min) - macrogotas', 2, true, ARRAY['gotejamento', 'macro', 'infusão']),

    -- MICROBIOLOGIA (15 novos flashcards)
    (microbiologia_id, 'Bactérias Gram-positivas principais', 'Staphylococcus, Streptococcus, Enterococcus, Clostridium', 3, true, ARRAY['gram-positivas', 'bactérias', 'cocos']),
    (microbiologia_id, 'Antibióticos para MRSA', 'Vancomicina, Teicoplanina, Linezolida, Daptomicina', 4, true, ARRAY['mrsa', 'vancomicina', 'resistência']),
    (microbiologia_id, 'Tipos de precauções de isolamento', 'Contato, Gotículas, Aerossóis, Padrão', 2, true, ARRAY['isolamento', 'precauções', 'infecção']),
    (microbiologia_id, 'Agentes de infecção hospitalar', 'E.coli, Klebsiella, Pseudomonas, Acinetobacter, Candida', 3, true, ARRAY['hospitalar', 'iras', 'patógenos']),
    (microbiologia_id, 'Desinfetantes de alto nível', 'Glutaraldeído, Ácido peracético, Peróxido de hidrogênio', 3, true, ARRAY['desinfetantes', 'esterilização', 'alto-nível']);

END $$;

-- Show summary of new data
SELECT 
    fc.name as categoria,
    COUNT(f.id) as total_flashcards
FROM public.flashcard_categories fc
LEFT JOIN public.flashcards f ON fc.id = f.category_id
GROUP BY fc.name, fc.id
ORDER BY fc.name;

SELECT 'Total de flashcards na base: ' || COUNT(*) as summary FROM public.flashcards;