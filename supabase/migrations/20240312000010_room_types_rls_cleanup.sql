-- Migration: Room Types and Master Data RLS Cleanup
-- This ensures room categories and master data (bed types, amenities) use the stable get_my_org_id() pattern.

-- 1. Master Data (Read-only for staff, manage for admins)
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.bed_types;
DROP POLICY IF EXISTS "Auth users can view master beds" ON public.bed_types;
CREATE POLICY "Platform admins manage all bed types" ON public.bed_types
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));
CREATE POLICY "Staff can view master bed types" ON public.bed_types
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.amenities_master;
DROP POLICY IF EXISTS "Auth users can view master amenities" ON public.amenities_master;
CREATE POLICY "Platform admins manage all amenities master" ON public.amenities_master
    FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));
CREATE POLICY "Staff can view master amenities" ON public.amenities_master
    FOR SELECT TO authenticated USING (true);

-- 2. Room Types (Tenant-isolated)
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON public.room_types;
DROP POLICY IF EXISTS "Users can manage their org room types" ON public.room_types;
CREATE POLICY "Staff manage their own org room types" ON public.room_types
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

CREATE POLICY "Platform admins manage all room types" ON public.room_types
    FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));
