/**
 * Premium Configuration
 *
 * Centralized configuration for premium-related settings.
 * Edit these values to update messaging across all premium CTAs.
 */

// Percentage of premium revenue donated to environmental NGOs
// This is displayed in upgrade CTAs to encourage conservation-minded upgrades
export const NGO_DONATION_PERCENTAGE = 10;

// Premium pricing (for display purposes - actual pricing managed by payment provider)
export const PREMIUM_PRICING = {
  monthly: {
    amount: 9.99,
    currency: "USD",
    period: "month",
  },
  yearly: {
    amount: 79.99,
    currency: "USD",
    period: "year",
    savings: "33%",
  },
};

// Premium features for marketing
export const PREMIUM_FEATURES = [
  "Access all adventures and lessons",
  "Save unlimited species",
  "Exclusive conservation content",
  // "Ad-free experience",
  "Support real conservation efforts",
];
