-- ============================================================================
-- PERSONAL VOCABULARY SYSTEM
-- ============================================================================
-- Allows users to save vocabulary words from lessons for personalized practice
-- Used in games and vocabulary management pages

-- ============================================================================
-- 1. PERSONAL VOCABULARY TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS personal_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Vocabulary data
  english TEXT NOT NULL,
  portuguese TEXT NOT NULL,
  english_image TEXT,           -- Optional image URL for English word
  portuguese_image TEXT,         -- Optional image URL for Portuguese word

  -- Source tracking (lesson_id matches lessons table type - UUID in this database)
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  step_type TEXT,                -- e.g., 'memory_match', 'word_snake', etc.

  -- Metadata
  times_practiced INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate words per user (case-insensitive)
  UNIQUE(user_id, LOWER(english))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_personal_vocabulary_user
  ON personal_vocabulary(user_id);

CREATE INDEX IF NOT EXISTS idx_personal_vocabulary_user_created
  ON personal_vocabulary(user_id, created_at DESC);

-- Index for efficient lookups by English word (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_personal_vocabulary_english
  ON personal_vocabulary(user_id, LOWER(english));

-- ============================================================================
-- 2. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE personal_vocabulary ENABLE ROW LEVEL SECURITY;

-- Users can view their own vocabulary
DROP POLICY IF EXISTS "Users can view their own vocabulary" ON personal_vocabulary;
CREATE POLICY "Users can view their own vocabulary"
ON personal_vocabulary FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own vocabulary
DROP POLICY IF EXISTS "Users can insert their own vocabulary" ON personal_vocabulary;
CREATE POLICY "Users can insert their own vocabulary"
ON personal_vocabulary FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own vocabulary
DROP POLICY IF EXISTS "Users can update their own vocabulary" ON personal_vocabulary;
CREATE POLICY "Users can update their own vocabulary"
ON personal_vocabulary FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own vocabulary
DROP POLICY IF EXISTS "Users can delete their own vocabulary" ON personal_vocabulary;
CREATE POLICY "Users can delete their own vocabulary"
ON personal_vocabulary FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Platform admins can view all vocabulary (for moderation/analytics)
DROP POLICY IF EXISTS "Admins can view all vocabulary" ON personal_vocabulary;
CREATE POLICY "Admins can view all vocabulary"
ON personal_vocabulary FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'platform_admin'
  )
);

-- ============================================================================
-- 3. HELPER FUNCTIONS
-- ============================================================================

-- Function to increment practice count
CREATE OR REPLACE FUNCTION increment_vocabulary_practice(vocab_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE personal_vocabulary
  SET
    times_practiced = times_practiced + 1,
    last_practiced_at = NOW()
  WHERE id = vocab_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Verify setup
SELECT
  tablename,
  rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'personal_vocabulary';

-- Check policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd AS "Command"
FROM pg_policies
WHERE tablename = 'personal_vocabulary';
