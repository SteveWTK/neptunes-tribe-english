# Debugging Levels System Issues

## Quick Fixes Required

### 1. Run the Target Audience Constraint Fix

**File:** `migrations/fix-target-audience-constraint.sql`

The database constraint is rejecting the new "users" value. Run this SQL in Supabase:

```sql
-- Drop the existing constraint
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_target_audience_check;

-- Add new constraint with all allowed values
ALTER TABLE lessons ADD CONSTRAINT lessons_target_audience_check
  CHECK (target_audience IN ('players', 'schools', 'users', 'both'));

-- Update any lessons with 'both' to 'players' (which means both in our new system)
UPDATE lessons
SET target_audience = 'players'
WHERE target_audience = 'both';
```

**This fixes Error #3** - The constraint error when editing lessons.

---

## Debugging Steps

### Step 1: Check Your User Record in Supabase

1. Go to Supabase → Table Editor → users table
2. Find your user record (search by email)
3. **Verify these columns exist and have values:**
   - `id` - Should be a UUID
   - `current_level` - Should be "Beginner", "Intermediate", etc.
   - `user_type` - Should be "individual" or "school"

**Example:**
```
id: 123e4567-e89b-12d3-a456-426614174000
email: steveinspirewtk@gmail.com
current_level: Beginner
user_type: individual
```

If these columns don't exist, you need to run `migrations/add-user-levels.sql` first.

### Step 2: Check Lesson Data

1. Go to Supabase → Table Editor → lessons table
2. Find a lesson you want to test with
3. **Verify these values:**
   - `difficulty` - Should match EXACTLY "Beginner", "Intermediate", "Advanced", or "Survival Absolute"
   - `target_audience` - Should be "players", "schools", or "users"
   - `is_active` - Should be `true`
   - `world` - Should match the world ID (e.g., "south_america")
   - `theme_tags` - Should be an array like `["amazon_adventure"]`

**Example:**
```
id: 1
title: "Meet the Amazon Rainforest"
difficulty: "Beginner"  ← Must match EXACTLY (case-sensitive)
target_audience: "players"
is_active: true
world: "south_america"
theme_tags: ["amazon_adventure"]
```

### Step 3: Check Console Logs

With the updated code, you should now see detailed console logs:

**Expected console output when visiting a world:**

```
🔍 getLessonsForUser called with: {userId: "123e4567...", worldId: "south_america", adventureId: "amazon_adventure"}
👤 User data query result: {userData: {id: "123e4567...", email: "...", current_level: "Beginner", user_type: "individual"}, userError: null}
✅ User level data: {userLevel: "Beginner", userType: "individual"}
🔎 getLessonsByLevelAndType filters: {level: "Beginner", userType: "individual", targetAudience: "users", worldId: "south_america", adventureId: "amazon_adventure"}
📚 Lessons query result: {count: 3, error: undefined, samples: [{...}, {...}]}
```

**If you see an error in the user query:**
- The user ID being passed might be wrong
- The user record might not exist
- The columns might not exist in the database

**If you see 0 lessons in the result:**
- Check that lessons exist with matching `difficulty`
- Check that lessons have `is_active = true`
- Check that `target_audience` is "players" or "users" (for individual users)
- Check that `world` and `theme_tags` match

---

## Common Issues & Solutions

### Issue: "Error fetching user data" with empty object `{}`

**Cause:** The user ID doesn't exist in the users table, or the columns don't exist.

**Solutions:**
1. Check if `add-user-levels.sql` migration was run
2. Verify the user record exists in Supabase
3. Check that `current_level` and `user_type` columns exist
4. Look at the console logs for the actual userId being queried

**To check in Supabase:**
```sql
SELECT id, email, current_level, user_type
FROM users
WHERE email = 'steveinspirewtk@gmail.com';
```

---

### Issue: No lessons appearing even though they exist

**Possible causes:**
1. **Difficulty mismatch** - "Beginner" vs "beginner" (case-sensitive)
2. **Target audience** - Using "both" instead of "players"
3. **is_active** - Set to false
4. **World ID mismatch** - "south-america" vs "south_america"
5. **Theme tags** - Not an array, or wrong tag name

**To check lessons in Supabase:**
```sql
SELECT id, title, difficulty, target_audience, is_active, world, theme_tags
FROM lessons
WHERE world = 'south_america'
AND theme_tags @> ARRAY['amazon_adventure']::text[];
```

**To see what the query is looking for:**
Check the console log that shows:
```
🔎 getLessonsByLevelAndType filters: {...}
```

Compare these values to your actual lesson data.

---

