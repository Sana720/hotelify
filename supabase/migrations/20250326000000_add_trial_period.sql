-- Add trial_ends_at to allow customizable free trial periods
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- Maintain subscription_status as well
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_subscription_status_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_subscription_status_check 
    CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing'));
