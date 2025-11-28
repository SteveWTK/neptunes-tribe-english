# Theme Content Management Guide

## Overview

This guide explains how to manually select and organize units and lessons for weekly themes, ensuring perfect unit/lesson pairings and equal content distribution.

## 🎯 How the Theme System Works

### 1. **Data Flow**
```
Weekly Theme (active) → Theme Tag → Tagged Units & Lessons → Theme Page Display
```

### 2. **Key Components**
- **Weekly Themes Table**: Stores theme info with `ecosystem_type` as the primary tag
- **Units Table**: Has `theme_tags[]` array column for flexible tagging
- **Lessons Table**: Has `theme_tags[]` array column for flexible tagging
- **Theme Page**: Queries content using `theme_tags` filtering

## 📋 Step-by-Step Setup Process

### Step 1: Create Your Weekly Theme

First, run the `THEME_SETUP.sql` file in Supabase, then create your theme:

```sql
INSERT INTO weekly_themes (
  week_start_date,
  week_end_date,
  theme_title,
  theme_description,
  ecosystem_type,
  featured_regions,
  featured_image_url,
  is_active
) VALUES (
  '2024-01-01',
  '2024-01-07',
  'Amazon Rainforest Week',
  'Explore the lungs of the Earth and discover incredible biodiversity.',
  'amazon',  -- This becomes your primary theme tag
  ARRAY['south-america', 'brazil'],
  'https://your-image-url.jpg',
  true
);
```

### Step 2: Select Your Content

**Find Available Units:**
```sql
SELECT id, title, description, region_name, image
FROM units
ORDER BY id;
```

**Find Available Lessons:**
```sql
SELECT id, title, description, difficulty
FROM lessons
WHERE is_active = true
ORDER BY sort_order;
```

### Step 3: Tag Units for Your Theme

**Option A: Basic Tagging**
```sql
-- Tag units with the main theme
UPDATE units
SET theme_tags = ARRAY['amazon']
WHERE id IN (42, 43, 44, 45, 46, 47);
```

**Option B: Detailed Tagging (Recommended)**
```sql
-- Tag units with descriptive tags for better organization
UPDATE units SET theme_tags = ARRAY['amazon', 'vocabulary', 'biodiversity'] WHERE id = 42;
UPDATE units SET theme_tags = ARRAY['amazon', 'vocabulary', 'canopy'] WHERE id = 43;
UPDATE units SET theme_tags = ARRAY['amazon', 'vocabulary', 'wildlife'] WHERE id = 44;
UPDATE units SET theme_tags = ARRAY['amazon', 'vocabulary', 'conservation'] WHERE id = 45;
UPDATE units SET theme_tags = ARRAY['amazon', 'vocabulary', 'indigenous'] WHERE id = 46;
UPDATE units SET theme_tags = ARRAY['amazon', 'vocabulary', 'climate'] WHERE id = 47;
```

### Step 4: Tag Lessons to Match Units

**Create Unit-Lesson Pairs:**
```sql
-- Lesson that builds on Unit 42 (biodiversity)
UPDATE lessons
SET theme_tags = ARRAY['amazon', 'lesson', 'biodiversity', 'unit-42']
WHERE id = 'lesson-uuid-1';

-- Lesson that builds on Unit 43 (canopy)
UPDATE lessons
SET theme_tags = ARRAY['amazon', 'lesson', 'canopy', 'unit-43']
WHERE id = 'lesson-uuid-2';

-- And so on...
```

## 🎨 Tagging Strategy Examples

### Example 1: Amazon Rainforest Week
```sql
-- Primary tag: 'amazon'
-- Units (vocabulary builders):
UPDATE units SET theme_tags = ARRAY['amazon', 'vocab', 'biodiversity'] WHERE id = 42;
UPDATE units SET theme_tags = ARRAY['amazon', 'vocab', 'deforestation'] WHERE id = 43;
UPDATE units SET theme_tags = ARRAY['amazon', 'vocab', 'wildlife'] WHERE id = 44;

-- Lessons (comprehensive journeys):
UPDATE lessons SET theme_tags = ARRAY['amazon', 'deep-dive', 'ecosystem'] WHERE id = 'lesson-1';
UPDATE lessons SET theme_tags = ARRAY['amazon', 'deep-dive', 'conservation'] WHERE id = 'lesson-2';
UPDATE lessons SET theme_tags = ARRAY['amazon', 'deep-dive', 'indigenous'] WHERE id = 'lesson-3';
```

