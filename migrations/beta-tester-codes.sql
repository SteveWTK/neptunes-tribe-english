-- Beta Tester Invitation Code System
-- Creates table for managing one-time invitation codes for NGO staff

-- Invitation codes table
CREATE TABLE IF NOT EXISTS beta_invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  organization TEXT NOT NULL, -- Which NGO this code is for (e.g., 'WWF Brazil', 'Conservation International')

  -- Usage tracking
  is_used BOOLEAN DEFAULT false,
  used_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  used_by_email TEXT,
  used_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who generated it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date
  notes TEXT, -- Optional notes (e.g., 'Batch for Q1 2025')

  -- Constraints
  CONSTRAINT valid_code_format CHECK (code ~ '^BETA-[A-Z0-9]+-[A-Z0-9]+$')
);

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_beta_codes_code ON beta_invitation_codes(code);
CREATE INDEX IF NOT EXISTS idx_beta_codes_organization ON beta_invitation_codes(organization);
CREATE INDEX IF NOT EXISTS idx_beta_codes_is_used ON beta_invitation_codes(is_used);

-- RLS Policies
ALTER TABLE beta_invitation_codes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage beta codes"
  ON beta_invitation_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'platform_admin'
    )
  );

-- Anyone can check if a code is valid (for redemption)
CREATE POLICY "Anyone can validate codes"
  ON beta_invitation_codes
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to redeem a code and upgrade user
CREATE OR REPLACE FUNCTION redeem_beta_code(
  code_to_redeem TEXT,
  user_email TEXT
)
RETURNS JSON AS $$
DECLARE
  code_record RECORD;
  user_record RECORD;
  result JSON;
BEGIN
  -- Find the code
  SELECT * INTO code_record
  FROM beta_invitation_codes
  WHERE code = code_to_redeem;

  -- Check if code exists
  IF code_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid code'
    );
  END IF;

  -- Check if code is already used
  IF code_record.is_used THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code has already been used'
    );
  END IF;

  -- Check if code is expired
  IF code_record.expires_at IS NOT NULL AND code_record.expires_at < NOW() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Code has expired'
    );
  END IF;

  -- Find the user
  SELECT * INTO user_record
  FROM users
  WHERE email = user_email;

  IF user_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if user is already a beta tester
  IF user_record.role = 'beta_tester' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You are already a beta tester'
    );
  END IF;

  -- Upgrade user to beta tester
  UPDATE users
  SET
    role = 'beta_tester',
    is_premium = true
  WHERE email = user_email;

  -- Mark code as used
  UPDATE beta_invitation_codes
  SET
    is_used = true,
    used_by_user_id = user_record.id,
    used_by_email = user_email,
    used_at = NOW()
  WHERE code = code_to_redeem;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'organization', code_record.organization,
    'message', 'Successfully upgraded to beta tester with premium access'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate batch of codes
CREATE OR REPLACE FUNCTION generate_beta_codes(
  organization_name TEXT,
  batch_size INTEGER,
  admin_user_id UUID DEFAULT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  batch_notes TEXT DEFAULT NULL
)
RETURNS TABLE(code TEXT) AS $$
DECLARE
  i INTEGER;
  new_code TEXT;
  org_prefix TEXT;
BEGIN
  -- Create organization prefix (first 3-5 chars, uppercase, no spaces)
  org_prefix := UPPER(REGEXP_REPLACE(SUBSTRING(organization_name, 1, 5), '[^A-Z0-9]', '', 'g'));

  -- Generate codes
  FOR i IN 1..batch_size LOOP
    -- Generate unique random code like: BETA-WWF-A7K9M
    new_code := 'BETA-' || org_prefix || '-' ||
                UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 5));

    -- Insert the code
    INSERT INTO beta_invitation_codes (
      code,
      organization,
      created_by,
      expires_at,
      notes
    ) VALUES (
      new_code,
      organization_name,
      admin_user_id,
      expiration_date,
      batch_notes
    );

    RETURN QUERY SELECT new_code;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage (commented out):
-- Generate 10 codes for WWF Brazil
-- SELECT * FROM generate_beta_codes('WWF Brazil', 10, 'your-admin-user-id', NOW() + INTERVAL '1 year', 'Q1 2025 batch');

-- Redeem a code
-- SELECT redeem_beta_code('BETA-WWF-A7K9M', 'user@example.com');
