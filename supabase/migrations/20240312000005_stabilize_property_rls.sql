-- Migration: Stabilize Property Settings RLS
-- This migration ensures get_my_org_id is robust and fixes common RLS pitfalls.

-- 1. Redefine get_my_org_id with explicit search path and error handling
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- We explicitly qualify everything to avoid search_path issues
  -- and use the SECURITY DEFINER to bypass RLS on the staff table itself.
  SELECT org_id INTO v_org_id 
  FROM public.staff 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. Ensure RLS is enabled (it should be, but let's be safe)
ALTER TABLE IF EXISTS public.property_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.operational_policies ENABLE ROW LEVEL SECURITY;

-- 3. Re-apply Property Identity Policies
DROP POLICY IF EXISTS "Users can manage their property identity" ON public.property_identity;
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.property_identity;

CREATE POLICY "Platform admins can manage all property identity" ON public.property_identity
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage their own org property identity" ON public.property_identity
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

-- 4. Re-apply Operational Policies
DROP POLICY IF EXISTS "Users can manage their operational policies" ON public.operational_policies;
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.operational_policies;

CREATE POLICY "Platform admins can manage all operational policies" ON public.operational_policies
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Staff can manage their own org operational policies" ON public.operational_policies
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

-- 5. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO anon;
