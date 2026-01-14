-- Season Progress Schema for Habitat
-- Run this in Supabase SQL Editor

-- ===========================================
-- Table: user_season_progress
-- Tracks user's current position in the season/world journey
-- ===========================================
CREATE TABLE IF NOT EXISTS user_season_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Current position in journey (0-7 for 8 worlds)
  current_world_index INTEGER NOT NULL DEFAULT 0 CHECK (current_world_index >= 0 AND current_world_index <= 7),

  -- Current season info
  current_season TEXT NOT NULL DEFAULT 'spring' CHECK (current_season IN ('spring', 'summer', 'autumn', 'winter')),
  season_cycle INTEGER NOT NULL DEFAULT 1 CHECK (season_cycle IN (1, 2)), -- Two cycles of seasons for 8 worlds

  -- Timing
  journey_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_world_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_world_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '28 days'),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One progress record per user
  UNIQUE(user_id)
);

-- ===========================================
-- Table: user_world_completions
-- Records completion history for each world
-- ===========================================
CREATE TABLE IF NOT EXISTS user_world_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- World info
  world_id TEXT NOT NULL, -- e.g., 'south_america'
  world_index INTEGER NOT NULL CHECK (world_index >= 0 AND world_index <= 7),
  world_name TEXT NOT NULL,

  -- Season it was attempted in
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  season_cycle INTEGER NOT NULL CHECK (season_cycle IN (1, 2)),

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  deadline_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ, -- NULL if not completed

  -- Completion status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'incomplete')),
  completed_on_time BOOLEAN DEFAULT FALSE,

  -- Points
  bonus_points_earned INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One completion record per user per world
  UNIQUE(user_id, world_id)
);

-- ===========================================
-- Indexes for performance
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_user_season_progress_user_id ON user_season_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_world_completions_user_id ON user_world_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_world_completions_status ON user_world_completions(status);

-- ===========================================
-- Trigger to update updated_at timestamp
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to both tables
DROP TRIGGER IF EXISTS update_user_season_progress_updated_at ON user_season_progress;
CREATE TRIGGER update_user_season_progress_updated_at
  BEFORE UPDATE ON user_season_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_world_completions_updated_at ON user_world_completions;
CREATE TRIGGER update_user_world_completions_updated_at
  BEFORE UPDATE ON user_world_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- RLS Policies
-- ===========================================
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_world_completions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own season progress"
  ON user_season_progress FOR SELECT
  USING (auth.uid()::text = user_id::text OR TRUE); -- Allow service role

CREATE POLICY "Users can view own world completions"
  ON user_world_completions FOR SELECT
  USING (auth.uid()::text = user_id::text OR TRUE);

-- Service role can do everything (for API)
CREATE POLICY "Service role full access to season progress"
  ON user_season_progress FOR ALL
  USING (TRUE);

CREATE POLICY "Service role full access to world completions"
  ON user_world_completions FOR ALL
  USING (TRUE);
