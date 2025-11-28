# Levels System - Architecture & Implementation Plan

## 📊 Current State Analysis

### What You Have ✅
1. **Lessons table** with `difficulty` column (Beginner, Intermediate, Advanced, etc.)
2. **Lessons table** with `target_audience` column (users, schools, players)
3. **Worlds** → **Adventures** structure in `worldsConfig.js`
4. **User authentication** with roles (User, Student, Teacher, etc.)

### What's Missing ❌
1. User table doesn't have `current_level` or `user_type` (school vs individual)
2. No filtering in worlds/adventures display based on user attributes
3. No level progression tracking

## 🎯 Architectural Recommendation

### ✅ **Your Setup is READY** - Minimal Changes Needed!

Here's the good news: Your database structure is **already well-designed** for this. You just need:

1. **Add 2 columns to users table** (5-minute migration)
2. **Add filtering logic** to lesson queries (20 minutes)
3. **Update UI** to show only relevant content (30 minutes)

### Why This Approach is Efficient

✅ **Reuses existing data** - `difficulty` column becomes your "level" indicator
✅ **Minimal database changes** - Only 2 new columns
✅ **Backward compatible** - Existing lessons still work
✅ **Easy to clone** - Works for Startup Nation, FieldTalk, etc.
✅ **Flexible** - Can adjust level definitions per project

## 🏗️ Implementation Strategy

### Step 1: Database Schema Update

**Add to `users` table:**
```sql
-- User's current difficulty level
ALTER TABLE users
ADD COLUMN current_level TEXT DEFAULT 'Beginner';

-- User type: 'school' or 'individual'
ALTER TABLE users
ADD COLUMN user_type TEXT DEFAULT 'individual';

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_users_current_level ON users(current_level);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
```

**Why these fields?**
- `current_level` → Matches lesson `difficulty` values (Beginner, Intermediate, Advanced)
- `user_type` → Maps to lesson `target_audience` (school users see "schools", individuals see "users")

### Step 2: Level Definitions

**Reuse your existing difficulty values:**
```javascript
// In worldsConfig.js or new levelsConfig.js
export const LEVELS = {
  beginner: {
    name: "Beginner",
    displayName: "Level 1: Discovery",
    description: "Start your journey",
    difficulty: "Beginner",
  },
  intermediate: {
    name: "Intermediate",
    displayName: "Level 2: Explorer",
    description: "Deepen your knowledge",
    difficulty: "Intermediate",
  },
  advanced: {
    name: "Advanced",
    displayName: "Level 3: Expert",
    description: "Master the content",
    difficulty: "Advanced",
  },
  survival_absolute: {
    name: "Survival Absolute",
    displayName: "Level 0: Survival",
    description: "Essential basics only",
    difficulty: "Survival Absolute",
  },
};
```

### Step 3: Filtering Logic

**Server-side filtering** (recommended for security):

```javascript
// lib/supabase/lesson-queries.js
export async function getLessonsForUser(userId, worldId, adventureId) {
  try {
    // Get user's level and type
    const { data: userData } = await supabase
      .from("users")
      .select("current_level, user_type")
      .eq("id", userId)
      .single();

    const userLevel = userData?.current_level || "Beginner";
    const userType = userData?.user_type || "individual";

    // Map user_type to target_audience values
    const targetAudience = userType === "school" ? "schools" : "users";

    // Fetch lessons matching user's level and type
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("world", worldId)
      .contains("theme_tags", [adventureId]) // Match adventure
      .eq("difficulty", userLevel) // Match user's level
      .in("target_audience", [targetAudience, "players"]) // "players" = both
      .eq("is_active", true)
      .order("sort_order");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching filtered lessons:", error);
    return [];
  }
}
```

### Step 4: UI Updates

**Worlds page** - Show adventures with lessons for user's level:

```javascript
// Check if adventure has lessons for this user
const hasLessonsForUser = async (adventureId) => {
  const lessons = await getLessonsForUser(user.id, world.id, adventureId);
  return lessons.length > 0;
};

// Filter adventures
const visibleAdventures = await Promise.all(
  world.adventures.map(async (adventure) => ({
    ...adventure,
    hasContent: await hasLessonsForUser(adventure.id),
  }))
);

// Only show adventures with content
const filteredAdventures = visibleAdventures.filter(a => a.hasContent);
```

## 🔄 Level Progression Flow

### How Users Progress Through Levels

**Scenario 1: School Users**
1. Start at "Beginner" level
2. Complete all 8 worlds → Adventure 1-4 in each world
3. Teacher/Admin promotes them to "Intermediate"
4. Cycle restarts with **new lessons** (same adventures, different content)
5. Repeat for "Advanced" level

**Scenario 2: Individual Users**
1. Start at "Beginner" level
2. Complete World 1 → Auto-unlock next lesson set
3. Complete all worlds → Option to restart at "Intermediate"
4. Gamification: "You've completed Discovery Level! Ready for Explorer?"

### Level Advancement Options

**Option A: Manual Promotion** (Schools)
```javascript
// Admin sets user's level
await updateUserLevel(userId, "Intermediate");
```

**Option B: Automatic Progression** (Individuals)
```javascript
// Check if user completed all lessons at current level
const canLevelUp = await checkLevelCompletion(userId);
if (canLevelUp) {
  await promptLevelUp(userId); // Show modal
}
```

## 🎨 Content Organization Strategy

### Same Adventures, Different Lessons

**Example: Amazon Rainforest Adventure**

**Beginner Level:**
- Lesson 1: "What is a Rainforest?" (basic vocabulary)
- Lesson 2: "Rainforest Animals" (simple descriptions)
- Lesson 3: "Why Rainforests Matter" (short reading)

