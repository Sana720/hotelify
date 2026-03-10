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

-- Only platform admins or owners can update organizations (Placeholder for platform admin role)
CREATE POLICY "Owners can update their organization" ON organizations
  FOR UPDATE USING (id = current_org_id());

-- 3. Roles Table Policies
CREATE POLICY "Users can view their org roles" ON roles
  FOR SELECT USING (org_id = current_org_id());

-- 4. Staff Table Policies
CREATE POLICY "Users can view their org staff" ON staff
  FOR SELECT USING (org_id = current_org_id());

-- 5. Rooms Table Policies
CREATE POLICY "Users can view their org rooms" ON rooms
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org rooms" ON rooms
  FOR ALL USING (org_id = current_org_id());

-- 6. Bookings Table Policies
CREATE POLICY "Users can view their org bookings" ON bookings
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org bookings" ON bookings
  FOR ALL USING (org_id = current_org_id());

-- 7. Laundry Table Policies
CREATE POLICY "Users can view their org laundry" ON laundry_cycles
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org laundry" ON laundry_cycles
  FOR ALL USING (org_id = current_org_id());

-- 8. Attendance Table Policies
CREATE POLICY "Users can view their org attendance" ON attendance
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org attendance" ON attendance
  FOR ALL USING (org_id = current_org_id());

-- 9. Folio Table Policies
CREATE POLICY "Users can view their org folios" ON folios
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org folios" ON folios
  FOR ALL USING (org_id = current_org_id());

-- 10. Folio Item Policies
CREATE POLICY "Users can view their org folio items" ON folio_items
  FOR SELECT USING (org_id = current_org_id());

CREATE POLICY "Users can manage their org folio items" ON folio_items
  FOR ALL USING (org_id = current_org_id());
