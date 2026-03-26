-- SaaS Subscription & Billing Infrastructure
-- This migration adds the commercial layer to the platform.

-- 1. Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    max_rooms INT NOT NULL,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Initial Plans
INSERT INTO subscription_plans (name, description, price_monthly, max_rooms, features) VALUES
('Essential', 'Core PMS features for small properties.', 4999.00, 20, '["Room Management", "Basic Reports", "Guest Registry"]'),
('Professional', 'Advanced tools for growing hotels.', 9999.00, 50, '["All Essential", "Inventory Analytics", "Multiple Users", "Email Notifications"]'),
('Enterprise', 'Full-scale solution for luxury resorts.', 24999.00, 999, '["All Professional", "Custom Domain", "Priority Support", "API Access"]')
ON CONFLICT (name) DO NOTHING;

-- 2. Organization Plan Linkage
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES subscription_plans(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing')) DEFAULT 'trialing';

-- Migration: Set default plan for existing orgs based on their current text tier
UPDATE organizations SET plan_id = (SELECT id FROM subscription_plans WHERE name = 'Essential') WHERE subscription_tier = 'essential' AND plan_id IS NULL;
UPDATE organizations SET plan_id = (SELECT id FROM subscription_plans WHERE name = 'Professional') WHERE subscription_tier = 'professional' AND plan_id IS NULL;
UPDATE organizations SET plan_id = (SELECT id FROM subscription_plans WHERE name = 'Enterprise') WHERE subscription_tier = 'enterprise' AND plan_id IS NULL;

-- 3. Platform Billing Records (SaaS Revenue)
CREATE TABLE IF NOT EXISTS platform_billing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT CHECK (status IN ('paid', 'pending', 'failed', 'refunded')) DEFAULT 'pending',
    transaction_id TEXT, -- Gateway reference
    billing_period_start DATE,
    billing_period_end DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS & Security (Superadmin Only)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_billing ENABLE ROW LEVEL SECURITY;

-- Superadmins can manage everything
CREATE POLICY "Superadmins manage subscription plans" ON subscription_plans 
FOR ALL USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Superadmins view all billing" ON platform_billing 
FOR SELECT USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

-- Clients can VIEW their own billing and available plans
CREATE POLICY "Orgs view available plans" ON subscription_plans 
FOR SELECT USING (is_active = true);

CREATE POLICY "Orgs view their own billing" ON platform_billing 
FOR SELECT USING (org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()));
