-- ==================================================
-- AI FEEDBACK TABLES
-- ==================================================
-- Tables for storing AI-generated feedback from various exercise types
-- (Speech Practice, Writing Exercises, Conversation Practice)
--
-- To use: Run this in your Supabase project's SQL Editor

-- ==================================================
-- AI SPEECH FEEDBACK TABLE
-- ==================================================
-- Stores feedback from speech/pronunciation exercises
CREATE TABLE IF NOT EXISTS public.ai_speech_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INTEGER,

  -- Speech data
  transcript TEXT NOT NULL,           -- What the user actually said
  expected_text TEXT,                 -- What they were supposed to say (if applicable)

  -- Scores
  pronunciation_score INTEGER,        -- 0-100
  accuracy_score INTEGER,             -- 0-100
  overall_score INTEGER,              -- 0-100

  -- AI Feedback (stored as JSONB for flexibility)
  feedback JSONB NOT NULL,            -- Contains strengths, improvements, tips, etc.

  -- Metadata
  language TEXT DEFAULT 'en',         -- Language of the exercise
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_ai_speech_feedback_user_id ON ai_speech_feedback(user_id);
CREATE INDEX idx_ai_speech_feedback_lesson_id ON ai_speech_feedback(lesson_id);
CREATE INDEX idx_ai_speech_feedback_created_at ON ai_speech_feedback(created_at DESC);

-- ==================================================
-- AI FEEDBACK HISTORY TABLE
-- ==================================================
-- Stores feedback from writing exercises and other text-based activities
CREATE TABLE IF NOT EXISTS public.ai_feedback_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INTEGER,

  -- Writing data
  user_input TEXT NOT NULL,           -- What the user wrote
  prompt TEXT,                        -- The original prompt/question

  -- AI Feedback (stored as JSONB for flexibility)
  feedback JSONB NOT NULL,            -- Contains corrections, suggestions, scores, etc.

  -- Score
  score INTEGER,                      -- 0-100

  -- Metadata
  exercise_type TEXT DEFAULT 'writing', -- 'writing', 'grammar', 'vocabulary', etc.
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_ai_feedback_history_user_id ON ai_feedback_history(user_id);
CREATE INDEX idx_ai_feedback_history_lesson_id ON ai_feedback_history(lesson_id);
CREATE INDEX idx_ai_feedback_history_created_at ON ai_feedback_history(created_at DESC);

-- ==================================================
-- AI CONVERSATION HISTORY TABLE
-- ==================================================
-- Stores conversation exchanges for AI conversation practice
CREATE TABLE IF NOT EXISTS public.ai_conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id INTEGER,

  -- Conversation data
  messages JSONB NOT NULL,            -- Array of conversation messages [{role, content}]
  scenario TEXT,                      -- The conversation scenario/context

  -- Feedback
  feedback JSONB,                     -- AI feedback on the conversation
  score INTEGER,                      -- 0-100

  -- Metadata
  language TEXT DEFAULT 'en',
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_ai_conversation_history_user_id ON ai_conversation_history(user_id);
CREATE INDEX idx_ai_conversation_history_lesson_id ON ai_conversation_history(lesson_id);
CREATE INDEX idx_ai_conversation_history_created_at ON ai_conversation_history(created_at DESC);

-- ==================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================================
-- Enable RLS on all tables
ALTER TABLE ai_speech_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_history ENABLE ROW LEVEL SECURITY;

-- ai_speech_feedback policies
CREATE POLICY "Users can view their own speech feedback"
  ON ai_speech_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own speech feedback"
  ON ai_speech_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ai_feedback_history policies
CREATE POLICY "Users can view their own feedback history"
  ON ai_feedback_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback history"
  ON ai_feedback_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ai_conversation_history policies
CREATE POLICY "Users can view their own conversation history"
  ON ai_conversation_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation history"
  ON ai_conversation_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation history"
  ON ai_conversation_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==================================================
-- FUNCTIONS AND TRIGGERS
-- ==================================================
-- Update updated_at timestamp for ai_conversation_history
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversation_updated_at
  BEFORE UPDATE ON ai_conversation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- ==================================================
-- COMMENTS (for documentation)
-- ==================================================
COMMENT ON TABLE ai_speech_feedback IS 'Stores AI feedback from speech/pronunciation exercises using Whisper + GPT';
COMMENT ON TABLE ai_feedback_history IS 'Stores AI feedback from writing exercises and other text-based activities';
COMMENT ON TABLE ai_conversation_history IS 'Stores conversation exchanges for AI conversation practice exercises';
