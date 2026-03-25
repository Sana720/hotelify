-- Migration: Ensure staff can view their own records for RLS membership checks

DROP POLICY IF EXISTS "Staff can view own record" ON staff;
CREATE POLICY "Staff can view own record" ON staff
    FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can view team members" ON staff;
CREATE POLICY "Staff can view team members" ON staff
    FOR SELECT
    USING (org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()));
