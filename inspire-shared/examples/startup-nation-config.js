/**
 * Example inspire.config.js for Startup Nation
 * Place this file as inspire.config.js in your app's root directory
 */
export const inspireConfig = {
  appName: "Startup Nation English",
  theme: "business",

  branding: {
    tagline: "English for Entrepreneurs",
    logo: "/images/logo.png",
    favicon: "/favicon.ico",
  },

  // Content pins configuration (case studies)
  contentPins: {
    singular: "case study",
    plural: "case studies",
    description: "Business success stories and startup journeys",
    userCreatedContent: true,
    fields: [
      { name: "company", type: "text", required: true, label: "Company Name" },
      { name: "industry", type: "select", required: true, label: "Industry", options: ["Tech", "Finance", "Healthcare", "E-commerce", "Other"] },
      { name: "location", type: "location", required: true, label: "Headquarters" },
      { name: "founded", type: "date", required: false, label: "Founded" },
      { name: "story", type: "textarea", required: true, label: "Success Story" },
      { name: "logo", type: "image", required: false, label: "Company Logo" },
    ],
    enableAI: true,
    aiFeatures: ["business-vocabulary", "pitch-analysis"],
  },

  // Map configuration
  map: {
    defaultCenter: [34.7818, 32.0853], // Tel Aviv (startup hub)
    defaultZoom: 6,
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
    observations: false, // Called "case studies" instead
    caseStudies: true,
    community: true,
    pitchPractice: true,
  },

  // Supported languages
  languages: ["en", "pt", "he"],
  defaultLanguage: "en",
};
