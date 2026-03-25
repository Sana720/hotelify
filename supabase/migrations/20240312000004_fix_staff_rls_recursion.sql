-- Migration: Resolve RLS Recursion and stabilize Settings access

-- 1. Create a security definer function to break recursion
-- This function runs with the privileges of the creator (postgres) 
-- and can query the staff table even when RLS is enabled without triggering a loop.
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT org_id INTO v_org_id FROM public.staff WHERE user_id = auth.uid() LIMIT 1;
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update staff policies to use the function
-- We use individual isolation for SELECT/ALL
DROP POLICY IF EXISTS "Staff can view own record" ON public.staff;
CREATE POLICY "Staff can view own record" ON public.staff
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can view team members" ON public.staff;
CREATE POLICY "Staff can view team members" ON public.staff
    FOR SELECT
    USING (org_id = get_my_org_id());

-- 3. Update Hotel Settings policies to use the function (much cleaner)
-- Property Identity
DROP POLICY IF EXISTS "Users can manage their property identity" ON public.property_identity;
CREATE POLICY "Users can manage their property identity" ON public.property_identity 
  FOR ALL 
  USING (
    org_id = get_my_org_id() OR
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    org_id = get_my_org_id() OR
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
  );

-- Operational Policies
DROP POLICY IF EXISTS "Users can manage their operational policies" ON public.operational_policies;
CREATE POLICY "Users can manage their operational policies" ON public.operational_policies 
  FOR ALL 
  USING (
    org_id = get_my_org_id() OR
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    org_id = get_my_org_id() OR
    EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid())
  );
