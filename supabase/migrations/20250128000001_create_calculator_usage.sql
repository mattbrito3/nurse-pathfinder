-- 🧮 CALCULATOR USAGE TRACKING
-- Track daily calculator usage for free plan limits

-- Create calculator_usage table
CREATE TABLE IF NOT EXISTS calculator_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    daily_calculations INTEGER DEFAULT 0 NOT NULL,
    last_reset_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one record per user per day
    UNIQUE(user_id, last_reset_date)
);

-- Enable RLS
ALTER TABLE calculator_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own calculator usage" ON calculator_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculator usage" ON calculator_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calculator usage" ON calculator_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_calculator_usage_user_date ON calculator_usage(user_id, last_reset_date);
CREATE INDEX IF NOT EXISTS idx_calculator_usage_date ON calculator_usage(last_reset_date);

-- Update timestamp trigger
CREATE TRIGGER update_calculator_usage_updated_at
    BEFORE UPDATE ON calculator_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE calculator_usage IS 'Daily calculator usage tracking for plan limits';
COMMENT ON COLUMN calculator_usage.daily_calculations IS 'Number of calculations performed today';
COMMENT ON COLUMN calculator_usage.last_reset_date IS 'Date when the counter was last reset';