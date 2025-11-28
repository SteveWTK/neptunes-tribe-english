# Levels System Implementation Guide

## Overview

The Levels System allows users to progress through the same 8 Worlds at different difficulty levels. When a user completes all content at "Beginner", they can restart the journey at "Intermediate" with NEW lessons designed for that level.

## Key Features

- **Multi-level Content Progression**: Same worlds, different difficulty levels
- **User Type Filtering**: Separate content for school students vs individual learners
- **Dual Filtering**: Lessons must match BOTH user's level AND user type
- **Level Indicator**: Shows user's current level throughout the UI
- **Admin Tools**: Enhanced Lesson Builder with clear level/audience selection
- **Flexible & Cloneable**: Easy to add more levels or clone to other projects

## Architecture

### Database Schema

**users table** (2 new columns):
- `current_level` (TEXT): User's difficulty level (e.g., "Beginner", "Intermediate")
- `user_type` (TEXT): "individual" or "school"

**lessons table** (existing columns used):
- `difficulty` (TEXT): Lesson's difficulty level
- `target_audience` (TEXT): "users", "schools", or "players" (both)

### Filtering Logic

Users see lessons that match **BOTH** conditions:

1. **Level Match**: `lesson.difficulty = user.current_level`
2. **Audience Match**:
   - Individual users see: `target_audience IN ('users', 'players')`
   - School users see: `target_audience IN ('schools', 'players')`

## Implementation Details

### Step 1: Database Migration

File: `migrations/add-user-levels.sql`

Adds the required columns and indexes to the users table.

**To run:**
1. Open Supabase SQL Editor
2. Paste contents of `add-user-levels.sql`
3. Execute

**What it does:**
- Adds `current_level` column (default: "Beginner")
- Adds `user_type` column (default: "individual")
- Creates indexes for efficient filtering
- Sets school-related roles to `user_type='school'`

### Step 2: Levels Configuration

File: `src/config/levelsConfig.js`

Central configuration for all difficulty levels.

**Defined Levels:**

| Level ID | Display Name | Icon | Order | Database Value |
|----------|--------------|------|-------|----------------|
| survival_absolute | Survival Mode | 🆘 | 0 | "Survival Absolute" |
| beginner | Level 1: Discovery | 🌱 | 1 | "Beginner" |
| intermediate | Level 2: Explorer | 🔍 | 2 | "Intermediate" |
| advanced | Level 3: Expert | 🏆 | 3 | "Advanced" |

**Helper Functions:**
- `getAllLevels()` - Get all levels sorted by order
- `getLevelById(id)` - Get specific level config
- `getLevelByValue(value)` - Find level by database value
- `getNextLevel(id)` - Get next level in progression
- `levelIdToDifficulty(id)` - Convert ID to database value

**Adding More Levels:**
Just add new objects to the LEVELS constant following the same structure.

### Step 3: Lesson Query Functions

File: `src/lib/supabase/lesson-queries.js`

New filtering functions for level-based queries.

**Main Functions:**

```javascript
// Get lessons for a specific user (filtered by level & type)
await getLessonsForUser(userId, worldId, adventureId)

// Get count of lessons available for user
await getLessonCountForUser(userId, worldId, adventureId)

// Check if adventure has content for user
await adventureHasLessonsForUser(userId, worldId, adventureId)

// Filter adventures and add lesson counts
await getAvailableAdventures(userId, worldId, adventures)

// Update user's level
await updateUserLevel(userId, "Intermediate")

// Update user's type
await updateUserType(userId, "school")
```

**Implementation Details:**
- All filtering happens at database level (secure & performant)
- Graceful fallbacks to "Beginner"/"individual" if user data missing
- Returns empty arrays instead of throwing errors

### Step 4: World Pages Integration

Files:
- `src/app/(site)/worlds/[worldId]/page.js`
- `src/app/(site)/worlds/page.js`

**Changes:**

1. **Adventure Filtering**: Uses `getAvailableAdventures()` to show only adventures with lessons for user's level
2. **Lesson Counts**: Displays lesson count per adventure
3. **Coming Soon**: Shows lock icon and "Coming soon" for adventures without lessons
4. **Auto-Selection**: Selects first adventure that has lessons
5. **Level Indicator**: Shows current level badge in header

