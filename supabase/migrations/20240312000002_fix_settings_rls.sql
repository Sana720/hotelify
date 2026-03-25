-- Refine RLS policies for property identity and operational policies
-- Ensure that the 'FOR ALL' policies also include 'WITH CHECK' and handle cross-org checks

-- 1. Property Identity
DROP POLICY IF EXISTS "Users can manage their property identity" ON property_identity;
CREATE POLICY "Users can manage their property identity" ON property_identity 
  FOR ALL 
  USING (
    org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  );

-- 2. Operational Policies
DROP POLICY IF EXISTS "Users can manage their operational policies" ON operational_policies;
CREATE POLICY "Users can manage their operational policies" ON operational_policies 
  FOR ALL 
  USING (
    org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  );
