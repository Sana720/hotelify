-- Add guest_type and corporate fields to guests table
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS guest_type TEXT CHECK (guest_type IN ('individual', 'corporate')) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_gst TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT;

-- Index for company search
CREATE INDEX IF NOT EXISTS idx_guests_company ON public.guests(company_name) WHERE guest_type = 'corporate';
