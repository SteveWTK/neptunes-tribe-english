import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Check if a user has premium access
 * Premium access is granted to:
 * 1. Beta testers (role = 'beta_tester')
 * 2. Active subscribers (stripe_subscription_status = 'active' or 'trialing')
 *
 * @param {string} userEmail - User's email address
 * @returns {Promise<{hasPremiumAccess: boolean, isBetaTester: boolean, isPremium: boolean}>}
 */
export async function checkPremiumAccess(userEmail) {
  try {
    const supabase = await getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, role, stripe_subscription_status")
      .eq("email", userEmail)
      .single();

    if (error || !user) {
      return {
        hasPremiumAccess: false,
        isBetaTester: false,
        isPremium: false,
      };
    }

    const isBetaTester = user.role === "beta_tester";
    const isPremium =
      user.stripe_subscription_status === "active" ||
      user.stripe_subscription_status === "trialing";

    return {
      hasPremiumAccess: isBetaTester || isPremium,
      isBetaTester,
      isPremium,
    };
  } catch (error) {
    console.error("Error checking premium access:", error);
    return {
      hasPremiumAccess: false,
      isBetaTester: false,
      isPremium: false,
    };
  }
}

/**
 * Check if a user is a beta tester
 * @param {string} userEmail - User's email address
 * @returns {Promise<boolean>}
 */
export async function isBetaTester(userEmail) {
  const { isBetaTester } = await checkPremiumAccess(userEmail);
  return isBetaTester;
}
