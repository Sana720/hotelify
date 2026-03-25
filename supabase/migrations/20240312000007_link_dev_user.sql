-- Migration: Manual Staff Linkage for Development
-- Use this script to manually associate a logged-in user with an organization
-- to satisfy RLS policies in the dashboard.

-- INSTRUCTIONS:
-- 1. Replace the UUIDs below with your actual data if they differ.
-- 2. Run this in the Supabase SQL Editor.

DO $$
DECLARE
  v_user_id UUID := '2d628cb0-59b1-4003-992b-ad0eb0c1ab77'; -- Your Current User ID
  v_org_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';  -- Your Tenant ID (Grand Royal)
BEGIN
  -- 1. Ensure the organization exists (it should, but safety first)
  IF EXISTS (SELECT 1 FROM organizations WHERE id = v_org_id) THEN
    -- 2. Link the user in the staff table
    INSERT INTO public.staff (user_id, org_id, email, full_name, is_active)
    VALUES (
      v_user_id,
      v_org_id,
      'admin@hotelify.com', -- Default dev email
      'Admin User',        -- Default dev name
      true
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET org_id = EXCLUDED.org_id, 
        is_active = true;
        
    RAISE NOTICE 'User % successfully linked to organization %', v_user_id, v_org_id;
  ELSE
    RAISE EXCEPTION 'Organization with ID % not found. Check your TenantProvider settings.', v_org_id;
  END IF;
END $$;
