# Neptune's Tribe User Experience Strategy

## Vision
Transform Neptune's Tribe into a weekly themed learning adventure where users explore different ecosystems through an interactive map, completing units and lessons that build environmental awareness.

---

## Core User Flow

### 1. **Eco-Map as Home** 🗺️
**Route:** `/eco-map` (redirect here after login)

**Features:**
- Interactive world map with clickable regions
- Current weekly theme prominently displayed
- Animated highlights on theme-relevant regions
- Quick stats (XP this week, lessons completed, etc.)
- "Start This Week's Journey" CTA button

**Implementation:**
```javascript
// In middleware.js
if (isLoggedIn && nextUrl.pathname === '/') {
  return NextResponse.redirect(new URL('/eco-map', nextUrl));
}
```

---

### 2. **Weekly Theme Hub** 🎯
**Route:** `/theme/[theme-id]` or `/weekly`

**Layout:**
```
┌─────────────────────────────────────┐
│     🌳 Amazon Rainforest Week       │
│   "Lungs of the Earth"              │
│                                     │
│ [Progress Bar] 3/7 activities done  │
└─────────────────────────────────────┘

┌─────────────┬───────────────────────┐
│   UNITS     │      LESSONS          │
│             │                       │
│ ▶ Unit 42   │ ▶ Biodiversity Basics │
│ ▶ Unit 43   │ ▶ Canopy Layers      │
│ ▶ Unit 44   │ ▶ Conservation Hero   │
└─────────────┴───────────────────────┘
```

**Features:**
- Theme description and why it matters
- List of related units (quick exercises)
- List of related lessons (comprehensive)
- Weekly challenge/goal
- Social features (see who else is learning)

---

### 3. **Content Organization**

#### **Units (Existing)**
- **Purpose:** Quick vocabulary & comprehension
- **Duration:** 5-10 minutes
- **Format:** Multi-gap-fill exercise
- **Access:** Direct via `/units/[id]`
- **Keep as-is:** Don't break existing functionality

#### **Lessons (New CMS)**
- **Purpose:** Deep, multi-faceted learning
- **Duration:** 15-30 minutes
- **Format:** Multi-step journey
- **Structure:**
  1. Unit reference (vocabulary intro)
  2. Scenario/story
  3. Interactive exercises
  4. Cultural context
  5. Completion celebration

---

## Database Design

### Link Content to Weekly Themes

**Option 1: Add theme_tags to content**
```sql
ALTER TABLE units ADD COLUMN theme_tags TEXT[];
ALTER TABLE lessons ADD COLUMN theme_tags TEXT[];

-- Example: Tag Amazon-related content
UPDATE units
SET theme_tags = ARRAY['amazon', 'rainforest', 'biodiversity']
WHERE region_name LIKE '%Amazon%';
```

**Option 2: Create linking table**
```sql
CREATE TABLE theme_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id INTEGER REFERENCES weekly_themes(id),
  content_type TEXT CHECK (content_type IN ('unit', 'lesson')),
  content_id TEXT, -- Can be unit ID or lesson UUID
  sort_order INTEGER DEFAULT 0
);
```

---

## Implementation Phases

### **Phase 1: Foundation** (Week 1)
- [x] Lesson CMS migrated
- [x] Basic lesson listing page
- [ ] Update eco-map to be clickable
- [ ] Create theme hub page
- [ ] Add theme filtering to lessons

### **Phase 2: Integration** (Week 2)
- [ ] Link units to weekly themes
- [ ] Add "Start Weekly Theme" flow
- [ ] Create progress tracking
- [ ] Add theme completion rewards

### **Phase 3: Enhancement** (Week 3)
- [ ] Social features (see other learners)
- [ ] Weekly leaderboard
- [ ] Achievement badges
- [ ] Email reminders for new themes

---

## Key Features to Implement

### 1. **Smart Content Filtering**
```javascript
// Get content for current theme
async function getThemeContent(themeId) {
  const units = await supabase
    .from('units')
    .select('*')
    .contains('theme_tags', [currentTheme.tag]);

  const lessons = await supabase
    .from('lessons')
    .select('*')
    .contains('theme_tags', [currentTheme.tag]);

  return { units, lessons };
}
```

