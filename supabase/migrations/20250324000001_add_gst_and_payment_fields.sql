-- Create Guests table for intelligence and auto-fill
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    aadhaar_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, phone)
);

-- Add GST and payment fields to bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS gst_applied BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash',
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
ADD COLUMN IF NOT EXISTS num_adults INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS num_children INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS companion_details JSONB;

-- Index for phone search
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON public.bookings(phone);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(phone);
