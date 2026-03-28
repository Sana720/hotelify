-- Drop the legacy check constraint on subscription tiers
-- This allows for dynamic tiers created via the subscription_plans table.

ALTER TABLE organizations 
DROP CONSTRAINT IF EXISTS organizations_subscription_tier_check;