### Issue: "violates check constraint lessons_target_audience_check"

**Cause:** The database constraint doesn't allow "users" or "both" values.

**Solution:** Run the fix migration:
```sql
ALTER TABLE lessons DROP CONSTRAINT IF EXISTS lessons_target_audience_check;
ALTER TABLE lessons ADD CONSTRAINT lessons_target_audience_check
  CHECK (target_audience IN ('players', 'schools', 'users', 'both'));
```

---

### Issue: "Failed to create lesson"

**Possible causes:**
1. Missing required fields (title, pillar_id)
2. Target audience constraint (see above)
3. Invalid difficulty value
4. Supabase permissions issue

**Check console for specific error message.**

---

## Manual Testing Checklist

### ✅ Database Setup
- [ ] Run `add-user-levels.sql` migration
- [ ] Run `fix-target-audience-constraint.sql` migration
- [ ] Verify user has `current_level` = "Beginner"
- [ ] Verify user has `user_type` = "individual" or "school"

### ✅ Lesson Setup
Create a test lesson with EXACTLY these values:
- [ ] `difficulty` = "Beginner" (capital B)
- [ ] `target_audience` = "players"
- [ ] `is_active` = true
- [ ] `world` = "south_america"
- [ ] `theme_tags` = ["amazon_adventure"]

### ✅ Test User Flow
1. [ ] Log in to the app
2. [ ] Navigate to /worlds
3. [ ] Check console for logs starting with 🔍 and 👤
4. [ ] Click on South America world
5. [ ] Check console for 🔎 and 📚 logs
6. [ ] Click on Amazon Adventure
7. [ ] Verify lesson appears

### ✅ Test Level Filtering
1. [ ] View lessons as Beginner user → Should see Beginner lessons
2. [ ] Update user to Intermediate in Supabase
3. [ ] Refresh app → Should NOT see Beginner lessons anymore
4. [ ] Create Intermediate lesson → Should now appear

### ✅ Test Audience Filtering
1. [ ] Create lesson with `target_audience = "schools"`
2. [ ] Set user `user_type = "individual"`
3. [ ] Lesson should NOT appear
4. [ ] Change lesson to `target_audience = "players"`
5. [ ] Lesson should now appear

---

## SQL Queries for Debugging

### Check if migrations ran:
```sql
-- Check if columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('current_level', 'user_type');
```

### Check user data:
```sql
SELECT id, email, role, current_level, user_type
FROM users
WHERE email = 'your-email@example.com';
```

### Check lessons data:
```sql
SELECT
  id,
  title,
  difficulty,
  target_audience,
  is_active,
  world,
  theme_tags
FROM lessons
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 10;
```

### Find lessons matching specific filters:
```sql
-- What a Beginner individual user should see
SELECT id, title, difficulty, target_audience
FROM lessons
WHERE difficulty = 'Beginner'
AND is_active = true
AND target_audience IN ('users', 'players')
AND world = 'south_america'
AND theme_tags @> ARRAY['amazon_adventure']::text[];
```

### Check constraint:
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'lessons'::regclass
AND conname LIKE '%target_audience%';
```

---

## Expected Console Output (Success)

When everything works correctly, you should see:

```
🔍 getLessonsForUser called with: {
  userId: "123e4567-e89b-12d3-a456-426614174000",
  worldId: "south_america",
  adventureId: "amazon_adventure"
}

👤 User data query result: {
  userData: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "steveinspirewtk@gmail.com",
    current_level: "Beginner",
    user_type: "individual"
  },
  userError: null
}

✅ User level data: {
  userLevel: "Beginner",
  userType: "individual"
}

🔎 getLessonsByLevelAndType filters: {
  level: "Beginner",
  userType: "individual",
  targetAudience: "users",
  worldId: "south_america",
  adventureId: "amazon_adventure"
}

📚 Lessons query result: {
  count: 3,
  error: undefined,
  samples: [
    {
      id: 1,
      title: "Meet the Amazon Rainforest",
      difficulty: "Beginner",
      target_audience: "players"
    },
    {
      id: 2,
      title: "Amazon Animals",
      difficulty: "Beginner",
      target_audience: "users"
    }
  ]
}

📚 Loaded 3 lessons for user at their level
```

---

## Next Steps

1. **Run the constraint fix** in Supabase SQL Editor
2. **Check your console logs** - they should now show detailed debugging info
3. **Verify your user data** in Supabase matches the expected format
4. **Create a test lesson** with exact values listed above
5. **Report back** with the console logs if still having issues

The detailed logging will help us pinpoint exactly where the issue is occurring.
