-- ============================================
-- ADVENTURE-BASED PROGRESS SYSTEM MIGRATION
-- ============================================
-- This migration adds support for adventure-based species saving
-- Each adventure saves one species through 5 IUCN levels

-- 1. Create completed_species table to store saved species
CREATE TABLE IF NOT EXISTS completed_species (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  species_avatar_id UUID NOT NULL REFERENCES species_avatars(id) ON DELETE CASCADE,
  adventure_id TEXT NOT NULL, -- e.g., 'rainforests', 'temperate-forests'
  world_id TEXT NOT NULL, -- e.g., 'forests', 'deserts'
  final_iucn_status TEXT NOT NULL DEFAULT 'LC', -- Should always be 'LC' when saved
  lessons_completed INTEGER NOT NULL DEFAULT 5, -- Should always be 5
  points_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure user can only save same species once per adventure
  UNIQUE(user_id, species_avatar_id, adventure_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_completed_species_user ON completed_species(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_species_user_world ON completed_species(user_id, world_id);

-- 2. Modify user_species_journey table to track current adventure
ALTER TABLE user_species_journey
  ADD COLUMN IF NOT EXISTS current_adventure_id TEXT,
  ADD COLUMN IF NOT EXISTS current_world_id TEXT,
  ADD COLUMN IF NOT EXISTS lessons_completed_in_adventure INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS adventure_started_at TIMESTAMPTZ;

-- 3. Create view for user's saved species count and current progress
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT
  u.id AS user_id,
  COALESCE(COUNT(DISTINCT cs.id), 0) AS total_species_saved,
  COALESCE(SUM(cs.points_earned), 0) AS total_points_from_saved_species,
  usj.total_points AS current_journey_points,
  usj.current_iucn_status,
  usj.current_adventure_id,
  usj.current_world_id,
  usj.lessons_completed_in_adventure,
  usj.species_avatar_id AS current_species_id,
  sa.common_name AS current_species_name,
  sa.avatar_image_url AS current_species_image
FROM users u
LEFT JOIN completed_species cs ON cs.user_id = u.id
LEFT JOIN user_species_journey usj ON usj.user_id = u.id
LEFT JOIN species_avatars sa ON sa.id = usj.species_avatar_id
GROUP BY
  u.id,
  usj.total_points,
  usj.current_iucn_status,
  usj.current_adventure_id,
  usj.current_world_id,
  usj.lessons_completed_in_adventure,
  usj.species_avatar_id,
  sa.common_name,
  sa.avatar_image_url;

-- 4. Update IUCN thresholds to use only 5 levels (CR → EN → VU → NT → LC)
-- First, check if thresholds exist, if not create them
INSERT INTO iucn_thresholds (from_status, to_status, points_required, created_at)
VALUES
  ('CR', 'EN', 1, NOW()),
  ('EN', 'VU', 2, NOW()),
  ('VU', 'NT', 3, NOW()),
  ('NT', 'LC', 4, NOW())
ON CONFLICT (from_status, to_status)
DO UPDATE SET points_required = EXCLUDED.points_required;

-- 5. Add RLS policies for completed_species
ALTER TABLE completed_species ENABLE ROW LEVEL SECURITY;

-- Users can view their own completed species
CREATE POLICY "Users can view own completed species"
  ON completed_species FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- Users can insert their own completed species
CREATE POLICY "Users can insert own completed species"
  ON completed_species FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- Service role can do everything
CREATE POLICY "Service role full access to completed_species"
  ON completed_species
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Grant permissions
GRANT SELECT, INSERT ON completed_species TO authenticated;
GRANT ALL ON completed_species TO service_role;
GRANT SELECT ON user_progress_summary TO authenticated;
GRANT SELECT ON user_progress_summary TO service_role;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- After running this migration:
-- 1. Users will be able to save multiple species (one per adventure)
-- 2. Each adventure completion saves the species at LC status
-- 3. Progress is tracked per adventure (5 lessons = 5 IUCN levels)
-- 4. Leaderboard can rank by species saved (primary) and points (tiebreaker)
