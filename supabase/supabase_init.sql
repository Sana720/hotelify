-- ==========================================
-- HOTELIFY SaaS - COMPLETE INITIALIZATION SCRIPT
-- Copy and paste this into your Supabase SQL Editor
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE TABLES
-- Organizations (Hotels)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  subscription_tier TEXT CHECK (subscription_tier IN ('essential', 'professional', 'enterprise')) DEFAULT 'essential',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Profiles
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID UNIQUE, -- Links to auth.users (Supabase Auth)
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role_id UUID REFERENCES roles(id),
  pin_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  floor TEXT,
  type TEXT NOT NULL,
  status TEXT CHECK (status IN ('available', 'occupied', 'dirty', 'cleaning', 'maintenance')) DEFAULT 'available',
  base_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')) DEFAULT 'confirmed',
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folios (Guest Billing)
CREATE TABLE IF NOT EXISTS folios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('open', 'closed', 'void')) DEFAULT 'open',
  total_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folio Items (Itemized Charges)
CREATE TABLE IF NOT EXISTS folio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  folio_id UUID REFERENCES folios(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT CHECK (type IN ('accommodation', 'service', 'tax', 'adjustment')) DEFAULT 'accommodation',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Laundry
CREATE TABLE IF NOT EXISTS laundry_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id),
  type TEXT CHECK (type IN ('internal', 'external')),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed')) DEFAULT 'pending',
  vendor_name TEXT,
  items JSONB, -- Array of {type, quantity}
  delivery_reconciliation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ,
  location JSONB, -- {lat, lng}
  qr_code_session UUID, -- Validates the specific dynamic QR scanned
  status TEXT DEFAULT 'present'
);

-- 3. ENABLING RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE folios ENABLE ROW LEVEL SECURITY;
ALTER TABLE folio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE laundry_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- Helper Function
CREATE OR REPLACE FUNCTION current_org_id() 
RETURNS UUID AS $$
  SELECT org_id FROM staff WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Organizations: Allow public metadata view for tenant resolution
CREATE POLICY "Public can view organization metadata" ON organizations FOR SELECT USING (true);
CREATE POLICY "Owners can update their organization" ON organizations FOR UPDATE USING (id = current_org_id());

-- Generic Org-Based Policies (Select/All)
CREATE POLICY "Staff view rooms" ON rooms FOR SELECT USING (org_id = current_org_id() OR org_id IS NULL);
CREATE POLICY "Staff manage rooms" ON rooms FOR ALL USING (org_id = current_org_id());

CREATE POLICY "Staff view bookings" ON bookings FOR SELECT USING (org_id = current_org_id());
CREATE POLICY "Staff manage bookings" ON bookings FOR ALL USING (org_id = current_org_id());

CREATE POLICY "Staff view folios" ON folios FOR SELECT USING (org_id = current_org_id());
CREATE POLICY "Staff manage folios" ON folios FOR ALL USING (org_id = current_org_id());

CREATE POLICY "Staff view folio_items" ON folio_items FOR SELECT USING (org_id = current_org_id());
CREATE POLICY "Staff manage folio_items" ON folio_items FOR ALL USING (org_id = current_org_id());

-- 5. SEED DATA
INSERT INTO organizations (id, name, subdomain, subscription_tier)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grand Royal Hotel', 'grandroyal', 'enterprise'),
  ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Azure Boutique', 'azure', 'professional')
ON CONFLICT (subdomain) DO NOTHING;

INSERT INTO rooms (org_id, room_number, floor, type, status, base_price)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '101', '1', 'Deluxe King', 'available', 2999),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '102', '1', 'Deluxe King', 'occupied', 2999),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '103', '1', 'Standard Queen', 'dirty', 1999),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '104', '1', 'Standard Queen', 'available', 1999),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '201', '2', 'Executive Suite', 'maintenance', 5500),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '202', '2', 'Executive Suite', 'cleaning', 5500),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '203', '2', 'Deluxe King', 'available', 2999),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '204', '2', 'Standard Queen', 'available', 1999)
ON CONFLICT DO NOTHING;