### Example 2: Ocean Conservation Week
```sql
-- Primary tag: 'ocean'
-- Units:
UPDATE units SET theme_tags = ARRAY['ocean', 'vocab', 'coral-reef'] WHERE id = 48;
UPDATE units SET theme_tags = ARRAY['ocean', 'vocab', 'marine-life'] WHERE id = 49;
UPDATE units SET theme_tags = ARRAY['ocean', 'vocab', 'pollution'] WHERE id = 50;

-- Lessons:
UPDATE lessons SET theme_tags = ARRAY['ocean', 'deep-dive', 'reef-ecology'] WHERE id = 'lesson-4';
UPDATE lessons SET theme_tags = ARRAY['ocean', 'deep-dive', 'plastic-waste'] WHERE id = 'lesson-5';
```

## 🔄 Weekly Theme Rotation

### Activate a New Theme
```sql
-- Deactivate all themes
UPDATE weekly_themes SET is_active = false;

-- Activate the new theme
UPDATE weekly_themes
SET is_active = true
WHERE theme_title = 'Ocean Conservation Week';
```

### Check Current Active Theme
```sql
SELECT * FROM get_current_weekly_theme();
```

## 🧪 Testing Your Setup

### Test Content Loading
```sql
-- See what content is tagged for your theme
SELECT 'unit' as type, id, title, theme_tags
FROM units
WHERE theme_tags @> ARRAY['amazon']

UNION ALL

SELECT 'lesson' as type, id, title, theme_tags
FROM lessons
WHERE theme_tags @> ARRAY['amazon']
ORDER BY type, title;
```

### Test the Helper Function
```sql
SELECT * FROM get_theme_content('amazon');
```

## 📊 Recommended Content Distribution

### For Each Weekly Theme:
- **6 Units**: Quick vocabulary builders (5-10 minutes each)
- **3 Lessons**: Comprehensive journeys (15-30 minutes each)
- **Total**: 9 activities per week (achievable weekly goal)

### Unit/Lesson Pairing Strategy:
1. **Foundation Units**: Tag with theme + "vocab" + specific topic
2. **Building Lessons**: Tag with theme + "lesson" + related topic
3. **Connection**: Use consistent topic tags to show relationships

## 🚀 Quick Setup Checklist

- [ ] Run `THEME_SETUP.sql` in Supabase
- [ ] Create your weekly theme with `ecosystem_type` as primary tag
- [ ] Select 6 units and tag them with your theme tag
- [ ] Select 3 lessons and tag them with your theme tag
- [ ] Test with `SELECT * FROM get_current_weekly_theme();`
- [ ] Test content with `SELECT * FROM get_theme_content('your-tag');`
- [ ] Visit `/theme` page to see your content displayed
- [ ] Set theme as active: `UPDATE weekly_themes SET is_active = true WHERE id = 'your-theme-id';`

## 🔧 Troubleshooting

### No Content Showing on Theme Page?
1. Check if theme is active: `SELECT * FROM weekly_themes WHERE is_active = true;`
2. Check if content is tagged: `SELECT * FROM get_theme_content('your-tag');`
3. Check browser console for JavaScript errors

### Content Not Loading?
1. Verify `theme_tags` columns exist on units and lessons tables
2. Check that your tags exactly match the `ecosystem_type` in the theme
3. Make sure lesson `is_active = true`

### Want to Add More Content?
```sql
-- Add more units to existing theme
UPDATE units
SET theme_tags = array_append(theme_tags, 'amazon')
WHERE id = 51;

-- Remove unit from theme
UPDATE units
SET theme_tags = array_remove(theme_tags, 'amazon')
WHERE id = 42;
```

## 📈 Advanced Features

### Multiple Tags per Content
```sql
-- Unit that appears in multiple themes
UPDATE units
SET theme_tags = ARRAY['amazon', 'forest', 'biodiversity']
WHERE id = 42;
```

### Seasonal Themes
```sql
-- Spring themes
UPDATE units SET theme_tags = ARRAY['spring', 'flowers', 'growth'] WHERE id IN (10,11,12);

-- Holiday themes
UPDATE units SET theme_tags = ARRAY['earth-day', 'environment', 'action'] WHERE id IN (20,21,22);
```

This system gives you complete control over which content appears each week while maintaining the flexibility to reuse content across multiple themes!