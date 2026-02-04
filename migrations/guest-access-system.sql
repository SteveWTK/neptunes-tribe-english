-- Guest Access System
-- QR Code Temporary Access for campaigns (botanical gardens, partnerships, marketing)
-- Creates temporary user accounts with timed premium access

-- ============================================================================
-- Table: guest_access_codes
-- One row per QR campaign/code. Each code can be used multiple times.
-- ============================================================================

CREATE TABLE IF NOT EXISTS guest_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,              -- Short unique code, e.g. "QR-A7K9M3B2"
  name TEXT NOT NULL,                     -- Admin-friendly name, e.g. "Rayong Garden Entry"
  destination_path TEXT DEFAULT '/dashboard', -- Where to redirect after activation
  access_tier TEXT DEFAULT 'premium'      -- What tier to grant
    CHECK (access_tier IN ('basic', 'premium', 'full')),
  duration_hours INTEGER DEFAULT 72,      -- How long guest access lasts
  max_uses INTEGER,                       -- NULL = unlimited uses
  current_uses INTEGER DEFAULT 0,         -- Tracks how many times code has been used
  campaign_name TEXT,                     -- For grouping/analytics, e.g. "rayong-botanical-2026"
  campaign_location TEXT,                 -- e.g. "Rayong Botanical Gardens, Thailand"
  welcome_message TEXT,                   -- Optional custom welcome shown on activation (English)
  welcome_message_pt TEXT,                -- Portuguese welcome message
  welcome_message_th TEXT,                -- Thai welcome message
  features_config JSONB DEFAULT '{}',     -- Future: restrict to specific features
  created_by UUID REFERENCES users(id),   -- Admin who created the code
  starts_at TIMESTAMPTZ DEFAULT NOW(),    -- When the code becomes active
  expires_at TIMESTAMPTZ,                 -- When the code itself stops working (NULL = never)
  is_active BOOLEAN DEFAULT true,         -- Manual toggle to deactivate
  metadata JSONB DEFAULT '{}',            -- Flexible extra data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guest_access_codes_code ON guest_access_codes(code);
CREATE INDEX IF NOT EXISTS idx_guest_access_codes_campaign ON guest_access_codes(campaign_name);
CREATE INDEX IF NOT EXISTS idx_guest_access_codes_active ON guest_access_codes(is_active, starts_at, expires_at);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_guest_access_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_guest_access_codes_updated_at
  BEFORE UPDATE ON guest_access_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_access_codes_updated_at();

-- ============================================================================
-- Table: guest_sessions
-- One row per guest activation. Links temporary user account to access code.
-- ============================================================================

CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_id UUID REFERENCES guest_access_codes(id),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- The temporary user account
  access_tier TEXT NOT NULL,
  destination_path TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,        -- When guest access expires
  converted_at TIMESTAMPTZ,               -- Set when guest creates a real account
  converted_to_email TEXT,                -- The real email they signed up with
  device_info JSONB DEFAULT '{}',         -- Browser/device for analytics
  ip_address TEXT,                        -- For analytics
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_guest_sessions_user ON guest_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_code ON guest_sessions(access_code_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_active ON guest_sessions(expires_at)
  WHERE converted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_guest_sessions_cleanup ON guest_sessions(expires_at, converted_at)
  WHERE converted_at IS NULL;

-- ============================================================================
-- RLS Policies
-- All access goes through server-side API routes using supabase-admin (service role)
-- ============================================================================

ALTER TABLE guest_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY "Service role full access on guest_access_codes"
  ON guest_access_codes FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on guest_sessions"
  ON guest_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RPC: activate_guest_code
-- Atomically validates a code and increments usage counter.
-- Uses SELECT FOR UPDATE to prevent race conditions.
-- ============================================================================

CREATE OR REPLACE FUNCTION activate_guest_code(
  p_code TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_code_record RECORD;
BEGIN
  -- Lock the row for update to prevent race conditions on current_uses
  SELECT * INTO v_code_record
  FROM guest_access_codes
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  -- Validate: code exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code not found');
  END IF;

  -- Validate: code is active
  IF NOT v_code_record.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code is deactivated');
  END IF;

  -- Validate: code has started
  IF v_code_record.starts_at > NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code is not yet active');
  END IF;

  -- Validate: code has not expired
  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code has expired');
  END IF;

  -- Validate: code has not reached max uses
  IF v_code_record.max_uses IS NOT NULL AND v_code_record.current_uses >= v_code_record.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code has reached maximum uses');
  END IF;

  -- Increment usage count
  UPDATE guest_access_codes
  SET current_uses = current_uses + 1
  WHERE id = v_code_record.id;

  -- Return code configuration
  RETURN jsonb_build_object(
    'success', true,
    'code_id', v_code_record.id,
    'destination_path', v_code_record.destination_path,
    'access_tier', v_code_record.access_tier,
    'duration_hours', v_code_record.duration_hours,
    'name', v_code_record.name,
    'welcome_message', v_code_record.welcome_message,
    'welcome_message_pt', v_code_record.welcome_message_pt,
    'welcome_message_th', v_code_record.welcome_message_th,
    'campaign_name', v_code_record.campaign_name,
    'campaign_location', v_code_record.campaign_location
  );
END;
$$ LANGUAGE plpgsql;
