-- Fix payment_history table structure for MercadoPago webhook
-- Add missing columns and fix existing structure

-- Add external_reference column if it doesn't exist
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS external_reference TEXT;

-- Add payment_data column for storing full payment information
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS payment_data JSONB DEFAULT '{}';

-- Add metadata column if it doesn't exist
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add payment_provider column if it doesn't exist
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS payment_provider TEXT;

-- Add payment_id column if it doesn't exist
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS payment_id TEXT;

-- Add description column if it doesn't exist
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add payment_method column if it doesn't exist
ALTER TABLE payment_history 
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add index for external_reference
CREATE INDEX IF NOT EXISTS idx_payment_history_external_reference 
ON payment_history(external_reference);

-- Add index for payment_data
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_data 
ON payment_history USING gin(payment_data);

-- Add index for metadata
CREATE INDEX IF NOT EXISTS idx_payment_history_metadata 
ON payment_history USING gin(metadata);

-- Update comments
COMMENT ON COLUMN payment_history.external_reference IS 'External reference from payment provider (usually user_id)';
COMMENT ON COLUMN payment_history.payment_data IS 'Full payment data from payment provider';
COMMENT ON COLUMN payment_history.metadata IS 'Additional payment metadata stored as JSON';
COMMENT ON COLUMN payment_history.payment_provider IS 'Payment provider (stripe, mercadopago, etc.)';
COMMENT ON COLUMN payment_history.payment_id IS 'External payment ID from payment provider';
COMMENT ON COLUMN payment_history.description IS 'Payment description';
COMMENT ON COLUMN payment_history.payment_method IS 'Payment method (pix, credit_card, etc.)';
