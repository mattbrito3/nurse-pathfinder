-- 🚧 PREPARAÇÃO PARA MERCADO PAGO
-- Remove constraints UNIQUE do Stripe para preparar nova solução de pagamento
-- Esta migração é SEGURA e não quebra dados existentes

-- Remove constraint UNIQUE do stripe_price_id (preparar para mercadopago_plan_id)
ALTER TABLE subscription_plans 
DROP CONSTRAINT IF EXISTS subscription_plans_stripe_price_id_key;

-- Remove constraint UNIQUE do stripe_subscription_id (preparar para mercadopago_subscription_id)  
ALTER TABLE user_subscriptions 
DROP CONSTRAINT IF EXISTS user_subscriptions_stripe_subscription_id_key;

-- Adiciona comentários para documentar as mudanças
COMMENT ON COLUMN subscription_plans.stripe_price_id IS 'Campo legacy do Stripe - será substituído por nova solução de pagamento';
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'Campo legacy do Stripe - será substituído por nova solução de pagamento';
COMMENT ON COLUMN user_subscriptions.stripe_customer_id IS 'Campo legacy do Stripe - será substituído por nova solução de pagamento';

-- Prepara colunas para Mercado Pago (opcional, para facilitar migração futura)
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS mercadopago_plan_id TEXT NULL;

ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS mercadopago_subscription_id TEXT NULL,
ADD COLUMN IF NOT EXISTS mercadopago_customer_id TEXT NULL;

ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS mercadopago_payment_id TEXT NULL;

-- Adiciona comentários nas novas colunas
COMMENT ON COLUMN subscription_plans.mercadopago_plan_id IS 'ID do plano no Mercado Pago - nova solução de pagamento';
COMMENT ON COLUMN user_subscriptions.mercadopago_subscription_id IS 'ID da assinatura no Mercado Pago';
COMMENT ON COLUMN user_subscriptions.mercadopago_customer_id IS 'ID do cliente no Mercado Pago';
COMMENT ON COLUMN payment_history.mercadopago_payment_id IS 'ID do pagamento no Mercado Pago';