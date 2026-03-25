-- RLS Policies for Hotelify SaaS

-- 1. Helper Function to get the current user's organization ID
CREATE OR REPLACE FUNCTION current_org_id() 
RETURNS UUID AS $$
  SELECT org_id FROM staff WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- 2. Organizations Table Policies
-- Allow anyone to view basic organization info (needed for tenant resolution)
CREATE POLICY "Public can view organization metadata" ON organizations
  FOR SELECT USING (true);

-- Only platform admins or owners can update organizations
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON organizations;
CREATE POLICY "Enable all for verified platform admins" ON organizations
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Owners can update their organization" ON organizations
  FOR UPDATE USING (id = current_org_id());

-- 3. Roles Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON roles;
CREATE POLICY "Enable all for verified platform admins" ON roles
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org roles" ON roles
  FOR SELECT USING (org_id = current_org_id());

-- 4. Staff Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON staff;
CREATE POLICY "Enable all for verified platform admins" ON staff
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org staff" ON staff
  FOR SELECT USING (org_id = current_org_id());

-- 5. Rooms Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON rooms;
CREATE POLICY "Enable all for verified platform admins" ON rooms
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org rooms" ON rooms
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org rooms" ON rooms
  FOR ALL USING (org_id = current_org_id());

-- 6. Bookings Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON bookings;
CREATE POLICY "Enable all for verified platform admins" ON bookings
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org bookings" ON bookings
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org bookings" ON bookings
  FOR ALL USING (org_id = current_org_id());

-- 7. Laundry Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON laundry_cycles;
CREATE POLICY "Enable all for verified platform admins" ON laundry_cycles
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org laundry" ON laundry_cycles
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org laundry" ON laundry_cycles
  FOR ALL USING (org_id = current_org_id());

-- 8. Attendance Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON attendance;
CREATE POLICY "Enable all for verified platform admins" ON attendance
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org attendance" ON attendance
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org attendance" ON attendance
  FOR ALL USING (org_id = current_org_id());

-- 9. Folio Table Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON folios;
CREATE POLICY "Enable all for verified platform admins" ON folios
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org folios" ON folios
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org folios" ON folios
  FOR ALL USING (org_id = current_org_id());

-- 10. Folio Item Policies
DROP POLICY IF EXISTS "Enable all for verified platform admins" ON folio_items;
CREATE POLICY "Enable all for verified platform admins" ON folio_items
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their org folio items" ON folio_items
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org folio items" ON folio_items
  FOR ALL USING (org_id = current_org_id());
