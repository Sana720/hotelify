-- Migration: Resolve User Linkage and RLS Visibility
-- This migration links existing staff records to auth users and ensures platform admins have global visibility.

-- 1. Link existing staff records to auth.users by email
UPDATE public.staff s
SET user_id = u.id
FROM auth.users u
WHERE s.email = u.email AND s.user_id IS NULL;

-- 2. Refine get_my_org_id to be more resilient
-- If a user is a platform admin, we might want them to "see" the org they are browsing.
-- However, for the dashboard data fetching (which uses org_id filter), RLS already has a bypass.
-- Let's ensure the platform admin bypass is robust on all relevant tables.

-- Re-apply 'Staff manage their own org room types' to ensure it uses the latest get_my_org_id
DROP POLICY IF EXISTS "Staff manage their own org room types" ON public.room_types;
CREATE POLICY "Staff manage their own org room types" ON public.room_types
    FOR ALL
    TO authenticated
    USING (org_id = public.get_my_org_id())
    WITH CHECK (org_id = public.get_my_org_id());

-- 3. Ensure Master Data is visible to ALL authenticated users (including Platform Admins)
-- These already exist in some form, but let's ensure they are clean.
DROP POLICY IF EXISTS "Staff can view master bed types" ON public.bed_types;
CREATE POLICY "Staff can view master bed types" ON public.bed_types
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Staff can view master amenities" ON public.amenities_master;
CREATE POLICY "Staff can view master amenities" ON public.amenities_master
    FOR SELECT TO authenticated USING (true);

-- 4. Special check: If a user is a Platform Admin, they should see EVERYTHING in selective tables
-- This is already covered by "Platform admins manage all room types", but let's double check it exists.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'room_types' AND policyname = 'Platform admins manage all room types'
    ) THEN
        CREATE POLICY "Platform admins manage all room types" ON public.room_types
            FOR ALL
            TO authenticated
            USING (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()))
            WITH CHECK (EXISTS (SELECT 1 FROM public.platform_admins WHERE user_id = auth.uid()));
    END IF;
END $$;
