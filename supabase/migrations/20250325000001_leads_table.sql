-- Migration: Create leads table for Superadmin Dashboard
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    hotel_name TEXT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Contacted', 'Converted', 'Spam')) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a lead (from the signup page)
CREATE POLICY "Enable insert for everyone" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Allow only authenticated admins to view/update leads
-- For now, we'll allow all authenticated users to read while we refine role checks, 
-- but in a production environment, this would be restricted to superadmins.
CREATE POLICY "Enable select for authenticated users" ON public.leads
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable update for authenticated users" ON public.leads
    FOR UPDATE TO authenticated USING (true);
