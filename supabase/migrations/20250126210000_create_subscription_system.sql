-- 💳 SUBSCRIPTION & PAYMENT SYSTEM
-- Complete payment management with Stripe integration

-- 1. Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL' NOT NULL,
    interval TEXT CHECK (interval IN ('month', 'year')) NOT NULL,
    features JSONB DEFAULT '[]',
    stripe_price_id TEXT UNIQUE,
    popular BOOLEAN DEFAULT false,
    max_flashcards INTEGER,
    max_calculations INTEGER,
    advanced_analytics BOOLEAN DEFAULT false,
    priority_support BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one active subscription per user
    UNIQUE(user_id, status) WHERE status = 'active'
);

-- 3. Payment History table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES user_subscriptions(id),
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BRL' NOT NULL,
    status TEXT CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled')) NOT NULL,
    description TEXT,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔐 Row Level Security (RLS)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
    FOR SELECT USING (active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for payment_history
CREATE POLICY "Users can view own payment history" ON payment_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment history" ON payment_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 🔧 Helper Functions

-- Update timestamp trigger function (reuse existing)
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION user_has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_subscriptions 
        WHERE user_id = user_uuid 
        AND status = 'active' 
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current plan
CREATE OR REPLACE FUNCTION get_user_current_plan(user_uuid UUID)
RETURNS TABLE (
    plan_name TEXT,
    plan_features JSONB,
    max_flashcards INTEGER,
    max_calculations INTEGER,
    advanced_analytics BOOLEAN,
    priority_support BOOLEAN,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.name,
        sp.features,
        sp.max_flashcards,
        sp.max_calculations,
        sp.advanced_analytics,
        sp.priority_support,
        us.current_period_end
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND us.current_period_end > NOW()
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 📊 Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(active);

-- 💬 Comments
COMMENT ON TABLE subscription_plans IS 'Available subscription plans for the platform';
COMMENT ON TABLE user_subscriptions IS 'User subscription records with Stripe integration';
COMMENT ON TABLE payment_history IS 'Complete payment transaction history';

-- ✅ Insert default plans
INSERT INTO subscription_plans (name, description, price, currency, interval, features, stripe_price_id, popular, max_flashcards, max_calculations, advanced_analytics, priority_support) VALUES
(
    'Gratuito',
    'Acesso básico às funcionalidades essenciais',
    0.00,
    'BRL',
    'month',
    '["50 flashcards por mês", "Calculadora básica", "Glossário completo", "Estatísticas básicas"]',
    null,
    false,
    50,
    100,
    false,
    false
),
(
    'Profissional',
    'Ideal para estudantes e profissionais ativos',
    19.90,
    'BRL',
    'month',
    '["Flashcards ilimitados", "Calculadora avançada", "Analytics detalhados", "Histórico completo", "Suporte prioritário"]',
    'price_professional_monthly', -- Replace with actual Stripe price ID
    true,
    null, -- unlimited
    null, -- unlimited
    true,
    true
),
(
    'Anual Profissional',
    'Plano anual com 2 meses grátis',
    199.00,
    'BRL',
    'year',
    '["Flashcards ilimitados", "Calculadora avançada", "Analytics detalhados", "Histórico completo", "Suporte prioritário", "2 meses grátis"]',
    'price_professional_yearly', -- Replace with actual Stripe price ID
    false,
    null, -- unlimited
    null, -- unlimited
    true,
    true
);

-- 🔍 Views for easier querying
CREATE OR REPLACE VIEW active_user_subscriptions AS
SELECT 
    us.*,
    sp.name as plan_name,
    sp.features as plan_features,
    sp.max_flashcards,
    sp.max_calculations,
    sp.advanced_analytics,
    sp.priority_support
FROM user_subscriptions us
JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status = 'active'
AND us.current_period_end > NOW();

COMMENT ON VIEW active_user_subscriptions IS 'Active user subscriptions with plan details';