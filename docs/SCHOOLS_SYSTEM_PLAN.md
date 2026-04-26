# Schools System Implementation Plan

## Overview

This document outlines the implementation plan for the B2B schools partnership system, enabling language schools (starting with Cultura Inglesa branches) to register and have their students sign up seamlessly.

**Target Launch:** Testing at Cultura Inglesa Teresina during week of April 26-May 2, 2026
**CDC Presentation:** May 3, 2026

---

## Current Infrastructure Analysis

### What Already Exists

1. **Database Schema (Partial)**
   - `users` table has: `school_id`, `current_level`, `user_type` columns
   - `schools-queries.js` has CRUD operations (needs adaptation from "players" to "users")

2. **Guest Access System (Template)**
   - `guest_access_codes` table provides excellent template for school signup links
   - QR campaigns flow can be adapted for school-specific links

3. **User Levels**
   - `current_level` column exists (Beginner, Intermediate, Advanced, etc.)
   - `user_type` column exists ('school' vs 'individual')

### What Needs to Be Built

1. Database: `schools` table, `school_levels` table, user columns (teacher, full_name)
2. Admin: Schools management page
3. Public: School-specific signup flow
4. User Dashboard: School/level/teacher display

---

## Database Schema

### Migration: `schools-system.sql`

```sql
-- ============================================================================
-- Schools System for B2B Partnerships
-- ============================================================================

-- 1. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,                          -- "Cultura Inglesa Teresina"
  slug TEXT UNIQUE NOT NULL,                   -- "cultura-teresina" (for URLs)
  code TEXT UNIQUE NOT NULL,                   -- "SCH-XXXX" (signup code)

  -- Organization
  group_name TEXT,                             -- "Cultura Inglesa" (parent org)
  branch_name TEXT,                            -- "Teresina" (branch identifier)

  -- Contact
  contact_name TEXT,                           -- Director/Coordinator name
  contact_email TEXT,
  contact_phone TEXT,

  -- Location
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Brazil',
  timezone TEXT DEFAULT 'America/Sao_Paulo',

  -- Partnership Details
  partnership_tier TEXT DEFAULT 'pilot'        -- pilot, basic, premium, enterprise
    CHECK (partnership_tier IN ('pilot', 'basic', 'premium', 'enterprise')),
  partnership_start DATE,
  partnership_end DATE,                        -- NULL = ongoing

  -- Settings
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e40af',        -- For branding
  features_config JSONB DEFAULT '{}',          -- Feature flags

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SCHOOL LEVELS (Maps school's levels to Habitat levels)
CREATE TABLE IF NOT EXISTS school_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,

  -- School's Level
  school_level_name TEXT NOT NULL,             -- "Básico 1", "Kids 2", "Teens A"
  school_level_order INTEGER DEFAULT 0,        -- For sorting

  -- Habitat Mapping
  habitat_level TEXT NOT NULL                  -- "Beginner", "Intermediate", etc.
    CHECK (habitat_level IN ('Beginner', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced')),
  habitat_world TEXT,                          -- Optional: Start in specific world
  habitat_adventure TEXT,                      -- Optional: Start in specific adventure

  -- Settings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(school_id, school_level_name)
);

-- 3. SCHOOL TEACHERS
CREATE TABLE IF NOT EXISTS school_teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT,                                  -- Optional, for future features
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(school_id, name)
);

-- 4. ADD COLUMNS TO USERS TABLE
ALTER TABLE users
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES school_teachers(id),
ADD COLUMN IF NOT EXISTS school_level_id UUID REFERENCES school_levels(id),
ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ;  -- When they joined via school

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_schools_slug ON schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_group ON schools(group_name);
CREATE INDEX IF NOT EXISTS idx_schools_active ON schools(is_active);
CREATE INDEX IF NOT EXISTS idx_school_levels_school ON school_levels(school_id);
CREATE INDEX IF NOT EXISTS idx_school_teachers_school ON school_teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_users_school ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_teacher ON users(teacher_id);
CREATE INDEX IF NOT EXISTS idx_users_school_level ON users(school_level_id);

-- 6. RLS POLICIES
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_teachers ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access on schools"
  ON schools FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on school_levels"
  ON school_levels FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on school_teachers"
  ON school_teachers FOR ALL USING (true) WITH CHECK (true);

-- 7. HELPER FUNCTION: Generate school code
CREATE OR REPLACE FUNCTION generate_school_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate code like "SCH-A7K9"
    new_code := 'SCH-' || upper(substr(md5(random()::text), 1, 4));

    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM schools WHERE code = new_code) INTO code_exists;

    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 8. AUTO-UPDATE TRIGGER
CREATE OR REPLACE FUNCTION update_schools_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_schools_updated_at();
```

