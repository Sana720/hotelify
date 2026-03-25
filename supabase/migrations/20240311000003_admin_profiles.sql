-- Migration: Platform Admins & Infrastructure Security

-- 1. Create Platform Admins table
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    level TEXT CHECK (level IN ('super', 'read-only')) DEFAULT 'super',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- 3. Basic RLS for platform_admins
-- Users can manage their own admin record (non-recursive)
CREATE POLICY platform_admins_isolation ON platform_admins
    FOR ALL
    USING (user_id = auth.uid());

-- 4. Secure the organizations table for Platform Admins
-- Non-admin staff should only see their own org.
-- Platform admins should see ALL orgs.

DROP POLICY IF EXISTS "Enable all for verified platform admins" ON organizations;
CREATE POLICY "Enable all for verified platform admins" ON organizations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE user_id = auth.uid()
        )
    );

-- Update existing organization policy to ensure it doesn't conflict
-- Assuming existence of org_id linking for staff (this is simplified for now)
CREATE POLICY "Staff see own organization" ON organizations
    FOR SELECT
    USING (
        id IN (
            SELECT org_id FROM staff 
            WHERE user_id = auth.uid()
        )
    );
