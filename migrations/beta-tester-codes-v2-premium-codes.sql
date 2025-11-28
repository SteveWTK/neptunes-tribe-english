-- Extension to Beta Tester Invitation Code System
-- Adds support for premium bulk purchase codes (enterprise, donated, etc.)

-- Add new columns to beta_invitation_codes table
ALTER TABLE beta_invitation_codes
  ADD COLUMN IF NOT EXISTS code_type TEXT DEFAULT 'beta_tester' CHECK (
    code_type IN ('beta_tester', 'bulk_premium', 'enterprise', 'donated_premium', 'promotional')
  ),
  ADD COLUMN IF NOT EXISTS premium_duration_months INTEGER, -- null = lifetime, number = months of premium
  ADD COLUMN IF NOT EXISTS purchaser_name TEXT, -- Company/organization who purchased
  ADD COLUMN IF NOT EXISTS purchaser_email TEXT, -- Contact email for purchaser
  ADD COLUMN IF NOT EXISTS purchase_amount DECIMAL(10,2), -- How much they paid (for reporting)
  ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2), -- Original price (to show discount)
  ADD COLUMN IF NOT EXISTS batch_id UUID DEFAULT gen_random_uuid(); -- Group codes from same purchase

-- Add index for code_type
CREATE INDEX IF NOT EXISTS idx_beta_codes_code_type ON beta_invitation_codes(code_type);
CREATE INDEX IF NOT EXISTS idx_beta_codes_batch_id ON beta_invitation_codes(batch_id);

-- Update the redeem function to handle different code types
CREATE OR REPLACE FUNCTION redeem_beta_code(
  code_to_redeem TEXT,
  user_email TEXT
)
RETURNS JSON AS $$
DECLARE
  code_record RECORD;
  user_record RECORD;
  premium_until_date TIMESTAMP WITH TIME ZONE;
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

  -- Check if user already has this type of access
  IF code_record.code_type = 'beta_tester' AND user_record.role = 'beta_tester' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You are already a beta tester'
    );
  END IF;

  -- Calculate premium expiration date if applicable
  IF code_record.premium_duration_months IS NOT NULL THEN
    premium_until_date := NOW() + (code_record.premium_duration_months || ' months')::INTERVAL;
  ELSE
    premium_until_date := NULL; -- Lifetime access
  END IF;

  -- Upgrade user based on code type
  IF code_record.code_type = 'beta_tester' THEN
    -- Beta testers get special role and permanent premium
    UPDATE users
    SET
      role = 'beta_tester',
      is_premium = true
    WHERE email = user_email;
  ELSE
    -- Premium codes (bulk, enterprise, donated) get premium access with optional expiration
    UPDATE users
    SET
      is_premium = true,
      premium_until = premium_until_date,
      premium_source = code_record.code_type -- Track where premium came from
    WHERE email = user_email;
  END IF;

  -- Mark code as used
  UPDATE beta_invitation_codes
  SET
    is_used = true,
    used_by_user_id = user_record.id,
    used_by_email = user_email,
    used_at = NOW()
  WHERE code = code_to_redeem;

  -- Return success with code type info
  RETURN json_build_object(
    'success', true,
    'code_type', code_record.code_type,
    'organization', code_record.organization,
    'premium_duration_months', code_record.premium_duration_months,
    'premium_until', premium_until_date,
    'message', CASE
      WHEN code_record.code_type = 'beta_tester' THEN 'Successfully upgraded to beta tester with premium access'
      WHEN code_record.premium_duration_months IS NULL THEN 'Successfully activated lifetime premium access'
      ELSE 'Successfully activated premium access for ' || code_record.premium_duration_months || ' months'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the generate function to support different code types
CREATE OR REPLACE FUNCTION generate_beta_codes(
  organization_name TEXT,
  batch_size INTEGER,
  admin_user_id UUID DEFAULT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  batch_notes TEXT DEFAULT NULL,
  code_type TEXT DEFAULT 'beta_tester',
  premium_duration_months INTEGER DEFAULT NULL,
  purchaser_name TEXT DEFAULT NULL,
  purchaser_email TEXT DEFAULT NULL,
  purchase_amount DECIMAL DEFAULT NULL,
  original_price DECIMAL DEFAULT NULL
)
RETURNS TABLE(code TEXT) AS $$
DECLARE
  i INTEGER;
  new_code TEXT;
  org_prefix TEXT;
  code_prefix TEXT;
  current_batch_id UUID;
BEGIN
  -- Generate batch ID for this group of codes
  current_batch_id := gen_random_uuid();

  -- Create organization prefix (first 3-5 chars, uppercase, no spaces)
  org_prefix := UPPER(REGEXP_REPLACE(SUBSTRING(organization_name, 1, 5), '[^A-Z0-9]', '', 'g'));

  -- Set code prefix based on type
  code_prefix := CASE code_type
    WHEN 'beta_tester' THEN 'BETA'
    WHEN 'bulk_premium' THEN 'PREM'
    WHEN 'enterprise' THEN 'ENTR'
    WHEN 'donated_premium' THEN 'GIFT'
    WHEN 'promotional' THEN 'PROMO'
    ELSE 'CODE'
  END;

  -- Generate codes
  FOR i IN 1..batch_size LOOP
    -- Generate unique random code like: PREM-ACME-A7K9M or BETA-WWF-A7K9M
    new_code := code_prefix || '-' || org_prefix || '-' ||
                UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT || i::TEXT), 1, 5));

    -- Insert the code
    INSERT INTO beta_invitation_codes (
      code,
      organization,
      code_type,
      premium_duration_months,
      purchaser_name,
      purchaser_email,
      purchase_amount,
      original_price,
      batch_id,
      created_by,
      expires_at,
      notes
    ) VALUES (
      new_code,
      organization_name,
      code_type,
      premium_duration_months,
      purchaser_name,
      purchaser_email,
      purchase_amount,
      original_price,
      current_batch_id,
      admin_user_id,
      expiration_date,
      batch_notes
    );

    RETURN QUERY SELECT new_code;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add columns to users table if they don't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS premium_source TEXT; -- 'beta_tester', 'bulk_premium', 'stripe', etc.

