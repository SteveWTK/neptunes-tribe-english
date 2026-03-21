/**
 * Affiliate Tracking Utilities
 *
 * Provider-agnostic utilities for affiliate tracking.
 * Works with Rewardful, FirstPromoter, or custom implementations.
 */

// Cookie names - Rewardful uses these by default
export const COOKIE_NAMES = {
  REFERRAL_CODE: 'rewardful.referral',
  REFERRAL_ID: 'rewardful.affiliate',
  CUSTOM_REFERRAL: 'inspire_affiliate_code',
};

// Query parameter names to check for referral codes
export const REFERRAL_PARAMS = ['via', 'ref', 'affiliate', 'referral'];

// Default attribution window in days
export const DEFAULT_ATTRIBUTION_DAYS = 90;

/**
 * Set a cookie with expiration
 */
export function setCookie(name, value, days = DEFAULT_ATTRIBUTION_DAYS) {
  if (typeof document === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  // Set cookie with SameSite=Lax for cross-site tracking compatibility
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return null;

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

/**
 * Remove a cookie
 */
export function removeCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

/**
 * Extract referral code from URL query parameters
 */
export function getReferralFromURL(url = null) {
  if (typeof window === 'undefined' && !url) return null;

  const searchParams = url
    ? new URL(url).searchParams
    : new URLSearchParams(window.location.search);

  for (const param of REFERRAL_PARAMS) {
    const value = searchParams.get(param);
    if (value) {
      return {
        code: value,
        param: param,
        timestamp: Date.now(),
      };
    }
  }
  return null;
}

/**
 * Store affiliate attribution in cookies and localStorage
 */
export function storeAttribution(referralCode, days = DEFAULT_ATTRIBUTION_DAYS) {
  if (!referralCode) return;

  const attribution = {
    code: referralCode,
    timestamp: Date.now(),
    expires: Date.now() + days * 24 * 60 * 60 * 1000,
  };

  // Set cookies (for Rewardful JS and server-side access)
  setCookie(COOKIE_NAMES.CUSTOM_REFERRAL, referralCode, days);
  setCookie(COOKIE_NAMES.REFERRAL_CODE, referralCode, days);

  // Also store in localStorage for client-side access
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('inspire_affiliate', JSON.stringify(attribution));
  }

  return attribution;
}

/**
 * Get current affiliate attribution
 */
export function getAttribution() {
  // Try localStorage first (more reliable, has expiry info)
  if (typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem('inspire_affiliate');
      if (stored) {
        const attribution = JSON.parse(stored);
        // Check if expired
        if (attribution.expires && attribution.expires > Date.now()) {
          return attribution;
        } else {
          // Clean up expired attribution
          localStorage.removeItem('inspire_affiliate');
        }
      }
    } catch (e) {
      console.warn('Error reading affiliate attribution from localStorage:', e);
    }
  }

  // Fall back to cookie
  const cookieCode = getCookie(COOKIE_NAMES.CUSTOM_REFERRAL) || getCookie(COOKIE_NAMES.REFERRAL_CODE);
  if (cookieCode) {
    return {
      code: cookieCode,
      timestamp: null,
      expires: null,
    };
  }

  return null;
}

/**
 * Clear all affiliate attribution
 */
export function clearAttribution() {
  removeCookie(COOKIE_NAMES.CUSTOM_REFERRAL);
  removeCookie(COOKIE_NAMES.REFERRAL_CODE);
  removeCookie(COOKIE_NAMES.REFERRAL_ID);

  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('inspire_affiliate');
  }
}

/**
 * Check if user has active affiliate attribution
 */
export function hasAttribution() {
  return getAttribution() !== null;
}

/**
 * Get Stripe checkout metadata for affiliate tracking
 * Pass this to your Stripe checkout session creation
 */
export function getStripeAffiliateMetadata() {
  const attribution = getAttribution();

  if (!attribution) return {};

  return {
    rewardful_referral: attribution.code,
    affiliate_code: attribution.code,
    affiliate_attributed_at: attribution.timestamp
      ? new Date(attribution.timestamp).toISOString()
      : null,
  };
}

/**
 * Build affiliate URL for sharing
 */
export function buildAffiliateURL(baseUrl, affiliateCode, param = 'via') {
  const url = new URL(baseUrl);
  url.searchParams.set(param, affiliateCode);
  return url.toString();
}
