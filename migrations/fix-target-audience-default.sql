-- Fix target_audience default value in database
-- The column might have a default of 'players' that needs to be changed to 'both'
-- Run this in Supabase SQL Editor

-- Check current default value
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'lessons'
AND column_name = 'target_audience';

-- Remove old default if it exists
ALTER TABLE lessons ALTER COLUMN target_audience DROP DEFAULT;

-- Set new default to 'both'
ALTER TABLE lessons ALTER COLUMN target_audience SET DEFAULT 'both';

-- Verify the change
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'lessons'
AND column_name = 'target_audience';

-- Update any existing lessons that still have 'players'
UPDATE lessons
SET target_audience = 'both'
WHERE target_audience = 'players';

-- Show summary
SELECT target_audience, COUNT(*) as count
FROM lessons
GROUP BY target_audience
ORDER BY target_audience;
