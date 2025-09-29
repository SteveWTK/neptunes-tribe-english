-- QUICK_THEME_TEST.sql
-- Run this after THEME_SETUP.sql to quickly test the theme system

-- ============================================================================
-- 1. CREATE A TEST THEME
-- ============================================================================

-- First, deactivate any existing themes
UPDATE weekly_themes SET is_active = false;

-- Create or update a test theme
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
  'Explore the lungs of the Earth and discover the incredible biodiversity of the Amazon rainforest. Learn about wildlife, conservation, and the importance of this ecosystem.',
  'Explore os pulmões da Terra e descubra a incrível biodiversidade da floresta amazônica.',
  'amazon',
  ARRAY['south-america', 'brazil', 'peru'],
  ARRAY[],
  'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5',
  true
)
ON CONFLICT (id) DO UPDATE SET
  is_active = true,
  theme_title = EXCLUDED.theme_title,
  theme_description = EXCLUDED.theme_description;

-- ============================================================================
-- 2. TAG SOME EXISTING UNITS FOR TESTING
-- ============================================================================

-- Get the first 6 units and tag them for Amazon theme
WITH first_units AS (
  SELECT id FROM units ORDER BY id LIMIT 6
)
UPDATE units
SET theme_tags = ARRAY['amazon', 'vocabulary']
WHERE id IN (SELECT id FROM first_units);

-- ============================================================================
-- 3. TAG SOME EXISTING LESSONS FOR TESTING
-- ============================================================================

-- Get the first 3 active lessons and tag them for Amazon theme
WITH first_lessons AS (
  SELECT id FROM lessons WHERE is_active = true ORDER BY created_at LIMIT 3
)
UPDATE lessons
SET theme_tags = ARRAY['amazon', 'comprehensive']
WHERE id IN (SELECT id FROM first_lessons);

-- ============================================================================
-- 4. VERIFICATION QUERIES
-- ============================================================================

-- Check if the theme was created and is active
SELECT
  theme_title,
  ecosystem_type,
  is_active,
  week_start_date,
  week_end_date
FROM weekly_themes
WHERE is_active = true;

-- Test the RPC function
SELECT
  theme_name,
  description,
  ecosystem_type
FROM get_current_weekly_theme();

-- Check tagged units
SELECT
  id,
  title,
  theme_tags,
  image,
  region_name
FROM units
WHERE theme_tags @> ARRAY['amazon']
ORDER BY id;

-- Check tagged lessons
SELECT
  id,
  title,
  theme_tags,
  difficulty,
  xp_reward
FROM lessons
WHERE theme_tags @> ARRAY['amazon']
  AND is_active = true
ORDER BY created_at;

-- Test the theme content function
SELECT * FROM get_theme_content('amazon');

-- ============================================================================
-- 5. MANUAL CUSTOMIZATION (Optional)
-- ============================================================================

-- If you want to select specific units/lessons instead of the first ones:

/*
-- Example: Tag specific units by ID
UPDATE units
SET theme_tags = ARRAY['amazon', 'biodiversity']
WHERE id IN (42, 43, 44);

UPDATE units
SET theme_tags = ARRAY['amazon', 'conservation']
WHERE id IN (45, 46, 47);

-- Example: Tag specific lessons by ID
UPDATE lessons
SET theme_tags = ARRAY['amazon', 'ecosystem-deep-dive']
WHERE id = 'your-lesson-uuid-1';

UPDATE lessons
SET theme_tags = ARRAY['amazon', 'wildlife-exploration']
WHERE id = 'your-lesson-uuid-2';
*/

-- ============================================================================
-- SUCCESS! 🎉
-- ============================================================================

-- Your theme system should now be working!
-- Visit your app at /theme to see the content displayed.

-- Next steps:
-- 1. Visit /theme in your app
-- 2. Check that units and lessons are displayed
-- 3. Test clicking on units and lessons
-- 4. Use the management guide to add more specific content