# Database Migration: Adding Worlds Structure

This document outlines the database changes needed to support the new Worlds → Adventures → Units/Lessons hierarchy.

## Overview

We are adding a higher level of organization called "Worlds" to our content structure:

**Old Structure:**
- Themes (weekly) → Units & Lessons

**New Structure:**
- Worlds (7 continents/regions) → Adventures (4 per world, weekly themes) → Units & Lessons

## Database Schema Changes

### 1. Add `world` column to `units` table

```sql
-- Add world column to units table
ALTER TABLE units
ADD COLUMN world TEXT;

-- Add index for better query performance
CREATE INDEX idx_units_world ON units(world);

-- Add comment for documentation
COMMENT ON COLUMN units.world IS 'The world/continent this unit belongs to (e.g., south_america, north_america, eurasia, africa, polar_regions, oceania, the_oceans)';
```

### 2. Add `world` column to `lessons` table

```sql
-- Add world column to lessons table
ALTER TABLE lessons
ADD COLUMN world TEXT;

-- Add index for better query performance
CREATE INDEX idx_lessons_world ON lessons(world);

-- Add comment for documentation
COMMENT ON COLUMN lessons.world IS 'The world/continent this lesson belongs to (e.g., south_america, north_america, eurasia, africa, polar_regions, oceania, the_oceans)';
```

## World Values Reference

The `world` column should use one of these standardized values:

- `south_america` - South America
- `north_america` - North America
- `eurasia` - Eurasia
- `africa` - Africa
- `polar_regions` - Polar Regions
- `oceania` - Oceania
- `the_oceans` - The Oceans

## Theme Column

**Decision:** We are keeping the existing `theme` column name in the database for backward compatibility, but using "Adventure" terminology in all user-facing UI.

- Database: `theme`, `theme_tags` (no changes)
- UI/Frontend: "Adventure" terminology

## Migration Strategy

### Phase 1: Add Columns (Non-Breaking)
1. Add `world` columns to `units` and `lessons` tables
2. Columns are nullable initially - existing data continues to work

### Phase 2: Populate Data
You can populate the world values using the theme_tags as a guide:

```sql
-- Example: Update units based on theme_tags
-- This is a template - you'll need to customize based on your actual theme_tags

UPDATE units
SET world = 'south_america'
WHERE theme_tags @> ARRAY['amazon', 'andes', 'galapagos', 'pantanal'];

UPDATE units
SET world = 'north_america'
WHERE theme_tags @> ARRAY['yellowstone', 'caribbean_reef', 'monarch', 'everglades'];

UPDATE units
SET world = 'eurasia'
WHERE theme_tags @> ARRAY['taiga', 'himalayas', 'borneo', 'mediterranean'];

UPDATE units
SET world = 'africa'
WHERE theme_tags @> ARRAY['serengeti', 'congo', 'sahara', 'madagascar'];

UPDATE units
SET world = 'polar_regions'
WHERE theme_tags @> ARRAY['arctic', 'antarctica', 'greenland', 'aurora'];

UPDATE units
SET world = 'oceania'
WHERE theme_tags @> ARRAY['great_barrier_reef', 'new_zealand', 'pacific_islands', 'outback'];

UPDATE units
SET world = 'the_oceans'
WHERE theme_tags @> ARRAY['kelp', 'deep_ocean', 'whales', 'coral_triangle'];

-- Similar updates for lessons table
```

### Phase 3: (Optional) Make Required
Once all data is populated, you can make the column required:

```sql
-- Only run after all data is populated
ALTER TABLE units ALTER COLUMN world SET NOT NULL;
ALTER TABLE lessons ALTER COLUMN world SET NOT NULL;
```

## Updated Queries

### Fetch units for a specific world:
```sql
SELECT * FROM units
WHERE world = 'south_america'
ORDER BY created_at DESC;
```

### Fetch units for a specific adventure (using theme_tags):
```sql
SELECT * FROM units
WHERE world = 'south_america'
AND theme_tags @> ARRAY['amazon']
ORDER BY created_at DESC;
```

### Fetch all content for a world:
```sql
-- Get all units and lessons for a world
SELECT
  'unit' as content_type,
  id,
  title,
  theme_tags,
  world
FROM units
WHERE world = 'south_america'

UNION ALL

SELECT
  'lesson' as content_type,
  id,
  title,
  theme_tags,
  world
FROM lessons
WHERE world = 'south_america'
ORDER BY content_type, id;
```

## Frontend Integration

The frontend uses the `worldsConfig.js` file which maps:
- World IDs to adventure theme_tags
- Adventure theme_tags to actual database content

Example flow:
1. User selects "South America" world
2. Frontend shows 4 adventures from worldsConfig
3. User clicks "Amazon Rainforest" adventure
4. Frontend queries: `theme_tags @> ARRAY['amazon']` AND `world = 'south_america'`
5. Display matching units and lessons

## Rollback Plan

If needed, you can rollback the changes:

```sql
-- Remove world column from units
ALTER TABLE units DROP COLUMN world;
DROP INDEX IF EXISTS idx_units_world;

-- Remove world column from lessons
ALTER TABLE lessons DROP COLUMN world;
DROP INDEX IF EXISTS idx_lessons_world;
```

## Testing Checklist

- [ ] Add columns to database
- [ ] Verify existing queries still work
- [ ] Populate world data for existing content
- [ ] Test filtering by world
- [ ] Test filtering by world + theme_tags (adventures)
- [ ] Verify Worlds page displays correctly
- [ ] Verify World detail pages load adventures
- [ ] Verify Adventure page shows correct units/lessons
- [ ] Test breadcrumb navigation
- [ ] Test on mobile devices

## Notes

- The `theme_tags` array column remains the primary way to associate content with specific adventures/themes
- The `world` column adds an additional level of organization
- This is a non-breaking change - existing code will continue to work
- The frontend configuration in `worldsConfig.js` provides the mapping between worlds and adventures
