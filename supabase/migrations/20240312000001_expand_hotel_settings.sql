-- Migration to add missing hotel settings columns based on reference screenshot

-- 1. Add columns to property_identity
ALTER TABLE property_identity 
ADD COLUMN IF NOT EXISTS star_rating INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS tax_name TEXT,
ADD COLUMN IF NOT EXISTS tax_percent DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_registration_type TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. Add columns to operational_policies
ALTER TABLE operational_policies
ADD COLUMN IF NOT EXISTS upcoming_checkin_days INT DEFAULT 30,
ADD COLUMN IF NOT EXISTS upcoming_checkout_days INT DEFAULT 30;
