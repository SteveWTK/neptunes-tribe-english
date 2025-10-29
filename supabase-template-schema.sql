-- ==================================================
-- SUPABASE TEMPLATE SCHEMA
-- ==================================================
-- Universal database schema for cloned English learning apps
-- (Habitat, StartupNation, FieldTalk, etc.)
--
-- This schema includes all core functionality needed for:
-- - User authentication & progress tracking
-- - Learning units & lessons
-- - Multi-language support
-- - Subscription management
-- - Gamification (points, levels, achievements)
--
-- To use: Run this in your new Supabase project's SQL Editor

-- ==================================================
-- EXTENSIONS
-- ==================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ==================================================
-- USERS TABLE
-- ==================================================
-- Note: Supabase creates an auth.users table automatically
-- This is our public users table with additional profile data

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,

  -- Subscription
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  subscription_status TEXT DEFAULT 'active',
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,

  -- Preferences
  preferred_language TEXT DEFAULT 'en',
  native_language TEXT DEFAULT 'pt',
  dark_mode BOOLEAN DEFAULT false,
  email_notifications BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false
);

-- ==================================================
-- UNITS TABLE (Main Learning Content)
-- ==================================================
CREATE TABLE IF NOT EXISTS public.units (
  id SERIAL PRIMARY KEY,

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  content_text TEXT,          -- Full text with blanks marked as [1], [2], etc.
  gap_fill_text TEXT,         -- Alternative format for gap-fill
  image TEXT,                 -- URL to image
  audio TEXT,                 -- URL to audio file

  -- Organization
  theme TEXT,                 -- e.g., "amazon", "technology", "football"
  theme_tags TEXT[],          -- Array for multiple theme associations
  world TEXT,                 -- Links to worldsConfig.js (or topicsConfig.js)
  region_code TEXT[],         -- Geographic regions or categories

  -- Metadata
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  length INTEGER,             -- Estimated completion time in minutes
  sort_order INTEGER DEFAULT 0,

  -- Visibility & Access
  featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for common queries
CREATE INDEX idx_units_theme_tags ON units USING GIN (theme_tags);
CREATE INDEX idx_units_difficulty ON units (difficulty_level);
CREATE INDEX idx_units_featured ON units (featured) WHERE featured = true;

-- ==================================================
-- LESSONS TABLE (Structured Learning Paths)
-- ==================================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id SERIAL PRIMARY KEY,

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,

  -- Structure (JSONB for flexibility)
  content JSONB,              -- Contains steps array with different step types

  -- Organization
  theme_tags TEXT[],          -- Links to adventures/topics
  world TEXT,                 -- Links to worldsConfig
  difficulty_level TEXT,
  estimated_duration INTEGER, -- In minutes
  sort_order INTEGER DEFAULT 0,

  -- Visibility
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_lessons_theme_tags ON lessons USING GIN (theme_tags);
CREATE INDEX idx_lessons_world ON lessons (world);

-- ==================================================
-- TRANSLATIONS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.translations (
  id SERIAL PRIMARY KEY,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, language_code)
);

CREATE INDEX idx_translations_unit ON translations (unit_id);
CREATE INDEX idx_translations_lang ON translations (language_code);

-- ==================================================
-- GAP FILL QUESTIONS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.gap_fill_questions (
  id SERIAL PRIMARY KEY,
  text_id INTEGER NOT NULL,   -- References unit id
  gap_number INTEGER NOT NULL,
  correct_answer TEXT NOT NULL,
  options TEXT[] NOT NULL,    -- Array of answer options
  part_before TEXT,           -- Text before the gap
  part_after TEXT,            -- Text after the gap
  notes TEXT,                 -- Explanation or teaching notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(text_id, gap_number)
);

CREATE INDEX idx_gap_fill_text ON gap_fill_questions (text_id);

-- ==================================================
-- USER PROGRESS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Points & Levels
  total_points INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  level_progress DECIMAL(5,2) DEFAULT 0.0, -- Percentage to next level

  -- Activity Tracking
  completed_exercises INTEGER DEFAULT 0,
  completed_units INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0,     -- In minutes

  -- Streaks
  current_streak INTEGER DEFAULT 0,        -- Days
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  -- Performance
  average_score DECIMAL(5,2) DEFAULT 0.0,
  accuracy_rate DECIMAL(5,2) DEFAULT 0.0,

  -- Timestamps
  last_active TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================================================
-- COMPLETED UNITS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.completed_units (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,

  -- Performance
  score INTEGER,
  accuracy DECIMAL(5,2),
  time_spent INTEGER,         -- In seconds
  attempts INTEGER DEFAULT 1,

  -- Completion
  completed_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, unit_id)
);

