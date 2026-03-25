-- Migration: Allow Staff to Update Own Organization
-- This fixes the RLS violation when staff try to update their hotel name/metadata.

DROP POLICY IF EXISTS "Staff update own organization" ON public.organizations;

CREATE POLICY "Staff update own organization" ON public.organizations
    FOR UPDATE
    TO authenticated
    USING (id = public.get_my_org_id())
    WITH CHECK (id = public.get_my_org_id());

-- Also ensure they can see it (already handled by 'Staff see own organization', but good to be explicit for ALL)
-- Actually, let's just make the existing 'Staff see own organization' a 'FOR ALL' if we want them to manage it,
-- but since we want to prevent DELETE/INSERT, a separate FOR UPDATE is better.
