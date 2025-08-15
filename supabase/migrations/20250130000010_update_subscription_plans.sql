-- Update subscription plans to match current pricing
-- Fix: Estudante plan price and remove unused Profissional plan

-- Update Estudante plan price from 29.00 to 18.99
UPDATE subscription_plans 
SET 
  price = 18.99,
  updated_at = now()
WHERE name = 'Estudante';

-- Deactivate Profissional plan (no longer used)
UPDATE subscription_plans 
SET 
  active = false,
  updated_at = now()
WHERE name = 'Profissional';

-- Log the changes
DO $$
BEGIN
  RAISE NOTICE 'Updated Estudante plan price to 18.99';
  RAISE NOTICE 'Deactivated Profissional plan';
END $$;
