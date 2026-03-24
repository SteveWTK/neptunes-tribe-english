-- Premium Upgrades Tracking
-- Audit table to track when users upgrade to premium, enabling accurate metrics
-- on conversion rates and the effectiveness of premium CTAs.

-- ============================================================================
-- Table: premium_upgrades
-- Records each premium upgrade event with context for analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS premium_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Upgrade details
  upgrade_type TEXT NOT NULL DEFAULT 'new'
    CHECK (upgrade_type IN ('new', 'renewal', 'reactivation')),

  -- What triggered the upgrade (for measuring CTA effectiveness)
  source TEXT DEFAULT 'unknown'
    CHECK (source IN (
      'unknown',
      'subscription_page',      -- Direct from /subscriptions
      'premium_lesson_modal',   -- Clicked upgrade from locked lesson modal
      'species_companion_cta',  -- Clicked upgrade from species companion prompt
      'guest_conversion',       -- Upgraded during guest-to-user conversion
      'qr_campaign',            -- Started as QR guest, then upgraded
      'marketing_email',        -- From email campaign link
      'referral',               -- From referral/affiliate link
      'admin_grant'             -- Manually granted by admin
    )),

  -- Plan details (for future use with different pricing tiers)
  plan_type TEXT DEFAULT 'premium'
    CHECK (plan_type IN ('premium', 'premium_yearly', 'premium_monthly', 'lifetime')),

  -- Previous state (for tracking conversion funnel)
  previous_state TEXT DEFAULT 'registered'
    CHECK (previous_state IN ('guest', 'registered', 'expired_premium')),

  -- Was this user originally a QR guest? (important for campaign ROI)
  was_qr_guest BOOLEAN DEFAULT false,
  qr_campaign_id UUID REFERENCES guest_access_codes(id),

  -- Timestamps
  upgraded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_premium_upgrades_user ON premium_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_upgrades_date ON premium_upgrades(upgraded_at);
CREATE INDEX IF NOT EXISTS idx_premium_upgrades_source ON premium_upgrades(source);
CREATE INDEX IF NOT EXISTS idx_premium_upgrades_campaign ON premium_upgrades(qr_campaign_id)
  WHERE qr_campaign_id IS NOT NULL;

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE premium_upgrades ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for API routes)
CREATE POLICY "Service role full access on premium_upgrades"
  ON premium_upgrades FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- Function: record_premium_upgrade
-- Call this when a user upgrades to premium to create an audit record
-- ============================================================================

CREATE OR REPLACE FUNCTION record_premium_upgrade(
  p_user_id UUID,
  p_source TEXT DEFAULT 'unknown',
  p_plan_type TEXT DEFAULT 'premium',
  p_previous_state TEXT DEFAULT 'registered'
)
RETURNS UUID AS $$
DECLARE
  v_upgrade_id UUID;
  v_was_qr_guest BOOLEAN := false;
  v_qr_campaign_id UUID := NULL;
  v_upgrade_type TEXT := 'new';
BEGIN
  -- Check if user was a QR guest
  SELECT
    TRUE,
    gs.access_code_id
  INTO v_was_qr_guest, v_qr_campaign_id
  FROM guest_sessions gs
  WHERE gs.user_id = p_user_id
  LIMIT 1;

  -- Check if this is a renewal/reactivation
  IF EXISTS (
    SELECT 1 FROM premium_upgrades WHERE user_id = p_user_id
  ) THEN
    v_upgrade_type := 'renewal';
  END IF;

  -- Insert the upgrade record
  INSERT INTO premium_upgrades (
    user_id,
    upgrade_type,
    source,
    plan_type,
    previous_state,
    was_qr_guest,
    qr_campaign_id
  ) VALUES (
    p_user_id,
    v_upgrade_type,
    p_source,
    p_plan_type,
    p_previous_state,
    COALESCE(v_was_qr_guest, false),
    v_qr_campaign_id
  )
  RETURNING id INTO v_upgrade_id;

  RETURN v_upgrade_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Trigger: Auto-record upgrade when is_premium changes to true
-- This ensures upgrades are tracked even if the function isn't called directly
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_record_premium_upgrade()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when is_premium changes from false/null to true
  IF (OLD.is_premium IS DISTINCT FROM true) AND (NEW.is_premium = true) THEN
    -- Determine previous state
    DECLARE
      v_previous_state TEXT := 'registered';
    BEGIN
      IF OLD.role = 'guest' THEN
        v_previous_state := 'guest';
      ELSIF EXISTS (SELECT 1 FROM premium_upgrades WHERE user_id = NEW.id) THEN
        v_previous_state := 'expired_premium';
      END IF;

      PERFORM record_premium_upgrade(
        NEW.id,
        'unknown',  -- Source unknown when triggered automatically
        'premium',
        v_previous_state
      );
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_premium_upgrade_tracking ON users;
CREATE TRIGGER trigger_premium_upgrade_tracking
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_record_premium_upgrade();

-- ============================================================================
-- View: premium_upgrade_stats
-- Convenient view for dashboard queries
-- ============================================================================

CREATE OR REPLACE VIEW premium_upgrade_stats AS
SELECT
  pu.id,
  pu.user_id,
  u.email,
  u.name,
  pu.upgrade_type,
  pu.source,
  pu.plan_type,
  pu.previous_state,
  pu.was_qr_guest,
  gac.name as qr_campaign_name,
  gac.campaign_location as qr_campaign_location,
  pu.upgraded_at,
  pu.created_at
FROM premium_upgrades pu
JOIN users u ON u.id = pu.user_id
LEFT JOIN guest_access_codes gac ON gac.id = pu.qr_campaign_id;