---

## URL Structure

```
/school/[slug]              → School landing/signup page
/school/[slug]/signup       → Student registration form
/school/[slug]/join/[code]  → Direct signup link (validates school code)

/admin/schools              → Schools management (list all schools)
/admin/schools/new          → Register new school
/admin/schools/[id]         → View/edit school details & students
```

---

## Implementation Phases

### Phase 1: Database & Core (Days 1-2)

1. **Create Migration** (`migrations/schools-system.sql`)
2. **Update schools-queries.js** (adapt from "players" to "users")
3. **Create API Routes:**
   - `POST /api/schools` - Create school
   - `GET /api/schools` - List schools (admin)
   - `GET /api/schools/[slug]` - Get school by slug (public)
   - `PATCH /api/schools/[id]` - Update school
   - `POST /api/schools/[id]/levels` - Add school level
   - `POST /api/schools/[id]/teachers` - Add teacher

### Phase 2: Admin Interface (Days 2-3)

1. **Schools List Page** (`/admin/schools/page.js`)
   - List all registered schools
   - Quick stats: student count, active levels
   - Generate/copy signup links

2. **New School Form** (`/admin/schools/new/page.js`)
   - School details (name, contact, location)
   - Add levels with Habitat mapping
   - Add teachers
   - Generate unique signup code

3. **School Detail Page** (`/admin/schools/[id]/page.js`)
   - Edit school details
   - Manage levels and teachers
   - View enrolled students
   - Analytics (lessons completed, time spent)

### Phase 3: Student Signup Flow (Days 3-4)

1. **School Landing Page** (`/school/[slug]/page.js`)
   - School branding (logo, colors)
   - Welcome message
   - "Join as Student" button

