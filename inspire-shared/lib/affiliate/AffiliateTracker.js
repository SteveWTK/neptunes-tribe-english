"use client";

/**
 * AffiliateTracker Component
 *
 * A client-side component that automatically captures affiliate referral codes
 * from URL parameters and stores them for attribution tracking.
 *
 * Usage:
 *   // In your root layout or app component
 *   import { AffiliateTracker } from '@inspire/shared';
 *
 *   <AffiliateTracker
 *     attributionDays={90}
 *     onCapture={(code) => console.log('Captured referral:', code)}
 *   />
 *
 * Supports URL patterns:
 *   - ?via=CODE (Rewardful default)
 *   - ?ref=CODE
 *   - ?affiliate=CODE
 *   - ?referral=CODE
 */

import { useEffect, useRef } from "react";
import {
  getReferralFromURL,
  storeAttribution,
  getAttribution,
  DEFAULT_ATTRIBUTION_DAYS,
} from "./affiliateUtils";

export default function AffiliateTracker({
  attributionDays = DEFAULT_ATTRIBUTION_DAYS,
  onCapture = null,
  overwriteExisting = false,
  debug = false,
}) {
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run once per page load
    if (hasRun.current) return;
    hasRun.current = true;

    // Check for referral code in URL
    const referral = getReferralFromURL();

    if (referral) {
      // Check if we should overwrite existing attribution
      const existing = getAttribution();

      if (!existing || overwriteExisting) {
        if (debug) {
          console.log('[AffiliateTracker] Captured referral:', referral);
        }

        // Store the attribution
        storeAttribution(referral.code, attributionDays);

        // Call the callback if provided
        if (onCapture && typeof onCapture === 'function') {
          onCapture(referral.code, referral);
        }

        // Clean the URL (remove referral params) for cleaner sharing
        // Only if browser supports replaceState
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          const url = new URL(window.location.href);
          url.searchParams.delete(referral.param);

          // Only replace if we actually removed something
          if (url.toString() !== window.location.href) {
            window.history.replaceState({}, '', url.toString());
          }
        }
      } else if (debug) {
        console.log('[AffiliateTracker] Existing attribution found, not overwriting:', existing);
      }
    } else if (debug) {
      const existing = getAttribution();
      if (existing) {
        console.log('[AffiliateTracker] No new referral, existing attribution:', existing);
      } else {
        console.log('[AffiliateTracker] No referral code found');
      }
    }
  }, [attributionDays, onCapture, overwriteExisting, debug]);

  // This component renders nothing
  return null;
}
