-- Add advance_amount to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT 0;

-- Update existing bookings to have 0 advance if NULL
UPDATE public.bookings SET advance_amount = 0 WHERE advance_amount IS NULL;
