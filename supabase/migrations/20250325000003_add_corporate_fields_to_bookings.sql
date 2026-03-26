-- Add guest_type and corporate fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS guest_type TEXT CHECK (guest_type IN ('individual', 'corporate')) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_gst TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT;

-- Index for corporate booking search
CREATE INDEX IF NOT EXISTS idx_bookings_company ON public.bookings(company_name) WHERE guest_type = 'corporate';
