-- Migration: Add setup_step to organizations
-- Tracks the progress of the mandatory hotel setup wizard

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS setup_step TEXT CHECK (setup_step IN ('pending_settings', 'pending_room_types', 'pending_rooms', 'completed')) DEFAULT 'pending_settings';

-- Update existing organizations to 'completed' so they aren't blocked
UPDATE public.organizations SET setup_step = 'completed' WHERE setup_step IS NULL;
