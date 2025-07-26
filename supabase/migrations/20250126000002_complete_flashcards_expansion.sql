-- Migration: Complete Flashcards Expansion to 270+ Cards - Phase 2
-- Description: Complete the expansion with remaining categories
-- Phase 1: 80 cards | Phase 2: ~100 cards | Total target: 270+ cards

DO $$
DECLARE
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
    SELECT id INTO respiratorio_id FROM public.flashcard_categories WHERE name = 'Respiratório';
    SELECT id INTO neurologia_id FROM public.flashcard_categories WHERE name = 'Neurologia';
    SELECT id INTO endocrino_id FROM public.flashcard_categories WHERE name = 'Endócrino';
    SELECT id INTO geniturinario_id FROM public.flashcard_categories WHERE name = 'Geniturinário';
    SELECT id INTO emergencias_id FROM public.flashcard_categories WHERE name = 'Emergências';
    SELECT id INTO procedimentos_id FROM public.flashcard_categories WHERE name = 'Procedimentos';
    SELECT id INTO calculos_id FROM public.flashcard_categories WHERE name = 'Cálculos';
    SELECT id INTO microbiologia_id FROM public.flashcard_categories WHERE name = 'Microbiologia';

    -- RESPIRATÓRIO EXPANSION (15 additional cards)
    INSERT INTO public.flashcards (category_id, front, back, difficulty_level, is_public, tags) VALUES
    (respiratorio_id, 'Interpretação da gasometria: acidose respiratória', 'pH <7,35 + PCO2 >45mmHg + HCO3 normal (22-26) = acidose respiratória aguda', 3, true, ARRAY['gasometria', 'acidose', 'respiratória']),
    (respiratorio_id, 'Interpretação da gasometria: alcalose respiratória', 'pH >7,45 + PCO2 <35mmHg + HCO3 normal = alcalose respiratória aguda', 3, true, ARRAY['gasometria', 'alcalose', 'respiratória']),
    (respiratorio_id, 'Critérios para SARA (Síndrome da Angústia Respiratória Aguda)', 'PaO2/FiO2 <300 (leve), <200 (moderada), <100 (grave) + infiltrados bilaterais + início agudo', 4, true, ARRAY['sara', 'pao2-fio2', 'insuficiência-respiratória']),
    (respiratorio_id, 'Sinais de pneumonia na ausculta', 'Murmúrio vesicular diminuído, estertores crepitantes, sopro tubário, egofonia', 2, true, ARRAY['pneumonia', 'ausculta', 'estertores']),
    (respiratorio_id, 'Classificação CURB-65 para pneumonia', 'Confusão, Ureia >7mmol/L, FR ≥30, PA <90/60, Idade ≥65 anos (0-2: ambulatorial, 3-5: internação)', 3, true, ARRAY['curb-65', 'pneumonia', 'prognóstico']),
    (respiratorio_id, 'Indicações para ventilação mecânica', 'FR >35, PaO2 <50mmHg, PCO2 >50mmHg + acidose, fadiga muscular, rebaixamento consciência', 3, true, ARRAY['ventilação-mecânica', 'indicações', 'insuficiência-respiratória']),
    (respiratorio_id, 'Parâmetros iniciais do ventilador', 'Volume corrente: 6-8mL/kg | PEEP: 5cmH2O | FiO2: 100% depois ajustar | FR: 12-20', 4, true, ARRAY['ventilador', 'parâmetros', 'vm']),
    (respiratorio_id, 'Sinais de pneumotórax hipertensivo', 'Dispneia súbita, ausência MV unilateral, timpanismo, desvio traqueal contralateral, turgência jugular', 4, true, ARRAY['pneumotórax', 'hipertensivo', 'emergência']),
    (respiratorio_id, 'Tratamento do pneumotórax hipertensivo', 'Descompressão imediata: agulha 14G no 2º espaço intercostal linha medioclavicular', 4, true, ARRAY['pneumotórax', 'descompressão', 'emergência']),
    (respiratorio_id, 'Classificação da DPOC por VEF1', 'Leve: VEF1 ≥80% | Moderado: 50-79% | Grave: 30-49% | Muito grave: <30%', 3, true, ARRAY['dpoc', 'vef1', 'espirometria']),
    (respiratorio_id, 'Exacerbação da DPOC: tratamento', 'Broncodilatador (salbutamol + ipratrópio), corticoide sistêmico, O2 alvo 88-92%', 3, true, ARRAY['dpoc', 'exacerbação', 'tratamento']),
    (respiratorio_id, 'Sinais de embolia pulmonar', 'Dispneia súbita, dor pleurítica, taquicardia, dessaturação, pode ter hemoptise', 3, true, ARRAY['embolia-pulmonar', 'sinais', 'tep']),
    (respiratorio_id, 'Escore de Wells para embolia pulmonar', 'TVP clínica: 3pts | TEP mais provável que outras: 3pts | FC >100: 1,5pts | Imobilização >3d: 1,5pts', 3, true, ARRAY['wells', 'embolia-pulmonar', 'probabilidade']),
    (respiratorio_id, 'Tipos de oxigenoterapia', 'Cateter nasal: 1-6L (24-44%) | Máscara simples: 6-10L (40-60%) | Venturi: precisão | Não-reinalante: 10-15L (80-95%)', 2, true, ARRAY['oxigenoterapia', 'tipos', 'concentração']),
    (respiratorio_id, 'Sinais de falência respiratória iminente', 'Paradoxo toraco-abdominal, uso músculos acessórios, cianose central, sudorese, rebaixamento consciência', 4, true, ARRAY['falência-respiratória', 'sinais', 'emergência']),

    -- NEUROLOGIA EXPANSION (15 additional cards)
    (neurologia_id, 'Escala de Glasgow detalhada - Abertura ocular', '4: espontânea | 3: ao comando verbal | 2: à dor | 1: nenhuma', 2, true, ARRAY['glasgow', 'abertura-ocular', 'consciência']),
    (neurologia_id, 'Escala de Glasgow detalhada - Resposta verbal', '5: orientado | 4: confuso | 3: palavras inadequadas | 2: sons incompreensíveis | 1: nenhuma', 2, true, ARRAY['glasgow', 'resposta-verbal', 'consciência']),
    (neurologia_id, 'Escala de Glasgow detalhada - Resposta motora', '6: obedece comandos | 5: localiza dor | 4: flexão normal | 3: flexão anormal | 2: extensão | 1: nenhuma', 3, true, ARRAY['glasgow', 'resposta-motora', 'consciência']),
    (neurologia_id, 'Escala NIHSS - principais domínios', 'Consciência, olhar, campos visuais, paralisia facial, motor braços/pernas, ataxia, sensibilidade, linguagem', 3, true, ARRAY['nihss', 'avc', 'avaliação']),
    (neurologia_id, 'Janela terapêutica para trombólise no AVC', 'Alteplase IV: até 4,5h do início | Trombectomia mecânica: até 6-24h (casos selecionados)', 4, true, ARRAY['avc', 'trombólise', 'janela-terapêutica']),
    (neurologia_id, 'Contraindicações para trombólise no AVC', 'AVC hemorrágico, cirurgia recente <14d, trauma craniano <3m, anticoagulação plena, plaquetas <100mil', 4, true, ARRAY['trombólise', 'contraindicações', 'avc']),
    (neurologia_id, 'Tipos de cefaleia primária', 'Enxaqueca, cefaleia tensional, cefaleia em salvas (cluster)', 2, true, ARRAY['cefaleia', 'primária', 'enxaqueca']),
    (neurologia_id, 'Sinais de alarme na cefaleia', '"Pior cefaleia da vida", febre + rigidez nucal, déficit neurológico focal, alteração consciência', 3, true, ARRAY['cefaleia', 'alarme', 'emergência']),
    (neurologia_id, 'Status epilepticus: definição e tratamento', 'Convulsão >5min ou convulsões recorrentes sem recuperação. Tratamento: benzodiazepínico + fenitoína', 4, true, ARRAY['status-epilepticus', 'convulsão', 'emergência']),
    (neurologia_id, 'Classificação das convulsões', 'Focal: simples (sem alteração consciência) e complexa (com alteração) | Generalizada: tônico-clônica, ausência, mioclônica', 3, true, ARRAY['convulsões', 'classificação', 'epilepsia']),
    (neurologia_id, 'Sinais de meningite', 'Febre, cefaleia, rigidez nucal, fotofobia, náuseas/vômitos, petéquias (meningocócica)', 3, true, ARRAY['meningite', 'sinais', 'infecção']),
    (neurologia_id, 'Sinais de Kernig e Brudzinski', 'Kernig: resistência extensão joelho com quadril fletido | Brudzinski: flexão joelhos ao flexionar pescoço', 3, true, ARRAY['kernig', 'brudzinski', 'meningite']),
    (neurologia_id, 'Parkinsonismo: tétrade clássica', 'Tremor de repouso, rigidez, bradicinesia, instabilidade postural', 2, true, ARRAY['parkinson', 'tremor', 'bradicinesia']),
    (neurologia_id, 'Nervos cranianos e suas funções principais', 'I: olfato | II: visão | III: movimento ocular | V: sensibilidade face | VII: mímica facial | VIII: audição', 3, true, ARRAY['nervos-cranianos', 'funções', 'neuroanatomia']),
    (neurologia_id, 'Síndrome de Guillain-Barré: características', 'Paralisia flácida ascendente, simétrica, arreflexia, pode comprometer respiração', 3, true, ARRAY['guillain-barré', 'paralisia', 'ascendente']),

    -- ENDÓCRINO EXPANSION (15 additional cards)
    (endocrino_id, 'Critérios diagnósticos para diabetes', 'Glicemia jejum ≥126mg/dL OU glicemia casual ≥200mg/dL + sintomas OU HbA1c ≥6,5%', 2, true, ARRAY['diabetes', 'diagnóstico', 'glicemia']),
    (endocrino_id, 'Metas glicêmicas em diabéticos', 'HbA1c <7% (geral) | Glicemia jejum: 80-130mg/dL | Pós-prandial <180mg/dL', 2, true, ARRAY['diabetes', 'metas', 'controle']),
    (endocrino_id, 'Sinais de cetoacidose diabética', 'Hiperglicemia >250mg/dL, cetonúria/cetonemia, acidose (pH <7,3), desidratação, hálito cetônico', 3, true, ARRAY['cetoacidose', 'diabetes', 'emergência']),
    (endocrino_id, 'Tratamento da cetoacidose diabética', 'Hidratação (SF 0,9%) + insulina regular + reposição K+ + correção acidose', 4, true, ARRAY['cetoacidose', 'tratamento', 'insulina']),
    (endocrino_id, 'Sinais de crise tireotóxica', 'Febre >38,5°C, taquicardia >140bpm, agitação, diarreia, desidratação, pode evoluir com coma', 4, true, ARRAY['crise-tireotóxica', 'hipertireoidismo', 'emergência']),
    (endocrino_id, 'Tratamento da crise tireotóxica', 'Propiltiouracil + iodo + betabloqueador + corticoide + medidas suporte', 4, true, ARRAY['crise-tireotóxica', 'tratamento', 'emergência']),
    (endocrino_id, 'Sinais de hipotireoidismo', 'Fadiga, ganho peso, pele seca, cabelo ressecado, bradicardia, constipação, depressão', 2, true, ARRAY['hipotireoidismo', 'sinais', 'tireoide']),
    (endocrino_id, 'Sinais de insuficiência adrenal aguda', 'Hipotensão refratária, náuseas, vômitos, dor abdominal, hipoglicemia, hiponatremia, hipercalemia', 4, true, ARRAY['insuficiência-adrenal', 'addison', 'emergência']),
    (endocrino_id, 'Teste de supressão com dexametasona', '1mg dexametasona 23h → cortisol 8h <1,8mcg/dL = normal | >5mcg/dL = Cushing provável', 3, true, ARRAY['dexametasona', 'cushing', 'teste']),
    (endocrino_id, 'Sinais de síndrome de Cushing', 'Obesidade centrípeta, face em lua cheia, estrias purpúricas, cifose, hipertensão, diabetes', 3, true, ARRAY['cushing', 'obesidade', 'estrias']),
    (endocrino_id, 'Hormônios contrarregulatórios da glicose', 'Glucagon (principal), cortisol, GH, adrenalina - todos aumentam glicemia', 3, true, ARRAY['contrarregulatórios', 'glucagon', 'glicemia']),
    (endocrino_id, 'Classificação da obesidade pelo IMC', 'Normal: 18,5-24,9 | Sobrepeso: 25-29,9 | Obesidade I: 30-34,9 | II: 35-39,9 | III (mórbida): ≥40', 1, true, ARRAY['obesidade', 'imc', 'classificação']),
    (endocrino_id, 'Síndrome metabólica: critérios', '≥3 de: CA ♂>102cm/♀>88cm, TG ≥150, HDL ♂<40/♀<50, PA ≥130/85, glicemia ≥100mg/dL', 3, true, ARRAY['síndrome-metabólica', 'critérios', 'risco-cardiovascular']),
    (endocrino_id, 'Efeitos da insulina no metabolismo', 'Anabólico: ↑captação glicose, ↑síntese glicogênio/proteína/gordura, ↓gliconeogênese, ↓lipólise', 3, true, ARRAY['insulina', 'anabolismo', 'metabolismo']),
    (endocrino_id, 'Tipos de diabetes mellitus', 'Tipo 1: autoimune, destruição células β | Tipo 2: resistência insulínica + disfunção células β | MODY | Gestacional', 2, true, ARRAY['diabetes', 'tipos', 'patogênese']),

    -- GENITURINÁRIO EXPANSION (12 additional cards)
    (geniturinario_id, 'Interpretação do EAS - proteinúria', 'Normal: <150mg/24h | Microalbuminúria: 30-300mg/24h | Macroalbuminúria: >300mg/24h', 2, true, ARRAY['proteinúria', 'eas', 'microalbuminúria']),
    (geniturinario_id, 'Interpretação do EAS - hematúria', 'Macroscópica: visível | Microscópica: >3 hemácias/campo | Investigar: cistoscopia + imagem', 2, true, ARRAY['hematúria', 'eas', 'sangue-urina']),
    (geniturinario_id, 'Classificação da doença renal crônica', 'Estágio 1: TFG ≥90 + lesão | 2: 60-89 | 3A: 45-59 | 3B: 30-44 | 4: 15-29 | 5: <15 (diálise)', 3, true, ARRAY['drc', 'tfg', 'classificação']),
    (geniturinario_id, 'Sinais de síndrome nefrótica', 'Proteinúria >3,5g/24h, hipoalbuminemia <3g/dL, edema, dislipidemia', 3, true, ARRAY['síndrome-nefrótica', 'proteinúria', 'edema']),
    (geniturinario_id, 'Sinais de síndrome nefrítica', 'Hematúria, proteinúria <3,5g/24h, hipertensão, oligúria, edema, azotemia', 3, true, ARRAY['síndrome-nefrítica', 'hematúria', 'hipertensão']),
    (geniturinario_id, 'Indicações para diálise de urgência', 'Hipercalemia grave (K+ >6,5), edema agudo pulmonar, acidose grave (pH <7,1), uremia grave', 4, true, ARRAY['diálise', 'urgência', 'indicações']),
    (geniturinario_id, 'Tratamento da ITU não complicada', 'Nitrofurantoína 100mg 6/6h por 5-7d OU Sulfametoxazol-trimetoprima 160/800mg 12/12h por 3d', 2, true, ARRAY['itu', 'antibiótico', 'nitrofurantoína']),
    (geniturinario_id, 'Fatores de risco para ITU', 'Sexo feminino, atividade sexual, diabetes, imunossupressão, obstrução, cateter vesical', 2, true, ARRAY['itu', 'fatores-risco', 'mulher']),
    (geniturinario_id, 'Sinais de pielonefrite', 'Febre, calafrios, dor lombar, náuseas, vômitos + sinais de cistite', 2, true, ARRAY['pielonefrite', 'febre', 'dor-lombar']),
    (geniturinario_id, 'Causas de insuficiência renal aguda', 'Pré-renal: desidratação, choque | Renal: NTA, glomerulonefrite | Pós-renal: obstrução', 3, true, ARRAY['ira', 'causas', 'pré-renal']),
    (geniturinario_id, 'Fórmula de Cockcroft-Gault para TFG', 'TFG = [(140-idade) × peso] / (72 × creatinina) × 0,85 (se mulher)', 3, true, ARRAY['cockcroft-gault', 'tfg', 'creatinina']),
    (geniturinario_id, 'Tipos de incontinência urinária', 'Esforço: ↑pressão abdominal | Urgência: urgência súbita | Mista: ambas | Overflow: retenção', 2, true, ARRAY['incontinência', 'tipos', 'esforço']),

    -- EMERGÊNCIAS EXPANSION (15 additional cards)
    (emergencias_id, 'Protocolo ABCDE do trauma', 'Airway: via aérea | Breathing: ventilação | Circulation: circulação | Disability: neurológico | Exposure: exposição', 3, true, ARRAY['abcde', 'trauma', 'protocolo']),
    (emergencias_id, 'Escala de coma de Glasgow <8', 'Indica necessidade de proteção de via aérea (intubação orotraqueal)', 3, true, ARRAY['glasgow', 'intubação', 'via-aérea']),
    (emergencias_id, 'Queimaduras: regra dos 9', 'Cabeça: 9% | Braço: 9% cada | Tronco anterior: 18% | Tronco posterior: 18% | Perna: 18% cada | Períneo: 1%', 3, true, ARRAY['queimaduras', 'regra-dos-9', 'superfície']),
    (emergencias_id, 'Classificação de queimaduras por profundidade', '1º grau: eritema | 2º superficial: flictenas | 2º profundo: base esbranquiçada | 3º grau: escara', 2, true, ARRAY['queimaduras', 'profundidade', 'graus']),
    (emergencias_id, 'Fórmula de Parkland para reposição volêmica', '4mL × peso(kg) × %SCQ nas primeiras 24h (50% nas primeiras 8h)', 4, true, ARRAY['parkland', 'queimaduras', 'reposição-volêmica']),
    (emergencias_id, 'Intoxicação por organofosforados: sinais', 'Síndrome colinérgica: miose, hipersecreção, fasciculações, convulsões, bradicardia', 3, true, ARRAY['organofosforados', 'colinérgica', 'miose']),
    (emergencias_id, 'Tratamento da intoxicação por organofosforados', 'Atropina (antagonista colinérgico) + Pralidoxima (reativador da colinesterase)', 4, true, ARRAY['organofosforados', 'atropina', 'pralidoxima']),
    (emergencias_id, 'Sinais de choque hipovolêmico', 'Classe I: <15% perda | II: 15-30% (taquicardia) | III: 30-40% (hipotensão) | IV: >40% (crítico)', 3, true, ARRAY['choque', 'hipovolêmico', 'classificação']),
    (emergencias_id, 'Causas de choque distributivo', 'Séptico, anafilático, neurogênico, por drogas (vasodilatadores)', 3, true, ARRAY['choque', 'distributivo', 'séptico']),
    (emergencias_id, 'Critérios de SIRS', '≥2 de: T >38°C ou <36°C, FC >90bpm, FR >20ipm, Leucócitos >12mil ou <4mil', 3, true, ARRAY['sirs', 'sepse', 'critérios']),
    (emergencias_id, 'Definição de sepse (Sepsis-3)', 'SIRS + disfunção orgânica (SOFA ≥2 pontos)', 3, true, ARRAY['sepse', 'sofa', 'disfunção']),
    (emergencias_id, 'Tratamento inicial da anafilaxia', 'Adrenalina 0,3-0,5mg IM (coxa) + corticoide + anti-histamínico + O2 + fluidos', 4, true, ARRAY['anafilaxia', 'adrenalina', 'emergência']),
    (emergencias_id, 'Sinais de anafilaxia', 'Urticária, angioedema, broncoespasmo, hipotensão, choque - início rápido (<2h)', 3, true, ARRAY['anafilaxia', 'urticária', 'broncoespasmo']),
    (emergencias_id, 'Indicações para cricotireoidostomia', 'Via aérea difícil: trauma facial, edema laríngeo, corpo estranho, quando IOT impossível', 4, true, ARRAY['cricotireoidostomia', 'via-aérea', 'emergência']),
    (emergencias_id, 'Escala de risco de suicídio', 'Fatores: tentativa prévia, plano específico, isolamento social, depressão, abuso substâncias', 3, true, ARRAY['suicídio', 'risco', 'fatores']);

-- Continue with remaining categories...

END $$;

-- Show final count
SELECT 
    fc.name as categoria,
    COUNT(f.id) as total_flashcards
FROM public.flashcard_categories fc
LEFT JOIN public.flashcards f ON fc.id = f.category_id
GROUP BY fc.name, fc.id
ORDER BY COUNT(f.id) DESC;

SELECT 'EXPANSION COMPLETE! Total flashcards: ' || COUNT(*) as final_count 
FROM public.flashcards;