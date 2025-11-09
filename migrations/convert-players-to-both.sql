-- Convert "players" to "both" for target_audience
-- Run this in Supabase SQL Editor AFTER you've already run fix-target-audience-constraint.sql

-- Update all existing lessons that use "players" to use "both"
UPDATE lessons
SET target_audience = 'both'
WHERE target_audience = 'players';

-- Verify the changes
SELECT target_audience, COUNT(*) as count
FROM lessons
GROUP BY target_audience
ORDER BY target_audience;
