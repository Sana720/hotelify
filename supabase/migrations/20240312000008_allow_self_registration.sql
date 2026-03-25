-- Migration: Allow Self-Registration
-- This migration adds policies to allow authenticated users to create their own organizations and staff records.

-- 1. Allow authenticated users to create an organization
CREATE POLICY "Authenticated users can create organizations" ON public.organizations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 2. Allow authenticated users to link themselves as staff
-- This is restricted to their own user_id.
CREATE POLICY "Users can create their own staff record" ON public.staff
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 3. Allow staff to create their own property identity and policies
-- Requirement: The staff record must already exist (which it will if done in order).
CREATE POLICY "Staff can create their org property identity" ON public.property_identity
    FOR INSERT
    TO authenticated
    WITH CHECK (org_id = public.get_my_org_id());

CREATE POLICY "Staff can create their org operational policies" ON public.operational_policies
    FOR INSERT
    TO authenticated
    WITH CHECK (org_id = public.get_my_org_id());
