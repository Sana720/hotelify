-- Create custom amenities table for organizations
CREATE TABLE IF NOT EXISTS amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'amenities' AND policyname = 'Enable all for verified platform admins') THEN
    CREATE POLICY "Enable all for verified platform admins" ON amenities FOR ALL USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'amenities' AND policyname = 'Users can manage their org amenities') THEN
    CREATE POLICY "Users can manage their org amenities" ON amenities FOR ALL USING (org_id IN (SELECT org_id FROM staff WHERE user_id = auth.uid()));
  END IF;
END $$;
