-- Add assigned_staff_id to rooms for persistent assignment
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;

-- Create housekeeping_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.housekeeping_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    action_type TEXT DEFAULT 'status_change', -- status_change, assignment, completion
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_housekeeping_logs_room ON public.housekeeping_logs(room_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_logs_org ON public.housekeeping_logs(org_id);
