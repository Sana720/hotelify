-- Consolidated Migration: Leads Table with All Metadata
-- Apply this if you are missing columns like 'phone', 'room_count', or 'property_type'

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    hotel_name TEXT NOT NULL,
    phone TEXT,
    room_count INTEGER,
    property_type TEXT,
    status TEXT CHECK (status IN ('Pending', 'Contacted', 'Converted', 'Spam')) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email)
);

-- Ensure columns exist if table was already created
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS room_count INTEGER;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a lead (from the signup page)
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.leads;
CREATE POLICY "Enable insert for everyone" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Allow only authenticated admins to view/update leads
DROP POLICY IF EXISTS "Enable select for authenticated users" ON public.leads;
CREATE POLICY "Enable select for authenticated users" ON public.leads
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.leads;
CREATE POLICY "Enable update for authenticated users" ON public.leads
    FOR UPDATE TO authenticated USING (true);
