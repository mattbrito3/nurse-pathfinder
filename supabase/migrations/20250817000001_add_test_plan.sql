-- Adicionar plano de teste com valor R$ 0,01 para debugging
INSERT INTO subscription_plans (
    name, 
    description, 
    price, 
    currency, 
    interval, 
    features, 
    stripe_price_id, 
    popular, 
    max_flashcards, 
    max_calculations, 
    advanced_analytics, 
    priority_support,
    active
) VALUES (
    'Teste',
    'Plano de teste para desenvolvimento (R$ 0,01)',
    0.01,
    'BRL',
    'month',
    '["Plano de teste", "Funcionalidades limitadas", "Apenas para desenvolvimento"]',
    'test_price_001',
    false,
    10,
    10,
    false,
    false,
    true
) ON CONFLICT DO NOTHING;
