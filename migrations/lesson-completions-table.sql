-- Create lesson_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  xp_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user can only complete a lesson once
  UNIQUE(user_id, lesson_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_id ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson_id ON lesson_completions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_completed_at ON lesson_completions(completed_at);

-- Disable Row Level Security since we're using NextAuth (not Supabase Auth)
-- Access will be controlled via API routes with NextAuth session validation
ALTER TABLE lesson_completions DISABLE ROW LEVEL SECURITY;

-- Grant basic permissions for service role
-- (API routes will use service role key with NextAuth session checks)
GRANT SELECT, INSERT, UPDATE ON lesson_completions TO postgres, anon, authenticated, service_role;