### 2. **Progress Tracking**
```javascript
// Track weekly progress
async function getWeeklyProgress(userId, themeId) {
  const completedUnits = await getCompletedUnits(userId, themeId);
  const completedLessons = await getCompletedLessons(userId, themeId);

  return {
    units: completedUnits.length,
    lessons: completedLessons.length,
    xpEarned: calculateXP(completedUnits, completedLessons),
    streak: calculateStreak(userId)
  };
}
```

### 3. **Gamification**
- **Weekly Streaks:** Complete at least 3 activities per week
- **Theme Badges:** Complete all content for a theme
- **Eco-Points:** Special currency for completing themes
- **Leaderboards:** Weekly, monthly, all-time

---

## Navigation Updates

### Primary Navigation
```
🗺️ Eco-Map | 📚 Lessons | 🎯 This Week | 👤 Profile
```

### User Flow Examples

**New User:**
1. Signs up → Welcome modal
2. Redirected to eco-map
3. Sees pulsing region for weekly theme
4. Clicks region → Theme hub
5. Chooses first unit → Completes it
6. Unlocks first lesson → Journey begins

**Returning User:**
1. Logs in → Eco-map
2. Sees "Continue This Week" banner
3. Clicks → Theme hub
4. Sees 3/7 completed
5. Picks up where they left off

---

## Content Creation Strategy

### Weekly Theme Planning
1. **Monday:** New theme launches
2. **Content per theme:**
   - 3-5 related units
   - 2-3 comprehensive lessons
   - 1 challenge/bonus activity

### Lesson Structure Template
```javascript
{
  title: "The Amazon Canopy Layers",
  theme_tags: ["amazon", "rainforest", "ecosystems"],
  steps: [
    { type: "unit_reference", unit_id: 42 },  // Vocabulary
    { type: "scenario", content: "Journey through layers..." },
    { type: "memory_match", pairs: [...] },   // Reinforce
    { type: "video", url: "..." },            // Deepen
    { type: "completion", xp: 150 }           // Celebrate
  ]
}
```

---

## Advantages of This Approach

### For Users
- **Clear weekly focus** - not overwhelming
- **Multiple entry points** - units OR lessons
- **Visual navigation** - eco-map is engaging
- **Sense of progress** - weekly goals achievable
- **Social connection** - learning together

### For Content Team
- **Reuse existing units** - no waste
- **Flexible lesson creation** - mix and match
- **Theme-based planning** - easier to organize
- **Analytics friendly** - track by theme

### For Development
- **Incremental rollout** - phase by phase
- **Backwards compatible** - units still work
- **Scalable** - add themes without refactoring
- **Maintainable** - clear separation of concerns

---

## Quick Wins to Start

### 1. **Update Middleware** (5 min)
Redirect logged-in users to eco-map:
```javascript
if (isLoggedIn && nextUrl.pathname === '/') {
  return NextResponse.redirect(new URL('/eco-map', nextUrl));
}
```

### 2. **Add Theme Tags** (30 min)
Tag your existing units/lessons in Supabase:
```sql
UPDATE units SET theme_tags = ARRAY['amazon'] WHERE id IN (42,43,44);
UPDATE lessons SET theme_tags = ARRAY['amazon'] WHERE title LIKE '%Amazon%';
```

### 3. **Create First Full Lesson** (1 hour)
Use the admin panel to create a lesson that:
- References an existing unit
- Adds 2-3 more steps
- Tells a complete story

### 4. **Theme Hub Page** (2 hours)
Create `/app/(site)/theme/page.js` that:
- Shows current weekly theme
- Lists filtered units & lessons
- Tracks completion

---

## Success Metrics

### Week 1
- Users spend 50% more time on platform
- 70% of users complete at least one weekly activity
- Average session includes 2+ content pieces

### Month 1
- 80% weekly active users
- Average 5 activities completed per user per week
- 30% of users complete full weekly theme

### Quarter 1
- 90% user retention
- Users complete 12+ weekly themes
- Social features drive 40% of engagement

---

## Next Steps

1. **Immediate:** Test lesson creation flow
2. **Tomorrow:** Update eco-map with clickable regions
3. **This Week:** Launch first weekly theme
4. **Next Week:** Add progress tracking
5. **Month 1:** Full gamification system

---

This strategy creates a cohesive, engaging experience that:
- Leverages your existing content (units)
- Uses the new CMS effectively (lessons)
- Centers around the eco-map (visual appeal)
- Drives weekly engagement (themes)
- Scales beautifully (add themes over time)

Ready to implement? 🚀