**Intermediate Level:**
- Lesson 1: "Rainforest Ecosystems" (complex vocabulary)
- Lesson 2: "Biodiversity and Balance" (cause-effect)
- Lesson 3: "Deforestation Impact" (argumentative text)

**Advanced Level:**
- Lesson 1: "Carbon Cycle in Rainforests" (scientific text)
- Lesson 2: "Indigenous Knowledge Systems" (cultural context)
- Lesson 3: "Conservation Policy Debates" (critical thinking)

**All same adventure, different difficulty!**

## 📋 Implementation Checklist

### Phase 1: Database (5 mins)
- [ ] Run migration to add `current_level` and `user_type` to users table
- [ ] Set default values for existing users
- [ ] Create indexes

### Phase 2: Backend (30 mins)
- [ ] Create `getLessonsForUser()` function with filtering
- [ ] Update existing lesson queries to respect user level
- [ ] Add level progression check functions

### Phase 3: UI (1 hour)
- [ ] Update worlds/adventures page to filter by user level
- [ ] Add "Current Level" display to user profile/header
- [ ] Create level-up modal/notification
- [ ] Update Lesson Builder to show level/audience info

### Phase 4: Admin Tools (30 mins)
- [ ] Add user level management to admin panel
- [ ] Bulk update tools for classes
- [ ] Level progression reports

## ⚠️ Potential Issues & Solutions

### Issue 1: Empty Adventures
**Problem:** User sees an adventure with 0 lessons (all filtered out)
**Solution:** Hide adventures with no lessons for user's level
```javascript
const filteredAdventures = adventures.filter(adv =>
  getLessonCount(adv.id, user.currentLevel) > 0
);
```

### Issue 2: Mid-Level Changes
**Problem:** User switches levels while mid-adventure
**Solution:**
- Store progress separately per level
- Or: Warn user before level change
- Or: Allow level "preview" without switching

### Issue 3: Missing Content
**Problem:** Intermediate/Advanced levels don't have lessons yet
**Solution:**
- Show "Coming Soon" badge
- Or: Fall back to Beginner content
- Or: Hide the level option until content ready

### Issue 4: Clone Confusion
**Problem:** Different projects use different level names
**Solution:**
- Use `difficulty` as database value
- Use `displayName` in UI (customizable per project)
- Example: Habitat = "Discovery/Explorer/Expert"
- Example: Startup Nation = "Founder/Scaleup/Unicorn"

## 🔄 Cloning Strategy

When cloning for Startup Nation, FieldTalk, etc.:

### What Stays the Same
- ✅ Database structure (`difficulty`, `target_audience`)
- ✅ Filtering logic
- ✅ Level progression mechanics

### What Changes
- ❌ Level display names (in `LEVELS` config)
- ❌ Number of levels (add "Expert+", "Master", etc.)
- ❌ World/Adventure themes
- ❌ Lesson content

### Cloning Checklist
1. Copy database schema
2. Copy filtering logic
3. Create new `levelsConfig.js` with project-specific names
4. Update UI text/branding
5. Create new lesson content

**Level system = Universal across all projects!**

## 📊 Data Model Example

### User Record
```javascript
{
  id: "uuid",
  email: "student@school.com",
  name: "Maria Silva",
  role: "Student",
  current_level: "Intermediate",  // ← NEW
  user_type: "school",            // ← NEW
  onboarding_completed: true,
}
```

### Lesson Record
```javascript
{
  id: "uuid",
  title: "Amazon Rainforest Basics",
  difficulty: "Beginner",        // Maps to user.current_level
  target_audience: "schools",    // Maps to user.user_type
  world: "south_america",
  theme_tags: ["amazon_adventure"],
  is_active: true,
}
```

### Query Result
```javascript
// User: current_level="Beginner", user_type="school"
// Returns: Only "Beginner" difficulty + "schools" or "players" audience
const lessons = await getLessonsForUser(userId, "south_america", "amazon");
// [Lesson 1 (Beginner/schools), Lesson 2 (Beginner/players), ...]
// Lesson 3 (Intermediate/schools) NOT included
```

## 🎯 Recommended Next Steps

### Option A: Full Implementation (Recommended)
1. **I implement everything** (database + backend + UI)
2. **You test** with different user levels
3. **You create content** for each level
4. **Deploy and iterate**

### Option B: Phased Rollout
1. **Phase 1:** Database + backend filtering only
2. **Phase 2:** UI updates (you can customize)
3. **Phase 3:** Admin tools and progression

### Option C: Minimal Viable Product (MVP)
1. Just add filtering by `difficulty` and `target_audience`
2. Manually set user levels in database
3. No UI for level switching yet
4. Test with small group first

## 💡 My Recommendation

**Go with Option A (Full Implementation)** because:
- ✅ Database changes are minimal and safe
- ✅ Filtering logic is straightforward
- ✅ UI changes are non-breaking
- ✅ Sets you up perfectly for cloning
- ✅ You can start creating multi-level content immediately
- ✅ Users get a richer experience from day 1

---

## 🚀 Ready to Implement?

If you approve this approach, I'll:
1. Create the database migration
2. Add the filtering functions
3. Update the worlds/adventures UI
4. Create admin tools for level management
5. Add level progression logic
6. Document everything for cloning

**Estimated time:** 2-3 hours total
**Risk level:** Low (backward compatible, non-breaking changes)
**Benefit:** Massive content reusability + retention boost

Let me know if you want me to proceed, or if you have any questions/concerns about this architecture!
