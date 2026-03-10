-- Seed Data for Hotelify SaaS

-- 1. Create Test Organizations
INSERT INTO organizations (id, name, subdomain, subscription_tier)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Grand Royal Hotel', 'grandroyal', 'enterprise'),
  ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Azure Boutique', 'azure', 'professional')
ON CONFLICT (subdomain) DO NOTHING;

-- 2. Seed Rooms for Grand Royal Hotel
INSERT INTO rooms (org_id, room_number, floor, type, status, base_price)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '101', '1', 'Deluxe King', 'available', 299),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '102', '1', 'Deluxe King', 'occupied', 299),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '103', '1', 'Standard Queen', 'dirty', 199),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '104', '1', 'Standard Queen', 'available', 199),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '201', '2', 'Executive Suite', 'maintenance', 550),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '202', '2', 'Executive Suite', 'cleaning', 550),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '203', '2', 'Deluxe King', 'available', 299),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '204', '2', 'Standard Queen', 'available', 199)
ON CONFLICT DO NOTHING;

-- 3. Seed Rooms for Azure Boutique
INSERT INTO rooms (org_id, room_number, floor, type, status, base_price)
VALUES
  ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'A-01', '1', 'Ocean View', 'available', 450),
  ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'A-02', '1', 'Ocean View', 'occupied', 450),
  ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'B-01', '2', 'Garden Terrace', 'dirty', 350)
ON CONFLICT DO NOTHING;
