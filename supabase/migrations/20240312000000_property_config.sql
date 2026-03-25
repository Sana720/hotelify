-- Property Infrastructure & Configuration Expansion
-- This migration adds the master data and organizational tables required for a professional PMS flow.

-- 1. Master Bed Types
CREATE TABLE IF NOT EXISTS bed_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE, -- King, Queen, Twin, Double, Sofa Bed, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Bed Types
INSERT INTO bed_types (name) VALUES 
  ('King Bed'), ('Queen Bed'), ('Twin Bed'), ('Double Bed'), ('Single Bed'), ('Sofa Bed')
ON CONFLICT (name) DO NOTHING;

-- 2. Master Amenities Library
CREATE TABLE IF NOT EXISTS amenities_master (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- Room, Bathroom, Property, Wellness
  icon TEXT, -- Lucide icon name
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Amenities
INSERT INTO amenities_master (name, category, icon) VALUES 
  ('High-Speed WiFi', 'Room', 'Wifi'),
  ('Air Conditioning', 'Room', 'Wind'),
  ('Mini Bar', 'Room', 'CupSoap'),
  ('Smart TV', 'Room', 'Tv'),
  ('Safe Box', 'Room', 'Lock'),
  ('Coffee Maker', 'Room', 'Coffee'),
  ('Hair Dryer', 'Bathroom', 'Wind'),
  ('Premium Toiletries', 'Bathroom', 'Sparkles'),
  ('Swimming Pool', 'Property', 'Waves'),
  ('Gym Access', 'Wellness', 'Dumbbell'),
  ('Free Parking', 'Property', 'Car'),
  ('Room Service', 'Property', 'Bell')
ON CONFLICT (name) DO NOTHING;

-- 3. Room Types (Categories)
CREATE TABLE IF NOT EXISTS room_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g. "Executive Suite"
  description TEXT,
  base_occupancy INT DEFAULT 2,
  max_occupancy INT DEFAULT 2,
  base_price DECIMAL(10, 2) NOT NULL,
  bed_configuration JSONB DEFAULT '[]', -- Array of {bed_type_id, count}
  amenities UUID[] DEFAULT '{}', -- Array of amenities_master IDs
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Property Identity & Localization
CREATE TABLE IF NOT EXISTS property_identity (
  org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  legal_name TEXT,
  tax_id TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  currency TEXT DEFAULT 'INR',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Operational Policies
CREATE TABLE IF NOT EXISTS operational_policies (
  org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  check_in_time TIME DEFAULT '14:00',
  check_out_time TIME DEFAULT '11:00',
  cancellation_policy TEXT DEFAULT 'Free cancellation up to 24 hours before check-in.',
  extra_bed_policy JSONB DEFAULT '{"allowed": false, "charge": 0}',
  child_policy TEXT DEFAULT 'Children of all ages are welcome.',
  pets_allowed BOOLEAN DEFAULT FALSE,
  smoking_allowed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Link Rooms to Room Types (Modification)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='rooms' AND COLUMN_NAME='room_type_id') THEN
    ALTER TABLE rooms ADD COLUMN room_type_id UUID REFERENCES room_types(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS for all new tables
ALTER TABLE bed_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_policies ENABLE ROW LEVEL SECURITY;

-- 7. Add Platform Admin Bypass Policies
CREATE POLICY "Enable all for verified platform admins" ON bed_types FOR ALL USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));
CREATE POLICY "Enable all for verified platform admins" ON amenities_master FOR ALL USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));
CREATE POLICY "Enable all for verified platform admins" ON room_types FOR ALL USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));
CREATE POLICY "Enable all for verified platform admins" ON property_identity FOR ALL USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));
CREATE POLICY "Enable all for verified platform admins" ON operational_policies FOR ALL USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

-- 8. Add Public/Tenant Policies
-- Master data is public for authenticated users
CREATE POLICY "Auth users can view master beds" ON bed_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Auth users can view master amenities" ON amenities_master FOR SELECT USING (auth.role() = 'authenticated');

-- Organization specific data
CREATE POLICY "Users can manage their org room types" ON room_types FOR ALL USING (org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their property identity" ON property_identity FOR ALL USING (org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their operational policies" ON operational_policies FOR ALL USING (org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()));
