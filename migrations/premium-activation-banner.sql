-- Migration: Premium Activation Banner System
-- This enables QR campaigns to indicate that guests should activate premium after account creation

-- Add column to track if a QR campaign includes a premium code for users to activate
ALTER TABLE guest_access_codes
ADD COLUMN IF NOT EXISTS includes_premium_code BOOLEAN DEFAULT FALSE;

-- Add column to users table to track pending premium activation
-- This flag is set when a guest from a premium-code campaign creates an account
ALTER TABLE users
ADD COLUMN IF NOT EXISTS pending_premium_activation BOOLEAN DEFAULT FALSE;

-- Optional: Add premium_code field to store the actual code they should use
-- (if you want to provide a specific code to each campaign)
ALTER TABLE guest_access_codes
ADD COLUMN IF NOT EXISTS premium_code TEXT;

-- Comment explaining the flow:
-- 1. Admin creates QR campaign with includes_premium_code = true (and optionally a specific premium_code)
-- 2. Guest uses QR code, explores the app
-- 3. When guest creates an account, if their session came from a campaign with includes_premium_code = true:
--    - Set pending_premium_activation = true on the new user
--    - Optionally store which premium code they should use
-- 4. User sees PremiumActivationBanner prompting them to go to /activate-premium
-- 5. After successful premium activation, set pending_premium_activation = false
