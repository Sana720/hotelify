-- Refinement of Folio (Billing) system for professional compliance
ALTER TABLE public.folios 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash',
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cgst NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS invoice_number TEXT;

-- Create a unique constraint for invoice numbers per organization if needed
-- For now, we'll generate them in the application layer or via a trigger

COMMENT ON COLUMN public.folios.sgst IS 'State Goods and Services Tax (typically 6% or 9%)';
COMMENT ON COLUMN public.folios.cgst IS 'Central Goods and Services Tax (typically 6% or 9%)';
COMMENT ON COLUMN public.folios.payment_method IS 'Method used for final settlement (Cash, Card, UPI, etc.)';
