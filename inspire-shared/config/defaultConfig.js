/**
 * Default configuration for INSPIRE apps
 * Apps should override this with their own inspire.config.js
 */

export const defaultConfig = {
  // App identity
  appName: "INSPIRE English",
  appSlug: "inspire-english",
  theme: "nature", // References themes.js

  // Branding
  branding: {
    logo: "/logo.svg",
    favicon: "/favicon.ico",
    tagline: "Learn English Through Real-World Content",
  },

  // Content pins (observations, case studies, etc.)
  contentPins: {
    enabled: true,
    singular: "pin",
    plural: "pins",
    icon: "MapPin",

    // Whether users can create their own content
    userCreatedContent: true,

    // Fields for creating new pins (customizable per app)
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: false },
      { name: "photo", label: "Photo", type: "image", required: true },
    ],

    // AI features (like species identification for Habitat)
    enableAI: false,
    aiEndpoint: null,
  },

  // Map configuration
  map: {
    defaultCenter: [0, 20], // World view
    defaultZoom: 2,
    style: "mapbox://styles/mapbox/outdoors-v12",
    // Whether to auto-detect user location
    autoLocate: true,
  },

  // Feature flags
  features: {
    darkMode: true,
    multiLanguage: true,
    feedback: true,
    leaderboard: true,
    premium: true,
    games: true,
    lessons: true,
  },

  // Supported languages
  languages: [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
  ],
};

export default defaultConfig;
