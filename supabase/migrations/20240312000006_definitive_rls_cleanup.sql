-- Migration: DEFINITIVE RLS Cleanup and Recursion Fix
-- This migration drops ALL potentially recursive policies and replaces them with a stable, non-recursive system.

-- 1. Create a robust SECURITY DEFINER function to break recursion
-- This function runs as 'postgres' (the creator) and can query the staff table even when RLS is enabled.
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS UUID AS $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Explicitly qualify with 'public' to avoid schema search path issues
  SELECT org_id INTO v_org_id 
  FROM public.staff 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  RETURN v_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 2. Clean up ALL potentially recursive policies on 'staff'
-- We systematically drop every policy name that has been used in previous migrations.
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.staff;
DROP POLICY IF EXISTS "Users can view their org staff" ON public.staff;
DROP POLICY IF EXISTS "Staff can view own record" ON public.staff;
DROP POLICY IF EXISTS "Staff can view team members" ON public.staff;

-- 3. Re-apply STABLE policies to 'staff'
-- Note: These policies use auth.uid() directly or the security definer function.
CREATE POLICY "Staff can view own record" ON public.staff
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Staff can view team members" ON public.staff
    FOR SELECT
    TO authenticated
    USING (org_id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all staff" ON public.staff
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 4. Clean up and re-apply policies for 'organizations'
DROP POLICY IF EXISTS "Public can view organization metadata" ON public.organizations;
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Staff see own organization" ON public.organizations;

CREATE POLICY "Public can view organization metadata" ON public.organizations
    FOR SELECT
    USING (true);

CREATE POLICY "Staff see own organization" ON public.organizations
    FOR SELECT
    TO authenticated
    USING (id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all organizations" ON public.organizations
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 5. Clean up and re-apply policies for 'property_identity'
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.property_identity;
DROP POLICY IF EXISTS "Users can manage their property identity" ON public.property_identity;
DROP POLICY IF EXISTS "Platform admins can manage all property identity" ON public.property_identity;
DROP POLICY IF EXISTS "Staff can manage their own org property identity" ON public.property_identity;

CREATE POLICY "Staff manage their own org property identity" ON public.property_identity
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all property identity" ON public.property_identity
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 6. Clean up and re-apply policies for 'operational_policies'
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.operational_policies;
DROP POLICY IF EXISTS "Users can manage their operational policies" ON public.operational_policies;
DROP POLICY IF EXISTS "Platform admins can manage all operational policies" ON public.operational_policies;
DROP POLICY IF EXISTS "Staff can manage their own org operational policies" ON public.operational_policies;

CREATE POLICY "Staff manage their own org operational policies" ON public.operational_policies
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all operational policies" ON public.operational_policies
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 7. Rooms Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.rooms;
DROP POLICY IF EXISTS "Users can view their org rooms" ON public.rooms;
DROP POLICY IF EXISTS "Users can manage their org rooms" ON public.rooms;

CREATE POLICY "Staff manage their own org rooms" ON public.rooms
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all rooms" ON public.rooms
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 8. Bookings Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.bookings;
DROP POLICY IF EXISTS "Users can view their org bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can manage their org bookings" ON public.bookings;

CREATE POLICY "Staff manage their own org bookings" ON public.bookings
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all bookings" ON public.bookings
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 9. Attendance Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.attendance;
DROP POLICY IF EXISTS "Users can view their org attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can manage their org attendance" ON public.attendance;

CREATE POLICY "Staff manage their own org attendance" ON public.attendance
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all attendance" ON public.attendance
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 10. Laundry Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.laundry_cycles;
DROP POLICY IF EXISTS "Users can view their org laundry" ON public.laundry_cycles;
DROP POLICY IF EXISTS "Users can manage their org laundry" ON public.laundry_cycles;

CREATE POLICY "Staff manage their own org laundry" ON public.laundry_cycles
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all laundry" ON public.laundry_cycles
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));

-- 11. Folios & Folio Items Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.folios;
DROP POLICY IF EXISTS "Users can view their org folios" ON public.folios;
DROP POLICY IF EXISTS "Users can manage their org folios" ON public.folios;

CREATE POLICY "Staff manage their own org folios" ON public.folios
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.folio_items;
DROP POLICY IF EXISTS "Users can view their org folio items" ON public.folio_items;
DROP POLICY IF EXISTS "Users can manage their org folio items" ON public.folio_items;

CREATE POLICY "Staff manage their own org folio items" ON public.folio_items
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

-- 12. Ensure permissions are correct
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO anon;
