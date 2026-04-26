-- ============================================================================
-- Schools System for B2B Partnerships
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,                          -- "Cultura Inglesa Teresina"
  slug TEXT UNIQUE NOT NULL,                   -- "cultura-teresina" (for URLs)
  code TEXT UNIQUE NOT NULL,                   -- "SCH-XXXX" (signup code)

  -- Organization
  group_name TEXT,                             -- "Cultura Inglesa" (parent org)
  branch_name TEXT,                            -- "Teresina" (branch identifier)

  -- Contact
  contact_name TEXT,                           -- Director/Coordinator name
  contact_email TEXT,
  contact_phone TEXT,

  -- Location
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brazil',
  timezone TEXT DEFAULT 'America/Sao_Paulo',

  -- Partnership Details
  partnership_tier TEXT DEFAULT 'pilot'        -- pilot, basic, premium, enterprise
    CHECK (partnership_tier IN ('pilot', 'basic', 'premium', 'enterprise')),
  partnership_start DATE DEFAULT CURRENT_DATE,
  partnership_end DATE,                        -- NULL = ongoing

  -- Settings
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e40af',        -- For branding
  welcome_message TEXT,                        -- Custom welcome (English)
  welcome_message_pt TEXT,                     -- Portuguese
  welcome_message_th TEXT,                     -- Thai
  features_config JSONB DEFAULT '{}',          -- Feature flags

  -- Auto-premium for students
  auto_premium BOOLEAN DEFAULT true,           -- Pilot schools get auto-premium
  premium_duration_days INTEGER DEFAULT 365,   -- How long premium lasts

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHOOL LEVELS (Maps school's levels to Habitat difficulty levels)
CREATE TABLE IF NOT EXISTS school_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,

  -- School's Level
  name TEXT NOT NULL,                          -- "Portal 1", "Headway beginner", etc.
  display_order INTEGER DEFAULT 0,             -- For sorting in dropdowns

  -- Habitat Mapping
  habitat_level TEXT NOT NULL DEFAULT 'Level 1' -- "Level 1", "Level 2", "Level 3"
    CHECK (habitat_level IN ('Level 1', 'Level 2', 'Level 3')),

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(school_id, name)
);

-- 3. SCHOOL TEACHERS
CREATE TABLE IF NOT EXISTS school_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT,                                  -- Optional, for future features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(school_id, name)
);

-- 4. ADD COLUMNS TO USERS TABLE
ALTER TABLE users
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES school_teachers(id),
ADD COLUMN IF NOT EXISTS school_level_id UUID REFERENCES school_levels(id),
ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ;

-- Update school_id to reference schools table if not already
-- (Column exists but might not have FK constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_school_id_fkey'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_school_id_fkey
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_group ON schools(group_name);
CREATE INDEX IF NOT EXISTS idx_schools_active ON schools(is_active);
CREATE INDEX IF NOT EXISTS idx_school_levels_school ON school_levels(school_id);
CREATE INDEX IF NOT EXISTS idx_school_levels_active ON school_levels(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_school_teachers_school ON school_teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_school_teachers_active ON school_teachers(school_id, is_active);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id) WHERE school_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_teacher ON users(teacher_id) WHERE teacher_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_school_level ON users(school_level_id) WHERE school_level_id IS NOT NULL;

-- 6. RLS POLICIES
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_teachers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Service role full access on schools" ON schools;
DROP POLICY IF EXISTS "Service role full access on school_levels" ON school_levels;
DROP POLICY IF EXISTS "Service role full access on school_teachers" ON school_teachers;

-- Service role has full access
CREATE POLICY "Service role full access on schools"
  ON schools FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on school_levels"
  ON school_levels FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on school_teachers"
  ON school_teachers FOR ALL USING (true) WITH CHECK (true);

-- 7. HELPER FUNCTION: Generate school code
CREATE OR REPLACE FUNCTION generate_school_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code like "SCH-A7K9"
    new_code := 'SCH-' || upper(substr(md5(random()::text), 1, 4));

    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM schools WHERE code = new_code) INTO code_exists;

    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 8. HELPER FUNCTION: Generate slug from name
CREATE OR REPLACE FUNCTION generate_school_slug(school_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(trim(school_name));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  LOOP
    SELECT EXISTS(SELECT 1 FROM schools WHERE slug = final_slug) INTO slug_exists;
    EXIT WHEN NOT slug_exists;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- 9. AUTO-UPDATE TRIGGER
CREATE OR REPLACE FUNCTION update_schools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_schools_updated_at ON schools;
CREATE TRIGGER trigger_update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_schools_updated_at();

-- ============================================================================
-- SAMPLE DATA: Cultura Inglesa Teresina (for testing)
-- Uncomment and run after migration to pre-populate
-- ============================================================================

-- Insert Cultura Inglesa Teresina
/*
INSERT INTO schools (name, slug, code, group_name, branch_name, city, state, country, partnership_tier, auto_premium)
VALUES (
  'Cultura Inglesa Teresina',
  'cultura-teresina',
  'SCH-CULT',
  'Cultura Inglesa',
  'Teresina',
  'Teresina',
  'Piauí',
  'Brazil',
  'pilot',
  true
)
ON CONFLICT (slug) DO NOTHING
RETURNING id;

-- Get the school ID for adding levels
-- Then insert levels:

-- Level 1 courses
INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'Portal 1', 'Level 1', 1 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'Portal 2', 'Level 1', 2 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'Portal 3', 'Level 1', 3 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'Headway Beginner', 'Level 1', 4 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'Headway Elementary', 'Level 1', 5 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

-- Level 2 courses
INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'Close Up 1', 'Level 2', 10 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'Close Up 2', 'Level 2', 11 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'Headway Pre-Intermediate', 'Level 2', 12 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'English File Intermediate', 'Level 2', 13 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;

INSERT INTO school_levels (school_id, name, habitat_level, display_order)
SELECT id, 'English File Upper-Intermediate', 'Level 2', 14 FROM schools WHERE slug = 'cultura-teresina'
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'school%';

-- Check schools
-- SELECT * FROM schools;

-- Check school levels
-- SELECT sl.*, s.name as school_name FROM school_levels sl JOIN schools s ON sl.school_id = s.id;

-- Check users with school assignments
-- SELECT id, email, full_name, school_id, school_level_id, teacher_id FROM users WHERE school_id IS NOT NULL;
