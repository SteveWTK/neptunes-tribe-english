-- Migration: Lesson XP Tracking System
-- Adds XP tracking to lesson completions and ensures proper schema

-- 1. Create or update lesson_completions table
CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  adventure_id TEXT,
  world_id TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, adventure_id)
);

-- 2. Add xp_earned column if table already exists but column doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_completions' AND column_name = 'xp_earned'
  ) THEN
    ALTER TABLE lesson_completions ADD COLUMN xp_earned INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- 3. Add adventure_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_completions' AND column_name = 'adventure_id'
  ) THEN
    ALTER TABLE lesson_completions ADD COLUMN adventure_id TEXT;
  END IF;
END $$;

-- 4. Add world_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_completions' AND column_name = 'world_id'
  ) THEN
    ALTER TABLE lesson_completions ADD COLUMN world_id TEXT;
  END IF;
END $$;

-- 5. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_adventure
  ON lesson_completions(user_id, adventure_id);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_xp
  ON lesson_completions(user_id, xp_earned);

-- 6. Enable RLS if not already enabled
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
DROP POLICY IF EXISTS "Users can view their own lesson completions" ON lesson_completions;
CREATE POLICY "Users can view their own lesson completions"
  ON lesson_completions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own lesson completions" ON lesson_completions;
CREATE POLICY "Users can insert their own lesson completions"
  ON lesson_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own lesson completions" ON lesson_completions;
CREATE POLICY "Users can update their own lesson completions"
  ON lesson_completions FOR UPDATE
  USING (auth.uid() = user_id);

-- 8. Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for updated_at
DROP TRIGGER IF EXISTS update_lesson_completions_updated_at ON lesson_completions;
CREATE TRIGGER update_lesson_completions_updated_at
  BEFORE UPDATE ON lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verification query (run this to check the migration worked)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'lesson_completions'
-- ORDER BY ordinal_position;
