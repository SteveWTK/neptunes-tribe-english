"use client";

/**
 * useAffiliateAttribution Hook
 *
 * A React hook for accessing and managing affiliate attribution data.
 *
 * Usage:
 *   import { useAffiliateAttribution } from '@inspire/shared';
 *
 *   function CheckoutButton() {
 *     const { attribution, hasAttribution, stripeMetadata, clearAttribution } = useAffiliateAttribution();
 *
 *     const handleCheckout = async () => {
 *       // Pass stripeMetadata to your checkout API
 *       await fetch('/api/checkout', {
 *         method: 'POST',
 *         body: JSON.stringify({
 *           priceId: 'price_xxx',
 *           ...stripeMetadata,
 *         }),
 *       });
 *     };
 *
 *     return (
 *       <button onClick={handleCheckout}>
 *         {hasAttribution && <span>Referred by partner!</span>}
 *         Subscribe
 *       </button>
 *     );
 *   }
 */

import { useState, useEffect, useCallback } from "react";
import {
  getAttribution,
  clearAttribution as clearAttr,
  getStripeAffiliateMetadata,
  hasAttribution as checkHasAttribution,
  storeAttribution,
} from "./affiliateUtils";

export default function useAffiliateAttribution() {
  const [attribution, setAttribution] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load attribution on mount
  useEffect(() => {
    const loadAttribution = () => {
      const attr = getAttribution();
      setAttribution(attr);
      setIsLoading(false);
    };

    loadAttribution();

    // Also listen for storage events (in case attribution is set in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'inspire_affiliate') {
        loadAttribution();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  // Clear attribution
  const clearAttribution = useCallback(() => {
    clearAttr();
    setAttribution(null);
  }, []);

  // Manually set attribution (for testing or manual override)
  const setManualAttribution = useCallback((code, days = 90) => {
    const attr = storeAttribution(code, days);
    setAttribution(attr);
    return attr;
  }, []);

  // Refresh attribution from storage
  const refreshAttribution = useCallback(() => {
    const attr = getAttribution();
    setAttribution(attr);
    return attr;
  }, []);

  return {
    // Current attribution data (or null if none)
    attribution,

    // Whether there's active attribution
    hasAttribution: attribution !== null,

    // Whether we're still loading
    isLoading,

    // The referral code (convenience accessor)
    referralCode: attribution?.code || null,

    // Stripe metadata ready to pass to checkout
    stripeMetadata: attribution ? getStripeAffiliateMetadata() : {},

    // Time remaining on attribution (in ms, or null if no expiry)
    timeRemaining: attribution?.expires
      ? Math.max(0, attribution.expires - Date.now())
      : null,

    // Days remaining on attribution
    daysRemaining: attribution?.expires
      ? Math.max(0, Math.ceil((attribution.expires - Date.now()) / (24 * 60 * 60 * 1000)))
      : null,

    // Actions
    clearAttribution,
    setManualAttribution,
    refreshAttribution,
  };
}
