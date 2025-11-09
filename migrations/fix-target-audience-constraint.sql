-- Fix target_audience constraint to allow new values
-- Run this in Supabase SQL Editor

-- Drop the existing constraint if it exists
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_target_audience_check;

-- Add new constraint with all allowed values
ALTER TABLE lessons ADD CONSTRAINT lessons_target_audience_check
  CHECK (target_audience IN ('players', 'schools', 'users', 'both'));

-- Update any lessons with 'players' to 'both' (new naming convention)
UPDATE lessons
SET target_audience = 'both'
WHERE target_audience = 'players';

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'lessons'::regclass
AND conname = 'lessons_target_audience_check';
