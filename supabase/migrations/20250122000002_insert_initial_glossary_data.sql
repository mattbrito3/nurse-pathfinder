-- Inserir categorias do glossário
INSERT INTO public.glossary_categories (name, description, color) VALUES
('Anatomia', 'Termos relacionados à estrutura do corpo humano', '#EF4444'),
('Fisiologia', 'Termos sobre funcionamento dos sistemas corporais', '#F59E0B'),
('Farmacologia', 'Medicamentos e suas ações no organismo', '#10B981'),
('Patologia', 'Doenças e condições médicas', '#8B5CF6'),
('Procedimentos', 'Técnicas e procedimentos de enfermagem', '#06B6D4'),
('Emergência', 'Termos de urgência e emergência', '#DC2626'),
('Materiais', 'Equipamentos e materiais hospitalares', '#6B7280'),
('Sinais Vitais', 'Parâmetros de avaliação do paciente', '#EC4899');

-- Inserir termos médicos básicos
INSERT INTO public.medical_terms (term, definition, pronunciation, category_id, synonyms, related_terms, difficulty_level) VALUES

-- Anatomia
('Aorta', 'Maior artéria do corpo humano, que transporta sangue oxigenado do coração para todo o organismo.', 'a-OR-ta', 
(SELECT id FROM public.glossary_categories WHERE name = 'Anatomia'), 
ARRAY['artéria principal'], ARRAY['ventrículo esquerdo', 'circulação sistêmica'], 'básico'),

('Átrio', 'Cada uma das duas cavidades superiores do coração que recebem o sangue.', 'Á-trio', 
(SELECT id FROM public.glossary_categories WHERE name = 'Anatomia'), 
ARRAY['aurícula'], ARRAY['ventrículo', 'coração', 'válvula'], 'básico'),

('Ventrículo', 'Cada uma das duas cavidades inferiores do coração responsáveis por bombear o sangue.', 'ven-TRÍ-cu-lo', 
(SELECT id FROM public.glossary_categories WHERE name = 'Anatomia'), 
ARRAY[], ARRAY['átrio', 'coração', 'sístole'], 'básico'),

-- Fisiologia
('Homeostase', 'Capacidade do organismo de manter o equilíbrio interno apesar das variações do ambiente externo.', 'ho-me-os-TA-se', 
(SELECT id FROM public.glossary_categories WHERE name = 'Fisiologia'), 
ARRAY['equilíbrio fisiológico'], ARRAY['metabolismo', 'regulação'], 'intermediário'),

('Sístole', 'Fase de contração do coração em que o sangue é bombeado para fora dos ventrículos.', 'SÍS-to-le', 
(SELECT id FROM public.glossary_categories WHERE name = 'Fisiologia'), 
ARRAY['contração cardíaca'], ARRAY['diástole', 'pressão arterial'], 'básico'),

('Diástole', 'Fase de relaxamento do coração em que os ventrículos se enchem de sangue.', 'di-ÁS-to-le', 
(SELECT id FROM public.glossary_categories WHERE name = 'Fisiologia'), 
ARRAY['relaxamento cardíaco'], ARRAY['sístole', 'pressão arterial'], 'básico'),

-- Farmacologia
('Analgésico', 'Medicamento usado para alívio da dor sem causar perda de consciência.', 'a-nal-GÉ-si-co', 
(SELECT id FROM public.glossary_categories WHERE name = 'Farmacologia'), 
ARRAY['medicamento para dor'], ARRAY['anti-inflamatório', 'opioide'], 'básico'),

('Antibiótico', 'Medicamento que combate infecções causadas por bactérias.', 'an-ti-bi-Ó-ti-co', 
(SELECT id FROM public.glossary_categories WHERE name = 'Farmacologia'), 
ARRAY['antimicrobiano'], ARRAY['infecção', 'resistência bacteriana'], 'básico'),

('Diurético', 'Medicamento que aumenta a produção de urina, auxiliando na eliminação de líquidos do organismo.', 'di-u-RÉ-ti-co', 
(SELECT id FROM public.glossary_categories WHERE name = 'Farmacologia'), 
ARRAY[], ARRAY['edema', 'hipertensão', 'insuficiência cardíaca'], 'intermediário'),

-- Patologia
('Hipertensão', 'Condição caracterizada pela elevação persistente da pressão arterial.', 'hi-per-ten-SÃO', 
(SELECT id FROM public.glossary_categories WHERE name = 'Patologia'), 
ARRAY['pressão alta'], ARRAY['pressão arterial', 'cardiovascular'], 'básico'),

('Diabetes', 'Doença caracterizada por níveis elevados de glicose no sangue devido à deficiência ou resistência à insulina.', 'di-a-BE-tes', 
(SELECT id FROM public.glossary_categories WHERE name = 'Patologia'), 
ARRAY['diabetes mellitus'], ARRAY['glicemia', 'insulina', 'glicose'], 'básico'),

('Hipoglicemia', 'Condição caracterizada por níveis baixos de glicose no sangue.', 'hi-po-gli-ce-MI-a', 
(SELECT id FROM public.glossary_categories WHERE name = 'Patologia'), 
ARRAY['glicose baixa'], ARRAY['diabetes', 'glicemia', 'insulina'], 'básico'),

