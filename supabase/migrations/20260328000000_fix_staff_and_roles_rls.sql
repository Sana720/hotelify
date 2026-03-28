-- Migration: Fix Missing Team Management RLS Policies
-- This migration ensures that property staff can manage their own org's roles and staff directory.

-- 1. Roles Table Policies
-- Clean up existing policies for 'roles'
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.roles;
DROP POLICY IF EXISTS "Users can view their org roles" ON public.roles;
DROP POLICY IF EXISTS "Staff manage their own org roles" ON public.roles;
DROP POLICY IF EXISTS "Platform admins manage all roles" ON public.roles;

-- Create management policy for roles
CREATE POLICY "Staff manage their own org roles" ON public.roles
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

-- Create platform admin fallback policy for roles
CREATE POLICY "Platform admins manage all roles" ON public.roles
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 2. Staff Table Policies
-- Clean up existing policies for 'staff'
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.staff;
DROP POLICY IF EXISTS "Users can view their org staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own record" ON public.staff;
DROP POLICY IF EXISTS "Staff can view team members" ON public.staff;
DROP POLICY IF EXISTS "Staff manage their own org team" ON public.staff;
DROP POLICY IF EXISTS "Platform admins manage all staff" ON public.staff;

-- Create management policy for staff (allowing INSERT/UPDATE/DELETE)
CREATE POLICY "Staff manage their own org team" ON public.staff
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

-- Re-apply 'own record' view for simplicity
CREATE POLICY "Staff can view own record" ON public.staff
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Re-apply platform admin fallback policy for staff
CREATE POLICY "Platform admins manage all staff" ON public.staff
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 3. Ensure permissions are set
GRANT ALL ON public.roles TO authenticated;
GRANT ALL ON public.staff TO authenticated;
