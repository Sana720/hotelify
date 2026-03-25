-- Migration: Add status column to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('Active', 'Trial', 'Maintenance', 'Suspended')) DEFAULT 'Active';

-- Update existing records to 'Active' status
UPDATE public.organizations SET status = 'Active' WHERE status IS NULL;
