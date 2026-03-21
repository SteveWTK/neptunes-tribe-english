/**
 * Affiliate Tracking Module
 *
 * Provides components, hooks, and utilities for affiliate marketing tracking.
 * Designed to work with Rewardful, FirstPromoter, or custom implementations.
 *
 * Quick Start:
 *
 * 1. Add AffiliateTracker to your root layout:
 *    import { AffiliateTracker } from '@inspire/shared';
 *    <AffiliateTracker attributionDays={90} />
 *
 * 2. Use the hook in checkout flows:
 *    import { useAffiliateAttribution } from '@inspire/shared';
 *    const { stripeMetadata, hasAttribution } = useAffiliateAttribution();
 *
 * 3. Pass metadata to Stripe checkout:
 *    const session = await stripe.checkout.sessions.create({
 *      ...config,
 *      metadata: stripeMetadata,
 *    });
 */

// Components
export { default as AffiliateTracker } from './AffiliateTracker';

// Hooks
export { default as useAffiliateAttribution } from './useAffiliateAttribution';

// Utilities
export {
  // Cookie/storage utilities
  setCookie,
  getCookie,
  removeCookie,

  // Attribution management
  storeAttribution,
  getAttribution,
  clearAttribution,
  hasAttribution,

  // URL utilities
  getReferralFromURL,
  buildAffiliateURL,

  // Stripe integration
  getStripeAffiliateMetadata,

  // Constants
  COOKIE_NAMES,
  REFERRAL_PARAMS,
  DEFAULT_ATTRIBUTION_DAYS,
} from './affiliateUtils';
