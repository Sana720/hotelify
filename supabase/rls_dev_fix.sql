-- ==========================================
-- HOTELIFY SaaS - RLS DEV FIX
-- ==========================================

-- 1. Drop the restrictive policies
DROP POLICY IF EXISTS "Staff view rooms" ON rooms;
DROP POLICY IF EXISTS "Staff view bookings" ON bookings;

-- 2. Create permissive policies for local development/preview
CREATE POLICY "Public view rooms" ON rooms 
  FOR SELECT 
  USING (true);

CREATE POLICY "Public view bookings" ON bookings 
  FOR SELECT 
  USING (true);

-- 3. (Optional) If you want to view folios publicly too
DROP POLICY IF EXISTS "Staff view folios" ON folios;
CREATE POLICY "Public view folios" ON folios FOR SELECT USING (true);
