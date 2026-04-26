-- ============================================================================
-- Cultura Inglesa Teresina Initial Setup
-- Run this AFTER schools-system.sql migration
-- ============================================================================

-- Insert Cultura Inglesa Teresina school
INSERT INTO schools (
  name,
  slug,
  code,
  group_name,
  branch_name,
  city,
  state,
  country,
  timezone,
  partnership_tier,
  auto_premium,
  premium_duration_days,
  welcome_message,
  welcome_message_pt,
  is_active
)
VALUES (
  'Cultura Inglesa Teresina',
  'cultura-teresina',
  'SCH-CULT',
  'Cultura Inglesa',
  'Teresina',
  'Teresina',
  'Piauí',
  'Brazil',
  'America/Sao_Paulo',
  'pilot',
  true,
  365,
  'Welcome to Habitat English! Your school has partnered with us to provide you with premium access to our conservation-themed English learning platform.',
  'Bem-vindo ao Habitat English! Sua escola fez parceria conosco para fornecer acesso premium à nossa plataforma de aprendizado de inglês com tema de conservação.',
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  group_name = EXCLUDED.group_name,
  branch_name = EXCLUDED.branch_name,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  partnership_tier = EXCLUDED.partnership_tier,
  auto_premium = EXCLUDED.auto_premium,
  welcome_message = EXCLUDED.welcome_message,
  welcome_message_pt = EXCLUDED.welcome_message_pt;

-- Get the school ID for inserting levels
DO $$
DECLARE
  v_school_id UUID;
BEGIN
  SELECT id INTO v_school_id FROM schools WHERE slug = 'cultura-teresina';

  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'Cultura Inglesa Teresina school not found';
  END IF;

  -- ========================================================================
  -- Level 1 Courses (Beginner)
  -- ========================================================================

  -- Portal 1
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'Portal 1', 'Level 1', 1, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- Portal 2
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'Portal 2', 'Level 1', 2, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- Portal 3
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'Portal 3', 'Level 1', 3, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- Headway Beginner
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'Headway Beginner', 'Level 1', 4, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- Headway Elementary
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'Headway Elementary', 'Level 1', 5, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- ========================================================================
  -- Level 2 Courses (Intermediate)
  -- ========================================================================

  -- Close Up 1
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'Close Up 1', 'Level 2', 10, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- Close Up 2
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'Close Up 2', 'Level 2', 11, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- Headway Pre-Intermediate
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'Headway Pre-Intermediate', 'Level 2', 12, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- English File Intermediate
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'English File Intermediate', 'Level 2', 13, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  -- English File Upper-Intermediate
  INSERT INTO school_levels (school_id, name, habitat_level, display_order, is_active)
  VALUES (v_school_id, 'English File Upper-Intermediate', 'Level 2', 14, true)
  ON CONFLICT (school_id, name) DO UPDATE SET
    habitat_level = EXCLUDED.habitat_level,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

  RAISE NOTICE 'Cultura Inglesa Teresina setup complete with 10 course levels';
END $$;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- View the school
SELECT id, name, slug, code, partnership_tier, auto_premium, is_active
FROM schools
WHERE slug = 'cultura-teresina';

-- View all levels for the school
SELECT sl.name, sl.habitat_level, sl.display_order, sl.is_active
FROM school_levels sl
JOIN schools s ON sl.school_id = s.id
WHERE s.slug = 'cultura-teresina'
ORDER BY sl.display_order;

-- Summary: Count of levels by habitat level
SELECT sl.habitat_level, COUNT(*) as count
FROM school_levels sl
JOIN schools s ON sl.school_id = s.id
WHERE s.slug = 'cultura-teresina' AND sl.is_active = true
GROUP BY sl.habitat_level
ORDER BY sl.habitat_level;
