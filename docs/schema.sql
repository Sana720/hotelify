# Hotelify Database Schema (Reference)

## Organizations (Hotels)
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  subscription_tier TEXT CHECK (subscription_tier IN ('essential', 'professional', 'enterprise')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Roles & Permissions
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Staff Profiles
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID UNIQUE, -- Links to auth.users
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role_id UUID REFERENCES roles(id),
  pin_code TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Attendance
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMPTZ,
  location JSONB, -- {lat, lng}
  qr_code_session UUID, -- Validates the specific dynamic QR scanned
  status TEXT DEFAULT 'present'
);
```

## Rooms
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  floor TEXT,
  type TEXT NOT NULL,
  status TEXT CHECK (status IN ('available', 'occupied', 'dirty', 'cleaning', 'maintenance')) DEFAULT 'available',
  base_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Laundry
```sql
CREATE TABLE laundry_cycles (
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
```

## Bookings
```sql
CREATE TABLE bookings (
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
```
