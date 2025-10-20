/**
 * Snake Game Theme Configurations
 *
 * Each game variant has a sequence of level themes.
 * Each theme defines the vocabulary and visual styling for that level.
 */

// Individual theme definitions
const THEME_LIBRARY = {
  heroes_villains: {
    label: "Heroes & Villains",
    bg: "#e386d0",
    trashWords: ["Trump", "Musk", "Farage", "Robinson", "Cruz"],
    natureWords: [
      "Borboroglu",
      "Farhan",
      "Medici",
      "Basabose",
      "Mendes",
      "Godall",
      "Marina",
    ],
    trashClass: "bg-gray-500",
    natureClass: "bg-lime-700",
    blindClass: "bg-indigo-900",
  },
  beach: {
    label: "Beach",
    bg: "#e3e286",
    trashWords: ["can", "plastic", "bag", "wrapper", "bottle", "straw", "cup"],
    natureWords: ["turtle", "shell", "starfish", "seaweed", "crab", "dune"],
    trashClass: "bg-red-500",
    natureClass: "bg-blue-700",
    blindClass: "bg-purple-700",
  },
  field: {
    label: "Field",
    bg: "#d9f5cc",
    trashWords: ["packet", "foil", "straw", "cup", "lid", "wrapper"],
    natureWords: ["bee", "flower", "clover", "butterfly", "ladybird"],
    trashClass: "bg-orange-500",
    natureClass: "bg-emerald-700",
    blindClass: "bg-purple-700",
  },
  forest: {
    label: "Forest",
    bg: "#cde3c1",
    trashWords: ["can", "bottle", "plastic", "bag", "foil"],
    natureWords: ["mushroom", "moss", "fern", "owl", "deer"],
    trashClass: "bg-rose-500",
    natureClass: "bg-green-800",
    blindClass: "bg-purple-700",
  },
  ocean: {
    label: "Ocean",
    bg: "#189ef1",
    trashWords: ["plastic", "net", "wrapper", "oil", "straw"],
    natureWords: ["stingray", "whale", "octopus", "vaquita", "turtle"],
    trashClass: "bg-slate-500",
    natureClass: "bg-indigo-800",
    blindClass: "bg-purple-700",
  },
  polar: {
    label: "Polar",
    bg: "#a8b8c2",
    trashWords: ["plastic", "net", "wrapper", "oil", "straw"],
    natureWords: [
      "penguin",
      "walrus",
      "seal",
      "beluga",
      "arctic fox",
      "polar bear",
    ],
    trashClass: "bg-slate-500",
    natureClass: "bg-indigo-800",
    blindClass: "bg-purple-700",
  },
  rainforest: {
    label: "Rainforest",
    bg: "#2d5016",
    trashWords: ["can", "bottle", "wrapper", "plastic", "bag"],
    natureWords: ["jaguar", "macaw", "sloth", "toucan", "monkey", "frog"],
    trashClass: "bg-red-600",
    natureClass: "bg-green-600",
    blindClass: "bg-purple-700",
  },
  desert: {
    label: "Desert",
    bg: "#d4a574",
    trashWords: ["bottle", "can", "plastic", "wrapper", "bag"],
    natureWords: ["cactus", "scorpion", "lizard", "snake", "camel"],
    trashClass: "bg-gray-600",
    natureClass: "bg-amber-700",
    blindClass: "bg-purple-700",
  },
  savanna: {
    label: "Savanna",
    bg: "#c9a961",
    trashWords: ["plastic", "bottle", "can", "wrapper", "bag"],
    natureWords: ["lion", "elephant", "giraffe", "zebra", "antelope"],
    trashClass: "bg-slate-600",
    natureClass: "bg-orange-700",
    blindClass: "bg-purple-700",
  },
  coral_reef: {
    label: "Coral Reef",
    bg: "#0ea5e9",
    trashWords: ["plastic", "net", "bottle", "wrapper", "straw"],
    natureWords: ["clownfish", "coral", "anemone", "seahorse", "starfish"],
    trashClass: "bg-gray-500",
    natureClass: "bg-pink-600",
    blindClass: "bg-purple-700",
  },
};

/**
 * Game Variants
 * Each variant defines a game mode with a specific sequence of themes
 */
export const GAME_VARIANTS = {
  // Original eco-cleanup game
  eco_cleanup: {
    name: "Eco Cleanup",
    description: "Clean up trash and avoid nature words",
    instruction: "Collect trash words, avoid nature words",
    themes: ["beach", "field", "forest", "ocean", "polar"],
    collectType: "trash", // what to collect
    avoidType: "nature", // what to avoid
  },

  // Animal vocabulary collection
  wildlife_safari: {
    name: "Wildlife Safari",
    description: "Collect animal words from different habitats",
    instruction: "Collect animal words, avoid habitat words",
    themes: ["savanna", "rainforest", "polar", "ocean", "desert"],
    collectType: "nature", // collect animals
    avoidType: "trash", // avoid non-animals (could be renamed to "habitat" in theme)
  },

  // Ocean conservation
  ocean_guardian: {
    name: "Ocean Guardian",
    description: "Protect ocean creatures and remove pollution",
    instruction: "Collect trash from the ocean, protect sea life",
    themes: ["beach", "ocean", "coral_reef", "polar", "ocean"],
    collectType: "trash",
    avoidType: "nature",
  },

  // Ecosystem vocabulary
  ecosystem_explorer: {
    name: "Ecosystem Explorer",
    description: "Learn vocabulary from different ecosystems",
    instruction: "Collect target words, avoid other words",
    themes: ["rainforest", "desert", "savanna", "polar", "coral_reef"],
    collectType: "nature",
    avoidType: "trash",
  },
};

/**
 * Helper function to get theme for a specific level in a variant
 * @param {string} variantKey - The game variant key
 * @param {number} level - The current level (1-indexed)
 * @returns {object} The theme object
 */
export function getThemeForLevel(variantKey, level) {
  const variant = GAME_VARIANTS[variantKey];
  if (!variant) {
    console.warn(`Unknown variant: ${variantKey}, falling back to eco_cleanup`);
    return getThemeForLevel("eco_cleanup", level);
  }

  const themeIndex = (level - 1) % variant.themes.length;
  const themeKey = variant.themes[themeIndex];
  const theme = THEME_LIBRARY[themeKey];

  if (!theme) {
    console.warn(`Unknown theme: ${themeKey}`);
    return THEME_LIBRARY.beach; // fallback
  }

  return theme;
}

/**
 * Get the theme key for a specific level in a variant
 * @param {string} variantKey - The game variant key
 * @param {number} level - The current level (1-indexed)
 * @returns {string} The theme key
 */
export function getThemeKeyForLevel(variantKey, level) {
  const variant = GAME_VARIANTS[variantKey];
  if (!variant) return "beach";

  const themeIndex = (level - 1) % variant.themes.length;
  return variant.themes[themeIndex];
}

// Export theme library for direct access if needed
export { THEME_LIBRARY };
