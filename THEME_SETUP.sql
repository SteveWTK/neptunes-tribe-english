-- THEME_SETUP.sql
-- Run this in your Supabase SQL Editor to set up the theme system

-- ============================================================================
-- 1. CREATE get_current_weekly_theme RPC FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_weekly_theme()
RETURNS TABLE (
  id uuid,
  theme_name text,
  description text,
  theme_title text,
  theme_title_pt text,
  theme_description text,
  theme_description_pt text,
  ecosystem_type varchar(50),
  featured_regions text[],
  featured_marine_zones text[],
  featured_image_url text,
  week_start_date date,
  week_end_date date,
  is_active boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    wt.id,
    wt.theme_title as theme_name,
    wt.theme_description as description,
    wt.theme_title,
    wt.theme_title_pt,
    wt.theme_description,
    wt.theme_description_pt,
    wt.ecosystem_type,
    wt.featured_regions,
    wt.featured_marine_zones,
    wt.featured_image_url,
    wt.week_start_date,
    wt.week_end_date,
    wt.is_active
  FROM weekly_themes wt
  WHERE wt.is_active = true
  ORDER BY wt.week_start_date DESC
  LIMIT 1;
$$;

-- ============================================================================
-- 2. ADD theme_tags COLUMNS TO UNITS AND LESSONS (if not already added)
-- ============================================================================

-- Add theme_tags to units table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'units' AND column_name = 'theme_tags'
  ) THEN
    ALTER TABLE units ADD COLUMN theme_tags TEXT[];
  END IF;
END $$;

-- Add theme_tags to lessons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lessons' AND column_name = 'theme_tags'
  ) THEN
    ALTER TABLE lessons ADD COLUMN theme_tags TEXT[];
  END IF;
END $$;

-- ============================================================================
-- 3. CREATE HELPER FUNCTION TO GET THEME CONTENT
-- ============================================================================

CREATE OR REPLACE FUNCTION get_theme_content(theme_tag text)
RETURNS TABLE (
  content_type text,
  content_id text,
  title text,
  description text,
  image_url text,
  difficulty text,
  xp_reward integer,
  is_premium boolean,
  sort_order integer
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Get units with the theme tag
  SELECT
    'unit' as content_type,
    u.id::text as content_id,
    u.title,
    u.description,
    u.image as image_url,
    u.difficulty_level as difficulty,
    50 as xp_reward,
    u.is_premium,
    0 as sort_order
  FROM units u
  WHERE u.theme_tags @> ARRAY[theme_tag]

  UNION ALL

  -- Get lessons with the theme tag
  SELECT
    'lesson' as content_type,
    l.id::text as content_id,
    l.title,
    l.description,
    l.image_url,
    l.difficulty,
    l.xp_reward,
    false as is_premium, -- lessons are not premium for now
    l.sort_order
  FROM lessons l
  WHERE l.is_active = true
    AND l.theme_tags @> ARRAY[theme_tag]

  ORDER BY content_type, sort_order, title;
$$;

-- ============================================================================
-- 4. CREATE SAMPLE WEEKLY THEME FOR TESTING
-- ============================================================================

-- Insert a sample weekly theme (modify dates as needed)
INSERT INTO weekly_themes (
  week_start_date,
  week_end_date,
  theme_title,
  theme_title_pt,
  theme_description,
  theme_description_pt,
  ecosystem_type,
  featured_regions,
  featured_marine_zones,
  featured_image_url,
  is_active
) VALUES (
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  'Amazon Rainforest Week',
  'Semana da Floresta Amazônica',
  'Explore the lungs of the Earth and discover the incredible biodiversity of the Amazon rainforest.',
  'Explore os pulmões da Terra e descubra a incrível biodiversidade da floresta amazônica.',
  'rainforest',
  ARRAY['amazon', 'south-america'],
  ARRAY[],
  'https://example.com/amazon-image.jpg',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. SAMPLE DATA: TAG SOME UNITS AND LESSONS
-- ============================================================================

-- Tag some units for Amazon theme (adjust IDs based on your data)
-- You'll need to run these with actual unit IDs from your database
/*
UPDATE units
SET theme_tags = ARRAY['amazon', 'rainforest', 'biodiversity']
WHERE id IN (1, 2, 3) -- Replace with actual unit IDs
  AND region_name ILIKE '%amazon%';

UPDATE units
SET theme_tags = ARRAY['ocean', 'marine', 'coral-reef']
WHERE id IN (4, 5, 6) -- Replace with actual unit IDs
  AND region_name ILIKE '%ocean%';
*/

-- ============================================================================
-- 6. VERIFICATION QUERIES
-- ============================================================================

-- Test the RPC function
SELECT * FROM get_current_weekly_theme();

-- Check if theme_tags columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('units', 'lessons')
  AND column_name = 'theme_tags';

-- Test theme content function (replace 'amazon' with actual tag)
-- SELECT * FROM get_theme_content('amazon');

-- ============================================================================
-- MANUAL TAGGING INSTRUCTIONS
-- ============================================================================

/*
TO MANUALLY TAG CONTENT FOR THEMES:

1. First, find units you want to include:
   SELECT id, title, region_name FROM units ORDER BY id;

2. Tag units for a theme:
   UPDATE units
   SET theme_tags = ARRAY['amazon', 'rainforest']
   WHERE id IN (42, 43, 44); -- Your chosen unit IDs

3. Tag lessons for a theme:
   UPDATE lessons
   SET theme_tags = ARRAY['amazon', 'rainforest']
   WHERE id IN ('lesson-uuid-1', 'lesson-uuid-2');

4. Create unit/lesson pairs:
   - Tag a unit with: ARRAY['amazon', 'vocabulary']
   - Tag its related lesson with: ARRAY['amazon', 'lesson', 'vocabulary']
   - This creates a clear connection between them

5. Test your tagging:
   SELECT * FROM get_theme_content('amazon');
*/