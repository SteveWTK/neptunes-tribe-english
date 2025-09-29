-- DATABASE_SETUP.sql
-- Run this in your Supabase SQL Editor to set up lesson system tables and policies

-- ============================================================================
-- 1. LESSON COMPLETIONS TABLE
-- ============================================================================
-- Tracks which users have completed which lessons and XP earned

CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user
  ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson
  ON lesson_completions(lesson_id);

-- ============================================================================
-- 2. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on tables
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- LESSONS TABLE POLICIES
-- ============================================================================

-- Students can view active lessons
DROP POLICY IF EXISTS "Students can view active lessons" ON lessons;
CREATE POLICY "Students can view active lessons"
ON lessons FOR SELECT
TO authenticated
USING (is_active = true);

-- Platform admins have full access to lessons
DROP POLICY IF EXISTS "Platform admins have full access" ON lessons;
CREATE POLICY "Platform admins have full access"
ON lessons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'platform_admin'
  )
);

-- ============================================================================
-- LESSON COMPLETIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own completions
DROP POLICY IF EXISTS "Users can view their own completions" ON lesson_completions;
CREATE POLICY "Users can view their own completions"
ON lesson_completions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own completions
DROP POLICY IF EXISTS "Users can insert their own completions" ON lesson_completions;
CREATE POLICY "Users can insert their own completions"
ON lesson_completions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Platform admins can view all completions
DROP POLICY IF EXISTS "Admins can view all completions" ON lesson_completions;
CREATE POLICY "Admins can view all completions"
ON lesson_completions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'platform_admin'
  )
);

-- ============================================================================
-- 3. SET YOUR USER AS PLATFORM ADMIN
-- ============================================================================

-- ⚠️ IMPORTANT: Replace 'your-email@example.com' with your actual email
UPDATE users
SET role = 'platform_admin'
WHERE email = 'your-email@example.com';

-- ============================================================================
-- 4. VERIFY SETUP
-- ============================================================================

-- Check if lessons table exists and has data
SELECT COUNT(*) as lesson_count FROM lessons;

-- Check if your user is admin
SELECT id, email, role, is_premium
FROM users
WHERE role = 'platform_admin';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('lessons', 'lesson_completions');

-- ============================================================================
-- 5. OPTIONAL: ADD PREFERRED_LANGUAGE COLUMN TO USERS
-- ============================================================================
-- Only run if you want to support user language preferences

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE users ADD COLUMN preferred_language TEXT DEFAULT 'en';
  END IF;
END $$;

-- ============================================================================
-- 6. OPTIONAL: CREATE LESSON VOTES TABLE (for ConversationVote step type)
-- ============================================================================
-- Only run if you plan to use the ConversationVote step type

CREATE TABLE IF NOT EXISTS lesson_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  step_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote TEXT NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lesson_id, step_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_votes_lesson_step
  ON lesson_votes(lesson_id, step_id);

-- RLS for lesson_votes
ALTER TABLE lesson_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all votes" ON lesson_votes;
CREATE POLICY "Users can view all votes"
ON lesson_votes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert their own votes" ON lesson_votes;
CREATE POLICY "Users can insert their own votes"
ON lesson_votes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own votes" ON lesson_votes;
CREATE POLICY "Users can update their own votes"
ON lesson_votes FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================================================
-- SETUP COMPLETE! 🎉
-- ============================================================================

-- Next steps:
-- 1. Verify your email was updated to platform_admin (see query above)
-- 2. Clear your Next.js cache: rm -rf .next && npm run dev
-- 3. Visit /admin/lessons to test the admin interface
-- 4. Create a test lesson with a unit_reference step
-- 5. Test the lesson player at /lesson/[lesson-id]