**User Experience:**
- Users see exactly how many lessons are available per adventure
- Adventures without content at user's level show "Coming soon"
- All adventures remain visible (not hidden) for transparency

### Step 5: Level Indicator Component

File: `src/components/LevelIndicator.js`

Reusable component showing user's current level.

**3 Variants:**

```jsx
// Compact badge (default)
<LevelIndicator variant="badge" />

// Detailed card
<LevelIndicator variant="card" />

// Simple inline text
<LevelIndicator variant="inline" />
```

**Features:**
- Fetches user's level from database
- Shows level icon, name, and color
- Tooltip with level description
- Dark mode support

**Placement:**
- Worlds grid page (center, below title)
- World detail pages (breadcrumb, top-right)
- Can be added to dashboard, profile, etc.

### Step 6: Lesson Builder Updates

Files:
- `src/app/(site)/admin/lessons/new/page.js`
- `src/app/(site)/admin/lessons/[id]/edit/page.js`

**Enhanced UX:**

1. **Difficulty Dropdown**: Now shows level icons and display names from levelsConfig
2. **Helper Text**: Explains that users only see matching content
3. **Target Audience**: Clearer labels ("Individual Learners Only", "School Students Only", "Both (All Users)")
4. **Visibility Section**: New section explaining filtering logic
5. **Visual Info Box**: Shows how filtering works

**Admin Experience:**
- Clear understanding of content visibility
- Visual confirmation of level assignment
- Helpful tooltips and guidance

## Usage Examples

### Scenario 1: User Progresses to Intermediate

```javascript
// User completes all Beginner content
// Admin or system updates their level:
await updateUserLevel(userId, "Intermediate");

// Now when user visits worlds:
// - They see Intermediate lessons only
// - Beginner lessons are hidden
// - Adventure counts update automatically
// - Level indicator shows "🔍 Level 2: Explorer"
```

### Scenario 2: Creating Content for Multiple Levels

```javascript
// In Lesson Builder:
// 1. Create "Amazon Rainforest Basics" → Difficulty: Beginner
// 2. Create "Amazon Ecosystem Analysis" → Difficulty: Intermediate
// 3. Create "Amazon Conservation Strategies" → Difficulty: Advanced

// Result:
// - Beginner users see only lesson #1
// - Intermediate users see only lesson #2
// - Advanced users see only lesson #3
// - Same adventure, different depth!
```

### Scenario 3: School vs Individual Content

```javascript
// Creating school-specific content:
// Lesson Builder → Target Audience: "School Students Only"
// - Individual users won't see this lesson
// - School users see it (if level matches)

// Creating content for both:
// Lesson Builder → Target Audience: "Both (All Users)"
// - Everyone sees it (if level matches)
```

## Testing Checklist

### Database Setup
- [ ] Run `add-user-levels.sql` migration in Supabase
- [ ] Verify `current_level` and `user_type` columns exist
- [ ] Check that school roles have `user_type='school'`
- [ ] Verify indexes were created

### Content Creation
- [ ] Create lessons at different difficulty levels
- [ ] Set appropriate target audiences
- [ ] Assign lessons to worlds and adventures
- [ ] Verify lessons are marked as active

### User Experience
- [ ] Level indicator appears on worlds pages
- [ ] Correct lesson count shown per adventure
- [ ] "Coming soon" appears for adventures without lessons
- [ ] Clicking adventure shows filtered lessons
- [ ] Level indicator shows correct icon and name

### Filtering
- [ ] Beginner user sees only Beginner lessons
- [ ] Individual user doesn't see Schools-only content
- [ ] School user doesn't see Individual-only content
- [ ] "Both" content visible to everyone
- [ ] Changing user level updates visible content

### Admin Tools
- [ ] Lesson Builder shows level icons
- [ ] Target audience options are clear
- [ ] Help text explains filtering
- [ ] Edit page matches new page styling

## Cloning to Other Projects

This levels system is designed to be easily cloned to projects like Startup Nation, FieldTalk, etc.

