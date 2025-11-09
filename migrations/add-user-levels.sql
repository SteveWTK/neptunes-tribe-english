-- ============================================================================
-- Add User Levels System
-- ============================================================================
-- This migration adds level-based filtering capabilities to support:
-- - Multiple difficulty levels (Beginner, Intermediate, Advanced, etc.)
-- - User type filtering (school vs individual users)
-- - Progressive content unlock as users advance through levels
--
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Add current_level column to users table
-- This tracks which difficulty level content the user should see
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_level TEXT DEFAULT 'Beginner';

-- Add user_type column to users table
-- Values: 'school' (for school students) or 'individual' (for individual learners)
-- Maps to lesson target_audience: 'schools' or 'users'
ALTER TABLE users
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'individual';

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_users_current_level
ON users(current_level);

CREATE INDEX IF NOT EXISTS idx_users_user_type
ON users(user_type);

-- Add composite index for common query pattern (level + type filtering)
CREATE INDEX IF NOT EXISTS idx_users_level_type
ON users(current_level, user_type);

-- Add column comments for documentation
COMMENT ON COLUMN users.current_level IS
  'User difficulty level - matches lesson.difficulty (Beginner, Intermediate, Advanced, etc.)';

COMMENT ON COLUMN users.user_type IS
  'User type for content filtering - school (shows schools/players content) or individual (shows users/players content)';

-- ============================================================================
-- OPTIONAL: Update existing users with smart defaults
-- ============================================================================

-- Set school-related roles to user_type='school'
UPDATE users
SET user_type = 'school'
WHERE role IN ('Student', 'Teacher', 'Coordinator')
  AND user_type = 'individual'; -- Only update if not already set

-- Keep individual users (regular Users, Admins, Platform_admins) as 'individual'
-- (Already set by default)

-- ============================================================================
-- Verification Queries (Run these to check the migration worked)
-- ============================================================================

-- Check the new columns exist and have data
-- SELECT id, email, role, current_level, user_type
-- FROM users
-- LIMIT 10;

-- Check index creation
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'users'
-- AND indexname LIKE 'idx_users_%';

-- Count users by level and type
-- SELECT current_level, user_type, COUNT(*) as user_count
-- FROM users
-- GROUP BY current_level, user_type
-- ORDER BY current_level, user_type;
