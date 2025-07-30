-- Add missing columns to payment_history table for AbacatePay integration

-- Add payment_provider column
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS payment_provider TEXT;

-- Add payment_id column (for external payment IDs like AbacatePay IDs)
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add metadata column for storing additional payment data
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add updated_at column
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger for updated_at
CREATE TRIGGER update_payment_history_updated_at
    BEFORE UPDATE ON payment_history
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add index for payment_provider
CREATE INDEX IF NOT EXISTS idx_payment_history_provider ON payment_history(payment_provider);

-- Add index for payment_id
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_id ON payment_history(payment_id);

-- Add comments
COMMENT ON COLUMN payment_history.payment_provider IS 'Payment provider (stripe, abacatepay, etc.)';
COMMENT ON COLUMN payment_history.payment_id IS 'External payment ID from payment provider';
COMMENT ON COLUMN payment_history.metadata IS 'Additional payment data stored as JSON';