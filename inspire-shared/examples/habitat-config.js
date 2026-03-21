/**
 * Example inspire.config.js for Habitat English (Neptune's Tribe)
 * Place this file as inspire.config.js in your app's root directory
 */
export const inspireConfig = {
  appName: "Neptune's Tribe English",
  theme: "nature",

  branding: {
    tagline: "Learn English for Conservation",
    logo: "/images/logo.png",
    favicon: "/favicon.ico",
  },

  // Content pins configuration (observations)
  contentPins: {
    singular: "observation",
    plural: "observations",
    description: "Wildlife and nature observations",
    userCreatedContent: true,
    fields: [
      { name: "species", type: "text", required: true, label: "Species Name" },
      { name: "location", type: "location", required: true, label: "Location" },
      { name: "date", type: "date", required: true, label: "Date Observed" },
      { name: "description", type: "textarea", required: false, label: "Notes" },
      { name: "photo", type: "image", required: false, label: "Photo" },
    ],
    enableAI: true,
    aiFeatures: ["species-identification", "habitat-info"],
  },

  // Map configuration
  map: {
    defaultCenter: [-43.1729, -22.9068], // Rio de Janeiro
    defaultZoom: 10,
    autoLocate: true,
  },

  // Feature flags
  features: {
    darkMode: true,
    multiLanguage: true,
    feedback: true,
    betaCodes: true,
    premiumContent: true,
    gamification: true,
    observations: true,
    community: true,
  },

  // Supported languages
  languages: ["en", "pt"],
  defaultLanguage: "pt",
};