-- Procedimentos
('Cateter', 'Tubo fino e flexível usado para drenar fluidos ou administrar medicamentos.', 'ca-TE-ter', 
(SELECT id FROM public.glossary_categories WHERE name = 'Procedimentos'), 
ARRAY['sonda'], ARRAY['punção venosa', 'drenagem'], 'básico'),

('Intubação', 'Procedimento de inserção de um tubo na traqueia para manter as vias aéreas abertas.', 'in-tu-ba-ÇÃO', 
(SELECT id FROM public.glossary_categories WHERE name = 'Procedimentos'), 
ARRAY[], ARRAY['ventilação mecânica', 'via aérea'], 'avançado'),

('Punção Venosa', 'Procedimento de inserção de agulha ou cateter em uma veia para coleta de sangue ou administração de medicamentos.', 'pun-ÇÃO ve-NO-sa', 
(SELECT id FROM public.glossary_categories WHERE name = 'Procedimentos'), 
ARRAY['acesso venoso'], ARRAY['cateter', 'flebotomia'], 'básico'),

-- Emergência
('Parada Cardíaca', 'Cessação súbita e inesperada da atividade cardíaca efetiva.', 'pa-RA-da car-DÍ-a-ca', 
(SELECT id FROM public.glossary_categories WHERE name = 'Emergência'), 
ARRAY['parada cardiorrespiratória'], ARRAY['RCP', 'desfibrilação'], 'avançado'),

('RCP', 'Ressuscitação Cardiopulmonar - conjunto de manobras para reverter parada cardiorrespiratória.', 'RCP', 
(SELECT id FROM public.glossary_categories WHERE name = 'Emergência'), 
ARRAY['ressuscitação cardiopulmonar'], ARRAY['parada cardíaca', 'compressões torácicas'], 'avançado'),

('Choque', 'Estado de inadequada perfusão tecidual que resulta em hipóxia celular.', 'CHO-que', 
(SELECT id FROM public.glossary_categories WHERE name = 'Emergência'), 
ARRAY['choque circulatório'], ARRAY['hipotensão', 'perfusão'], 'intermediário'),

-- Materiais
('Seringa', 'Instrumento usado para injetar ou aspirar líquidos do corpo.', 'se-RIN-ga', 
(SELECT id FROM public.glossary_categories WHERE name = 'Materiais'), 
ARRAY[], ARRAY['agulha', 'injeção'], 'básico'),

('Estetoscópio', 'Instrumento usado para auscultar sons internos do corpo, especialmente do coração e pulmões.', 'es-te-tos-CÓ-pi-o', 
(SELECT id FROM public.glossary_categories WHERE name = 'Materiais'), 
ARRAY[], ARRAY['ausculta', 'sinais vitais'], 'básico'),

('Esfigmomanômetro', 'Aparelho usado para medir a pressão arterial.', 'es-fig-mo-ma-NÔ-me-tro', 
(SELECT id FROM public.glossary_categories WHERE name = 'Materiais'), 
ARRAY['medidor de pressão'], ARRAY['pressão arterial', 'sinais vitais'], 'básico'),

-- Sinais Vitais
('Pressão Arterial', 'Força exercida pelo sangue contra as paredes das artérias durante a circulação.', 'pres-SÃO ar-te-ri-AL', 
(SELECT id FROM public.glossary_categories WHERE name = 'Sinais Vitais'), 
ARRAY['PA'], ARRAY['sístole', 'diástole', 'hipertensão'], 'básico'),

('Frequência Cardíaca', 'Número de batimentos cardíacos por minuto.', 'fre-QUÊN-ci-a car-DÍ-a-ca', 
(SELECT id FROM public.glossary_categories WHERE name = 'Sinais Vitais'), 
ARRAY['FC', 'pulso'], ARRAY['ritmo cardíaco', 'taquicardia'], 'básico'),

('Temperatura', 'Medida do calor corporal, indicador importante do estado de saúde.', 'tem-pe-ra-TU-ra', 
(SELECT id FROM public.glossary_categories WHERE name = 'Sinais Vitais'), 
ARRAY['febre'], ARRAY['hipotermia', 'hipertermia'], 'básico'),

('Saturação de O2', 'Porcentagem de hemoglobina saturada com oxigênio no sangue.', 'sa-tu-ra-ÇÃO de o-xi-GÊ-ni-o', 
(SELECT id FROM public.glossary_categories WHERE name = 'Sinais Vitais'), 
ARRAY['SpO2', 'oximetria'], ARRAY['hipoxemia', 'oxigenação'], 'básico'),

('Taquicardia', 'Aumento da frequência cardíaca acima dos valores normais (>100 bpm em adultos).', 'ta-qui-car-DI-a', 
(SELECT id FROM public.glossary_categories WHERE name = 'Sinais Vitais'), 
ARRAY[], ARRAY['frequência cardíaca', 'bradicardia'], 'básico'),

('Bradicardia', 'Diminuição da frequência cardíaca abaixo dos valores normais (<60 bpm em adultos).', 'bra-di-car-DI-a', 
(SELECT id FROM public.glossary_categories WHERE name = 'Sinais Vitais'), 
ARRAY[], ARRAY['frequência cardíaca', 'taquicardia'], 'básico');