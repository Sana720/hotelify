-- Migration: Extend leads table for enriched metadata
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS room_count INTEGER,
ADD COLUMN IF NOT EXISTS property_type TEXT;

-- Index for searching (optional but good)
CREATE INDEX IF NOT EXISTS leads_hotel_name_idx ON public.leads(hotel_name);
