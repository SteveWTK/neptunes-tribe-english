/**
 * Brand Configuration for Habitat
 *
 * This file centralizes all brand-specific settings that differ between
 * cloned applications (Habitat, StartupNation, FieldTalk, etc.)
 *
 * When cloning to a new app, duplicate this file and modify all values
 * to match the new brand identity.
 */

export const brandConfig = {
  // ============================================
  // APP IDENTITY
  // ============================================
  appName: "Habitat",
  appTagline: "Learn English Through Environmental Action",
  appDescription: "Master English while exploring the world's most incredible ecosystems and conservation heroes.",
  domain: "https://habitatenglish.com",

  // ============================================
  // BRANDING & VISUALS
  // ============================================
  logo: {
    // Paths relative to /public folder
    main: "/logos/Habitat-wide-lm.png",             // Main logo (light mode)
    mainDark: "/logos/Habitat-wide-dm-white.png",   // Main logo (dark mode)
    square: "/logos/Habitat-square-light.png",       // Square logo for mobile
    squareDark: "/logos/Habitat-square-dark.png",    // Square logo dark mode
    favicon: "/logos/neptunes-tribe-favicon.png",    // Favicon
    // Landing page hero images
    landingHero: "/landing/Habitat-landing-mobile-5-lm.png",
    landingHeroMobile: "/landing/Habitat-landing-mobile-5.png",
  },

  // Tailwind color system - matches tailwind.config.mjs
  colors: {
    primary: {
      50: "#E1E8EF",
      100: "#D4DEE7",
      200: "#B7C7D7",
      300: "#99B0C7",
      400: "#7C99B6",
      500: "#5E82A6",  // Main primary color
      600: "#4C6B8A",
      700: "#3C546C",
      800: "#2C3D4F",
      900: "#1B2631",
      950: "#141C24",
    },
    accent: {
      50: "#FAF5F0",
      100: "#F4ECE1",
      200: "#E8D6BF",
      300: "#DDC2A2",
      400: "#D2AF84",
      500: "#C69963",  // Main accent color
      600: "#B78343",
      700: "#926835",
      800: "#6C4D28",
      900: "#4B351B",
      950: "#382814",
    },
  },

  // Fonts (defined in layout)
  fonts: {
    heading: "var(--font-orbitron-slab)",  // For headings
    body: "var(--font-roboto)",            // For body text
    accent: "var(--font-josefin-sans)",    // For special text
  },

  // ============================================
  // CONTENT TERMINOLOGY
  // ============================================
  // These terms appear throughout the UI
  terminology: {
    // Main content structure
    mainUnit: "Learning Unit",
    world: "World",
    adventure: "Adventure",
    lesson: "Learning Activity",

    // Gamification
    hero: "Conservation Hero",
    achievement: "Impact",
    badge: "Achievement Badge",

    // Community
    community: "Tribe",
    member: "Tribe Member",

    // Progress
    journey: "Learning Journey",
    level: "Level",
    points: "Points",
    streak: "Learning Streak",

    // Map feature
    map: "Eco-Map",
    mapDescription: "Explore ecosystems around the world",
  },

  // ============================================
  // CONTENT STRUCTURE
  // ============================================
  // Defines the main organizational structure of learning content
  contentStructure: {
    // Using worldsConfig.js - 7 Worlds with 4 Adventures each
    useWorlds: true,
    worldsConfigPath: "@/data/worldsConfig",

    // Featured World (changes monthly/quarterly)
    // Regular users only see units from this world
    // Platform admins see all units regardless
    featuredWorld: "south_america", // Options: south_america, africa, eurasia, oceania, polar_regions, north_america, the_oceans, lost_worlds

    // Alternative: Topic-based structure (for business/sports apps)
    // useTopics: true,
    // topicsConfigPath: "@/data/topicsConfig",
  },

  // ============================================
  // FEATURES & FUNCTIONALITY
  // ============================================
  features: {
    // Core features
    weeklyThemes: true,
    conversationClasses: false,  // Not yet implemented
    liveEvents: false,

    // Social features
    communityForum: false,
    userProfiles: true,
    leaderboards: false,

    // Content features
    translations: true,
    audioSupport: true,
    videoSupport: false,
    downloadableContent: false,

    // Gamification
    progressTracking: true,
    achievements: true,
    streaks: true,
    levels: true,

    // Map feature
    interactiveMap: true,
    worldExploration: true,

    // Assessment
    aiAssessment: true,
    manualReview: false,

    // Charity/Impact (Habitat-specific)
    ngoSupport: true,
    impactTracking: true,
    donationIntegration: true,
  },

  // ============================================
  // SUBSCRIPTION TIERS
  // ============================================
  // Customize tier names and benefits
  tiers: {
    free: {
      name: "Explorer",
      displayName: "Explorer",
      icon: "🌱",
      color: "#10b981",
      description: "Start your learning journey",
    },
    premium: {
      name: "Premium",
      displayName: "Premium Adventurer",
      icon: "🌟",
      color: "#3b82f6",
      description: "Full access to all content",
    },
    enterprise: {
      name: "Enterprise",
      displayName: "Enterprise Guardian",
      icon: "👑",
      color: "#8b5cf6",
      description: "For schools and organizations",
    },
  },

  // ============================================
  // SUPPORTED LANGUAGES
  // ============================================
  languages: {
    default: "en",
    supported: [
      { code: "en", name: "English", flag: "🇬🇧" },
      { code: "pt", name: "Português", flag: "🇧🇷" },
      { code: "es", name: "Español", flag: "🇪🇸" },
    ],
  },

  // ============================================
  // SOCIAL & EXTERNAL LINKS
  // ============================================
  social: {
    instagram: "https://instagram.com/neptunestribe",
    facebook: null,
    twitter: null,
    linkedin: null,
    youtube: null,
  },

  // NGO Partners (Habitat-specific)
  ngoPartners: [
    {
      name: "Rainforest Alliance",
      logo: "/partners/rainforest-alliance.png",
      url: "https://www.rainforest-alliance.org/",
    },
    // Add more as needed
  ],

  // ============================================
  // SEO & METADATA
  // ============================================
  seo: {
    defaultTitle: "Habitat - Learn English Through Environmental Action",
    titleTemplate: "%s | Habitat",
    defaultDescription: "Master English while exploring the world's most incredible ecosystems and conservation heroes. Interactive lessons, real-world impact.",
    keywords: ["English learning", "environmental education", "conservation", "language learning", "ESL", "ecology"],
    ogImage: "/og-image.png",
    twitterHandle: "@habitatenglish",
  },

  // ============================================
  // ONBOARDING
  // ============================================
  onboarding: {
    enabled: true,
    steps: [
      {
        target: ".welcome-tour",
        title: "Welcome to Habitat!",
        content: "Discover how to learn English through environmental conservation.",
      },
      // Add more onboarding steps as needed
    ],
  },

  // ============================================
  // ANALYTICS & TRACKING
  // ============================================
  analytics: {
    googleAnalyticsId: null,  // Add your GA4 ID
    mixpanelToken: null,
    hotjarId: null,
  },

  // ============================================
  // CONTACT & SUPPORT
  // ============================================
  support: {
    email: "support@habitatenglish.com",
    helpCenterUrl: null,
    chatWidget: false,
  },
};

// Helper function to get color value by path (e.g., "primary.500")
export function getColor(path) {
  const parts = path.split(".");
  let value = brandConfig.colors;
  for (const part of parts) {
    value = value?.[part];
  }
  return value || "#000000";
}

// Helper to check if a feature is enabled
export function isFeatureEnabled(featureName) {
  return brandConfig.features[featureName] === true;
}

// Export default for easy imports
export default brandConfig;
