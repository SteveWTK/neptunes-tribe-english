/**
 * Example inspire.config.js for FieldTalk English
 * Place this file as inspire.config.js in your app's root directory
 */
export const inspireConfig = {
  appName: "FieldTalk English",
  theme: "sports",

  branding: {
    tagline: "English for Football Professionals",
    logo: "/images/logo.png",
    favicon: "/favicon.ico",
  },

  // Content pins configuration (football clubs)
  contentPins: {
    singular: "club",
    plural: "clubs",
    description: "Football clubs and stadiums around the world",
    userCreatedContent: false, // Curated content only
    fields: [
      { name: "clubName", type: "text", required: true, label: "Club Name" },
      { name: "stadium", type: "text", required: true, label: "Stadium" },
      { name: "location", type: "location", required: true, label: "Location" },
      { name: "league", type: "text", required: true, label: "League" },
      { name: "founded", type: "date", required: false, label: "Founded" },
      { name: "description", type: "textarea", required: false, label: "Club History" },
      { name: "badge", type: "image", required: false, label: "Club Badge" },
    ],
    enableAI: true,
    aiFeatures: ["football-vocabulary", "match-commentary"],
  },

  // Map configuration
  map: {
    defaultCenter: [-3.7038, 40.4168], // Madrid (football hub)
    defaultZoom: 4,
    autoLocate: false, // Show clubs by default, not user location
  },

  // Feature flags
  features: {
    darkMode: true,
    multiLanguage: true,
    feedback: true,
    betaCodes: true,
    premiumContent: true,
    gamification: true,
    observations: false,
    clubs: true,
    community: true,
    matchSimulator: true,
  },

  // Supported languages
  languages: ["en", "pt", "es"],
  defaultLanguage: "en",
};