CREATE INDEX idx_completed_units_user ON completed_units (user_id);
CREATE INDEX idx_completed_units_date ON completed_units (completed_at DESC);

-- ==================================================
-- COMPLETED LESSONS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.completed_lessons (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,

  -- Progress
  steps_completed INTEGER DEFAULT 0,
  total_steps INTEGER,
  score INTEGER DEFAULT 0,

  -- Completion
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent INTEGER,         -- In seconds

  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_completed_lessons_user ON completed_lessons (user_id);

-- ==================================================
-- WEEKLY THEMES TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS public.weekly_themes (
  id SERIAL PRIMARY KEY,

  -- Content
  theme_title TEXT NOT NULL,
  theme_title_pt TEXT,        -- Portuguese translation
  theme_description TEXT,
  theme_description_pt TEXT,
  image_url TEXT,

  -- Organization
  featured_regions TEXT[],    -- Can be regions, topics, etc.
  related_theme_tags TEXT[],  -- Links to units/lessons

  -- Scheduling
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_weekly_themes_dates ON weekly_themes (start_date, end_date);
CREATE INDEX idx_weekly_themes_active ON weekly_themes (is_active) WHERE is_active = true;

-- ==================================================
-- ACHIEVEMENTS TABLE (Optional - Gamification)
-- ==================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,

  -- Requirements
  requirement_type TEXT NOT NULL, -- e.g., 'units_completed', 'streak', 'points'
  requirement_value INTEGER NOT NULL,

  -- Rewards
  points_reward INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- ==================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- User progress policies
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR ALL
  USING (auth.uid() = user_id);

-- Completed units policies
CREATE POLICY "Users can view own completed units"
  ON completed_units FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed units"
  ON completed_units FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Completed lessons policies
CREATE POLICY "Users can view own completed lessons"
  ON completed_lessons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completed lessons"
  ON completed_lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read access for content (units, lessons, themes)
CREATE POLICY "Units are viewable by everyone"
  ON units FOR SELECT
  USING (true);

CREATE POLICY "Lessons are viewable by everyone"
  ON lessons FOR SELECT
  USING (true);

CREATE POLICY "Translations are viewable by everyone"
  ON translations FOR SELECT
  USING (true);

CREATE POLICY "Gap fill questions are viewable by everyone"
  ON gap_fill_questions FOR SELECT
  USING (true);

CREATE POLICY "Weekly themes are viewable by everyone"
  ON weekly_themes FOR SELECT
  USING (true);

CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- ==================================================
-- FUNCTIONS
-- ==================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update user progress when unit is completed
CREATE OR REPLACE FUNCTION update_progress_on_unit_completion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (user_id, completed_units, total_points, last_active, updated_at)
  VALUES (NEW.user_id, 1, COALESCE(NEW.score, 0), NOW(), NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    completed_units = user_progress.completed_units + 1,
    total_points = user_progress.total_points + COALESCE(NEW.score, 0),
    last_active = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progress_on_unit
  AFTER INSERT ON completed_units
  FOR EACH ROW
  EXECUTE FUNCTION update_progress_on_unit_completion();

-- ==================================================
-- INITIAL DATA (Optional)
-- ==================================================

-- Insert default achievements
INSERT INTO achievements (name, description, icon, requirement_type, requirement_value, points_reward)
VALUES
  ('First Steps', 'Complete your first unit', '🌱', 'units_completed', 1, 10),
  ('Learning Streak', 'Study for 7 days in a row', '🔥', 'streak', 7, 50),
  ('Dedicated Learner', 'Complete 10 units', '📚', 'units_completed', 10, 100),
  ('Point Master', 'Earn 1000 points', '⭐', 'points', 1000, 200)
ON CONFLICT DO NOTHING;

-- ==================================================
-- NOTES FOR CUSTOMIZATION
-- ==================================================

/*
When cloning for a new app:

1. Run this entire script in your new Supabase project

2. Add app-specific extension tables:
   For Habitat:
   - conservation_heroes (id, name, bio, image, region, unit_id)
   - ecosystem_data (id, ecosystem_type, climate_info, threats)

   For StartupNation:
   - founder_stories (id, founder_name, company, industry, bio, unit_id)
   - business_terms (id, term, definition, examples, category)
   - startup_cases (id, company_name, case_study_text, lessons, unit_id)

   For FieldTalk:
   - sports_legends (id, name, sport, achievements, bio, unit_id)
   - match_vocabulary (id, sport, term, definition, usage_example)

3. Customize content in units and lessons tables

4. Update weekly_themes to match your theme structure

5. Add your custom achievements

All core functionality (auth, progress tracking, subscriptions)
works the same across all apps!
*/