**Steps:**

1. **Copy Files:**
   - `migrations/add-user-levels.sql` (run in new project's Supabase)
   - `src/config/levelsConfig.js`
   - `src/components/LevelIndicator.js`
   - Level filtering functions from `lesson-queries.js`

2. **Customize levelsConfig.js:**
   ```javascript
   // Habitat: 🌱 Discovery, 🔍 Explorer, 🏆 Expert
   // Startup Nation: 🚀 Founder, 📈 Scaleup, 🦄 Unicorn
   // FieldTalk: 🌾 Rookie, 🚜 Pro, 🏅 Master

   beginner: {
     id: "beginner",
     value: "Beginner", // KEEP THIS
     displayName: "Level 1: Founder", // CUSTOMIZE
     icon: "🚀", // CUSTOMIZE
     color: { primary: "#ff6b35" }, // CUSTOMIZE
     // ... rest of config
   }
   ```

3. **Update Lesson Builder:**
   - Import `getAllLevels` from levelsConfig
   - Use in difficulty dropdown
   - Update target audience labels if needed

4. **Integrate in Pages:**
   - Add `LevelIndicator` to main navigation
   - Use filtering functions in content pages
   - Update adventure/world display logic

5. **Keep Same:**
   - Database column names (`current_level`, `user_type`)
   - Database values ("Beginner", "Intermediate", etc.)
   - Filtering logic
   - Function names

## Data Model Examples

### User Progression Example

```javascript
// Day 1: New user
{
  id: "user-123",
  email: "student@example.com",
  role: "Student",
  current_level: "Beginner", // Default
  user_type: "school" // Set by migration
}

// 3 months later: Completed Beginner
{
  id: "user-123",
  current_level: "Intermediate", // Updated by admin/system
  user_type: "school"
}

// 6 months later: Advanced learner
{
  id: "user-123",
  current_level: "Advanced",
  user_type: "school"
}
```

### Lesson Content Example

```javascript
// Beginner Lesson
{
  id: 1,
  title: "Meet the Amazon Rainforest",
  difficulty: "Beginner",
  target_audience: "players", // Both school & individual
  world: "south_america",
  theme_tags: ["amazon_adventure"],
  // Visible to: Beginner users (both types)
}

// Intermediate Lesson
{
  id: 2,
  title: "Amazon Food Chains & Biodiversity",
  difficulty: "Intermediate",
  target_audience: "schools", // School only
  world: "south_america",
  theme_tags: ["amazon_adventure"],
  // Visible to: Intermediate school users only
}

// Advanced Lesson
{
  id: 3,
  title: "Conservation Challenges in the Amazon",
  difficulty: "Advanced",
  target_audience: "users", // Individual only
  world: "south_america",
  theme_tags: ["amazon_adventure"],
  // Visible to: Advanced individual users only
}
```

## Future Enhancements

Possible additions to the levels system:

1. **Automatic Level Progression**:
   - Track lesson completion percentage
   - Suggest level-up when 80% complete
   - Allow users to self-select next level

2. **Level Requirements**:
   - Minimum XP to unlock next level
   - Required lessons/achievements
   - Assessment tests before leveling up

3. **Admin Dashboard**:
   - User level distribution charts
   - Lesson count per level report
   - Identify content gaps

4. **User Settings Page**:
   - View current level progress
   - See next level preview
   - Manually change level (if allowed)

5. **Level-Based Achievements**:
   - Badges for completing each level
   - Special rewards for level progression
   - Leaderboards per level

6. **Dynamic Difficulty**:
   - Adaptive lessons that adjust to user performance
   - Suggest level change based on completion rate
   - Mixed-level content for transitions

## Troubleshooting

### Issue: No lessons showing for user

**Check:**
1. Has migration been run? (`current_level` column exists?)
2. User has a valid `current_level` value?
3. Lessons exist with matching `difficulty`?
4. Lessons are marked as `is_active = true`?
5. `target_audience` matches user type?

**Debug:**
```javascript
// Log user data
const { data: userData } = await supabase
  .from("users")
  .select("current_level, user_type")
  .eq("id", userId)
  .single();
console.log("User:", userData);

// Log available lessons
const lessons = await getLessonsForUser(userId, worldId, adventureId);
console.log("Lessons:", lessons.length);
```

### Issue: Level indicator not showing

**Check:**
1. Component imported correctly?
2. User is logged in?
3. AuthProvider wrapping component?
4. Supabase client configured?

**Debug:**
```javascript
// In LevelIndicator component
console.log("User:", user);
console.log("User level:", userLevel);
console.log("Level config:", levelConfig);
```

### Issue: Wrong lessons showing

**Verify:**
1. Lesson `difficulty` matches level `value` exactly
2. Case sensitivity (e.g., "Beginner" not "beginner")
3. `target_audience` is "users", "schools", or "players"
4. User's `user_type` is "individual" or "school"

**SQL Check:**
```sql
-- Check user
SELECT id, email, current_level, user_type FROM users WHERE id = 'user-id';

-- Check lessons
SELECT id, title, difficulty, target_audience
FROM lessons
WHERE difficulty = 'Beginner'
AND is_active = true;
```

## Best Practices

### For Content Creators

1. **Plan Level Progression**: Create content outlines for all levels before building
2. **Consistent Themes**: Keep same adventures across levels, vary depth
3. **Clear Difficulty Steps**: Make level differences noticeable
4. **Balance Audience**: Create mix of "both", "schools", and "users" content
5. **Test Filtering**: View content as different user types/levels

### For Administrators

1. **Monitor Level Distribution**: Track how many users at each level
2. **Content Coverage**: Ensure all adventures have content at all levels
3. **User Progression**: Review users who haven't progressed in months
4. **Feedback Loop**: Collect user feedback on difficulty appropriateness
5. **Regular Audits**: Check for orphaned or incorrectly filtered lessons

### For Developers

1. **Always Filter**: Never show unfiltered lesson lists to users
2. **Graceful Fallbacks**: Handle missing user data elegantly
3. **Cache Awareness**: User level changes should update UI
4. **Type Safety**: Validate level values against levelsConfig
5. **Logging**: Log filtering operations for debugging

## API Reference

### getLessonsForUser(userId, worldId, adventureId)

Gets lessons filtered by user's level and type.

**Parameters:**
- `userId` (string): User ID
- `worldId` (string): World ID (e.g., "south_america")
- `adventureId` (string): Adventure theme tag (e.g., "amazon_adventure")

**Returns:** Promise<Array<Lesson>>

**Example:**
```javascript
const lessons = await getLessonsForUser(
  "user-123",
  "south_america",
  "amazon_adventure"
);
console.log(`Found ${lessons.length} lessons for user`);
```

### getAvailableAdventures(userId, worldId, adventures)

Filters adventures and adds lesson counts.

**Parameters:**
- `userId` (string): User ID
- `worldId` (string): World ID
- `adventures` (Array): Adventure objects from worldsConfig

**Returns:** Promise<Array<AdventureWithLessonCount>>

**Example:**
```javascript
const world = getWorldBySlug("south_america");
const filtered = await getAvailableAdventures(
  userId,
  world.id,
  world.adventures
);

filtered.forEach(adv => {
  console.log(`${adv.name}: ${adv.lessonCount} lessons`);
});
```

### updateUserLevel(userId, newLevel)

Updates user's current difficulty level.

**Parameters:**
- `userId` (string): User ID
- `newLevel` (string): New level value (must match levelsConfig)

**Returns:** Promise<boolean>

**Example:**
```javascript
const success = await updateUserLevel("user-123", "Intermediate");
if (success) {
  alert("Level updated! Restart to see new content.");
}
```

---

## Summary

The Levels System provides a robust, flexible way to manage multi-level content progression. It ensures users see appropriate content for their learning stage and user type, while giving administrators clear tools to manage content visibility.

Key benefits:
- ✅ Same worlds, progressive difficulty
- ✅ Secure database-level filtering
- ✅ Clear admin interface
- ✅ Reusable across projects
- ✅ Extensible for future features

For questions or issues, refer to the troubleshooting section or check the implementation files directly.
