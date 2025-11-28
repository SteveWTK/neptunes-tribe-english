# Supabase Schema Export Guide

## How to Export Your Current Habitat Schema

Since we're working with Supabase (cloud-hosted), there are a few methods to export the schema:

### Method 1: Using Supabase Dashboard (Recommended - Easiest)

1. Go to https://supabase.com/dashboard
2. Select your Habitat project (`pqlrhabwbajghxjukgea`)
3. Go to **SQL Editor**
4. Run this query to see all your tables:

```sql
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

5. For each table, you can use the **Table Editor** > **...** menu > **View SQL** to see the CREATE statement

### Method 2: Using SQL Editor to Generate CREATE Statements

Run these commands in SQL Editor to document your schema:

```sql
-- Get all table definitions
SELECT
    'CREATE TABLE ' || table_name || ' (' ||
    string_agg(
        column_name || ' ' || data_type ||
        CASE WHEN character_maximum_length IS NOT NULL
            THEN '(' || character_maximum_length || ')'
            ELSE ''
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
        ', '
    ) || ');'
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name;

-- Get all indexes
SELECT indexdef
FROM pg_indexes
WHERE schemaname = 'public';

-- Get all foreign keys
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### Method 3: Manual Documentation (Most Reliable for Cloning)

Based on your current Habitat project, here are the core tables you need:

## Core Schema for Cloning

I've created a ready-to-use schema file: `supabase-template-schema.sql`

This includes:
- ✅ users
- ✅ units
- ✅ lessons
- ✅ translations
- ✅ gap_fill_questions
- ✅ user_progress
- ✅ completed_units
- ✅ completed_lessons
- ✅ weekly_themes
- ✅ And all necessary RLS policies

## What to Customize Per App

When cloning for StartupNation or other apps, you'll keep the same schema structure but:

1. **Content Tables** - Keep structure, change content:
   - `units` - Startup topics instead of ecosystems
   - `lessons` - Business scenarios instead of conservation
   - `weekly_themes` - Innovation topics instead of regions

2. **Custom Extension Tables** - Add app-specific tables:
   - For Habitat: `conservation_heroes`, `ecosystem_data`
   - For StartupNation: `founders_stories`, `startup_cases`, `business_terms`
   - For FieldTalk: `sports_legends`, `match_vocabulary`

3. **Keep Universal Tables** unchanged:
   - `users`
   - `user_progress`
   - `completed_units`
   - `completed_lessons`
   - Auth and subscription tables

## Next Steps

1. Review the template schema file
2. Identify any custom tables in your current Habitat database
3. Decide which are universal (clone as-is) vs Habitat-specific (adapt for new apps)
4. Create extension SQL files for app-specific tables
