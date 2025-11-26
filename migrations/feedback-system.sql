-- =====================================================
-- FEEDBACK SYSTEM & BETA TESTER ROLE
-- =====================================================

-- 1. Add beta_tester role option to users table
-- First, check existing role column setup and add beta_tester if needed
-- Assuming role column exists, we'll add a constraint that includes beta_tester

-- Note: You may need to adjust this based on your existing role column setup
-- If role is an enum, you'll need to add beta_tester to the enum type
-- If it's a text column with a check constraint, update the constraint

-- Option 1: If using check constraint (update this to match your existing constraint)
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
-- ALTER TABLE users ADD CONSTRAINT users_role_check
--   CHECK (role IN ('user', 'admin', 'beta_tester'));

-- Option 2: If using enum type, you'd need to:
-- ALTER TYPE user_role ADD VALUE 'beta_tester';

-- For now, assuming role is a text column, we'll just document it
-- Beta tester role: 'beta_tester' - has premium access but provides feedback


-- 2. Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- User context
  user_email TEXT,
  user_role TEXT, -- Captured at submission: 'user', 'premium', 'beta_tester'
  is_beta_tester BOOLEAN DEFAULT false,

  -- Feedback type
  feedback_type TEXT NOT NULL DEFAULT 'detailed', -- 'quick' or 'detailed'

  -- Quick feedback fields
  quick_comment TEXT,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),

  -- Detailed feedback ratings (1-5 stars, all optional)
  content_quality_rating INTEGER CHECK (content_quality_rating >= 1 AND content_quality_rating <= 5),
  content_quality_comment TEXT,

  ease_of_use_rating INTEGER CHECK (ease_of_use_rating >= 1 AND ease_of_use_rating <= 5),
  ease_of_use_comment TEXT,

  learning_effectiveness_rating INTEGER CHECK (learning_effectiveness_rating >= 1 AND learning_effectiveness_rating <= 5),
  learning_effectiveness_comment TEXT,

  technical_performance_rating INTEGER CHECK (technical_performance_rating >= 1 AND technical_performance_rating <= 5),
  technical_performance_comment TEXT,

  -- Open-ended questions
  what_enjoyed TEXT,
  what_improved TEXT,
  feature_requests TEXT,
  general_comments TEXT,

  -- Context data
  current_page TEXT,
  current_lesson_id UUID,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  screen_size TEXT,

  -- Admin fields
  status TEXT DEFAULT 'new', -- 'new', 'reviewed', 'addressed', 'archived'
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for better query performance
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_user_role ON feedback(user_role);
CREATE INDEX idx_feedback_is_beta_tester ON feedback(is_beta_tester);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);

-- 4. Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own feedback
CREATE POLICY "Users can view their own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Admins can update feedback (for status, notes, etc.)
CREATE POLICY "Admins can update feedback"
  ON feedback
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 6. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger to auto-update updated_at
CREATE TRIGGER feedback_updated_at_trigger
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- 8. Helper function to check if user is beta tester
CREATE OR REPLACE FUNCTION is_beta_tester(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = check_user_id
    AND role = 'beta_tester'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Helper function to check if user has premium access
-- Beta testers get premium access for free
CREATE OR REPLACE FUNCTION has_premium_access(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = check_user_id
    AND (
      role = 'beta_tester'
      OR stripe_subscription_status = 'active'
      OR stripe_subscription_status = 'trialing'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create a view for feedback analytics (admin only)
CREATE OR REPLACE VIEW feedback_analytics AS
SELECT
  feedback_type,
  user_role,
  is_beta_tester,
  COUNT(*) as total_count,
  AVG(overall_rating) as avg_overall_rating,
  AVG(content_quality_rating) as avg_content_rating,
  AVG(ease_of_use_rating) as avg_ease_of_use,
  AVG(learning_effectiveness_rating) as avg_learning_effectiveness,
  AVG(technical_performance_rating) as avg_technical_performance,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
  COUNT(CASE WHEN status = 'reviewed' THEN 1 END) as reviewed_count,
  COUNT(CASE WHEN status = 'addressed' THEN 1 END) as addressed_count,
  DATE_TRUNC('day', created_at) as feedback_date
FROM feedback
GROUP BY feedback_type, user_role, is_beta_tester, DATE_TRUNC('day', created_at);

-- Grant access to the view
GRANT SELECT ON feedback_analytics TO authenticated;

-- Note: Remember to update the users table role column to support 'beta_tester'
-- This can be done manually in Supabase UI or via ALTER TABLE depending on your setup