2. **Student Signup Form** (`/school/[slug]/signup/page.js`)
   - Full Name (required)
   - Select Level (dropdown from school's levels)
   - Select Teacher (dropdown from school's teachers)
   - Email + Password OR Google OAuth
   - Auto-assigns: school_id, school_level_id, teacher_id, user_type='school'

3. **Post-Signup Flow**
   - Redirect to species selection (same as guest flow)
   - Start in appropriate world based on level mapping
   - Show welcome message

### Phase 4: User Dashboard Updates (Day 4-5)

1. **Display School Info**
   - School name and logo
   - Current level
   - Teacher name

2. **Editable Fields**
   - Level (dropdown of school's levels)
   - Teacher (dropdown of school's teachers)

### Phase 5: Testing & Polish (Days 5-7)

1. Register Cultura Inglesa Teresina as first school
2. Create test levels (Básico 1, Básico 2, Intermediário, etc.)
3. Add teachers
4. Test full flow: signup → species selection → first lesson
5. Fix any issues

---

## Key Decisions Needed

### 1. Level Mapping

How should Cultura's levels map to Habitat levels?

| Cultura Level | Habitat Level | Starting World |
|--------------|---------------|----------------|
| Kids 1-2 | Beginner | Rainforests |
| Kids 3-4 | Pre-Intermediate | Forests |
| Teens 1-2 | Intermediate | Oceans |
| Teens 3-4 | Upper-Intermediate | Coral Reefs |
| Adults Básico | Beginner | Rainforests |
| Adults Intermediário | Intermediate | Forests |
| Adults Avançado | Advanced | Oceans |

*This can be configured per-school via the admin interface.*

### 2. Teacher Assignment

**Option A:** Required at signup (student selects teacher)
**Option B:** Optional at signup (can be assigned later by coordinator)
**Recommendation:** Option A for initial launch - simpler for students

### 3. School Signup Link Format

**Option A:** Branded slug → `/school/cultura-teresina`
**Option B:** Code-based → `/join/SCH-A7K9`
**Option C:** Both (slug for public, code for direct links)
**Recommendation:** Option C - flexibility for different use cases

### 4. Premium Access for School Students

**Option A:** All school students get automatic premium access
**Option B:** School pays for X premium seats
**Option C:** Freemium model (basic free, premium features paid)
**Recommendation:** Option A for pilot phase, transition to B/C for paid partnerships

---

## Files to Create/Modify

### New Files

```
migrations/
  schools-system.sql

src/app/
  (site)/admin/schools/
    page.js                 # Schools list
    new/page.js             # Create school
    [id]/page.js            # Edit school

  school/[slug]/
    page.js                 # School landing
    signup/page.js          # Student signup
    layout.js               # School-branded layout

src/app/api/
  schools/
    route.js                # List/create schools
    [id]/route.js           # Get/update school
    [id]/levels/route.js    # Manage levels
    [id]/teachers/route.js  # Manage teachers
    [slug]/public/route.js  # Public school info

src/components/
  school/
    SchoolSignupForm.js     # Student registration form
    SchoolLevelSelect.js    # Level dropdown
    TeacherSelect.js        # Teacher dropdown
    SchoolBranding.js       # Logo, colors wrapper
```

### Files to Modify

```
src/lib/supabase/schools-queries.js  # Update for new schema
src/app/(site)/admin/page.js         # Add Schools to admin nav
src/app/(site)/dashboard/page.js     # Show school info for students
```

---

## Sample Data for Cultura Inglesa Teresina

```javascript
const culturaTeresina = {
  name: "Cultura Inglesa Teresina",
  slug: "cultura-teresina",
  group_name: "Cultura Inglesa",
  branch_name: "Teresina",
  contact_name: "Lucas [Last Name]",
  contact_email: "lucas@culturateresina.com.br",
  city: "Teresina",
  state: "Piauí",
  country: "Brazil",
  partnership_tier: "pilot",

  levels: [
    { school_level_name: "Kids 1", habitat_level: "Beginner" },
    { school_level_name: "Kids 2", habitat_level: "Beginner" },
    { school_level_name: "Kids 3", habitat_level: "Pre-Intermediate" },
    { school_level_name: "Teens 1", habitat_level: "Intermediate" },
    { school_level_name: "Teens 2", habitat_level: "Intermediate" },
    { school_level_name: "Básico", habitat_level: "Beginner" },
    { school_level_name: "Intermediário", habitat_level: "Intermediate" },
    { school_level_name: "Avançado", habitat_level: "Advanced" },
  ],

  teachers: [
    { name: "Teacher 1" },
    { name: "Teacher 2" },
    // ... to be filled in
  ]
};
```

---

## Success Criteria for CDC Demo

1. ✅ School can be registered via admin interface
2. ✅ Unique signup link generated for school
3. ✅ Students can sign up selecting their level and teacher
4. ✅ Students are directed to appropriate content after signup
5. ✅ Admin can view all students from a school
6. ✅ User dashboard shows school/level/teacher info
7. ✅ Works smoothly on mobile (teachers/students use phones)

---

## Next Steps

1. **Confirm decisions** above (level mapping, teacher assignment, etc.)
2. **Run migration** in Supabase
3. **Build Phase 1** - Core database and APIs
4. **Build Phase 2** - Admin interface
5. **Build Phase 3** - Student signup flow
6. **Test with real data** from Cultura Teresina
