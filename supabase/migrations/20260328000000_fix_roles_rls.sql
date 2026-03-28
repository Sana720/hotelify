-- Migration: Fix Missing Roles RLS Policies
-- This migration ensures that property staff can manage their own org's roles.

-- 1. Clean up existing policies for 'roles'
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.roles;
DROP POLICY IF EXISTS "Users can view their org roles" ON public.roles;
DROP POLICY IF EXISTS "Staff manage their own org roles" ON public.roles;

-- 2. Create the definitive management policy
-- Note: Re-using the get_my_org_id() pattern from previous migrations
CREATE POLICY "Staff manage their own org roles" ON public.roles
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

-- 3. Re-apply platform admin fallback
CREATE POLICY "Platform admins manage all roles" ON public.roles
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 4. Ensure permissions are set
GRANT ALL ON public.roles TO authenticated;