-- Create index on premium_until for expiration checks
CREATE INDEX IF NOT EXISTS idx_users_premium_until ON users(premium_until);

-- Function to check if premium is active (considers expiration)
CREATE OR REPLACE FUNCTION is_premium_active(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
BEGIN
  SELECT * INTO user_record
  FROM users
  WHERE id = check_user_id;

  IF user_record IS NULL THEN
    RETURN false;
  END IF;

  -- Beta testers always have premium
  IF user_record.role = 'beta_tester' THEN
    RETURN true;
  END IF;

  -- Active Stripe subscription
  IF user_record.stripe_subscription_status IN ('active', 'trialing') THEN
    RETURN true;
  END IF;

  -- Premium access via code (check expiration)
  IF user_record.is_premium = true THEN
    -- If premium_until is NULL, it's lifetime access
    IF user_record.premium_until IS NULL THEN
      RETURN true;
    END IF;

    -- If premium_until is in the future, still active
    IF user_record.premium_until > NOW() THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:

-- Generate 100 bulk premium codes (1 year) for Acme Corp
/*
SELECT * FROM generate_beta_codes(
  organization_name := 'Acme Corp',
  batch_size := 100,
  admin_user_id := 'your-admin-id'::UUID,
  expiration_date := NOW() + INTERVAL '2 years', -- Codes expire in 2 years
  batch_notes := 'Corporate bulk purchase - Invoice #12345',
  code_type := 'bulk_premium',
  premium_duration_months := 12, -- 1 year of premium
  purchaser_name := 'Acme Corp HR Department',
  purchaser_email := 'hr@acmecorp.com',
  purchase_amount := 500.00,
  original_price := 1200.00
);
*/

-- Generate 25 enterprise codes (lifetime premium)
/*
SELECT * FROM generate_beta_codes(
  organization_name := 'BigCompany Inc',
  batch_size := 25,
  admin_user_id := 'your-admin-id'::UUID,
  code_type := 'enterprise',
  premium_duration_months := NULL, -- Lifetime access
  purchaser_name := 'BigCompany Inc',
  purchaser_email := 'contact@bigcompany.com',
  purchase_amount := 250.00,
  original_price := 625.00,
  batch_notes := 'Enterprise tier - 25 for price of 10'
);
*/

-- Generate donated codes for charity
/*
SELECT * FROM generate_beta_codes(
  organization_name := 'Local School District',
  batch_size := 50,
  code_type := 'donated_premium',
  premium_duration_months := 12,
  purchaser_name := 'Anonymous Donor',
  purchaser_email := 'donor@email.com',
  purchase_amount := 200.00,
  batch_notes := 'Donated to students in need'
);
*/
