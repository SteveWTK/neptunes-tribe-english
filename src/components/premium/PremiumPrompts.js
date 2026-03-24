"use client";

import SpeciesCompanionUpgrade from "./SpeciesCompanionUpgrade";
import PremiumLessonModal from "./PremiumLessonModal";

/**
 * PremiumPrompts - Renders all premium upgrade CTA components.
 * Must be used within a PremiumUpgradeProvider context (provided by layout).
 *
 * CTAs included:
 * 1. SpeciesCompanionUpgrade - Species avatar speech bubble after 3+ lessons (for non-premium users)
 * 2. PremiumLessonModal - Modal shown when clicking locked premium content
 */
export default function PremiumPrompts() {
  return (
    <>
      {/* Species companion upgrade speech bubble */}
      <SpeciesCompanionUpgrade />

      {/* Premium lesson/adventure locked modal */}
      <PremiumLessonModal />
    </>
  );
}
