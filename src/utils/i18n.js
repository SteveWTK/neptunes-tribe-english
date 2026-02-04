/**
 * i18n Utility Functions
 * Helper functions for handling multilingual content throughout the app
 */

/**
 * Get translated field from an object
 * @param {Object} obj - Object with translation fields
 * @param {String} field - Base field name (e.g., "name", "description")
 * @param {String} lang - Language code ("en", "pt", "th", etc.)
 * @returns {String} Translated value or fallback to English
 *
 * @example
 * const world = { name: "South America", name_pt: "América do Sul", name_th: "อเมริกาใต้" }
 * getTranslation(world, "name", "pt") // Returns "América do Sul"
 * getTranslation(world, "name", "th") // Returns "อเมริกาใต้"
 * getTranslation(world, "name", "en") // Returns "South America"
 */
export function getTranslation(obj, field, lang = "en") {
  if (!obj) return "";

  // If not English, try the language-specific field first
  if (lang !== "en") {
    const langField = `${field}_${lang}`;
    if (obj[langField]) return obj[langField];
  }

  // Fallback to English (base field)
  return obj[field] || "";
}

/**
 * Translate an entire world object
 * Returns a new object with translated name and description
 * @param {Object} world - World object from worldsConfig
 * @param {String} lang - Language code
 * @returns {Object} World object with current language
 */
export function translateWorld(world, lang = "en") {
  if (!world) return null;

  return {
    ...world,
    name: getTranslation(world, "name", lang),
    description: getTranslation(world, "description", lang),
    adventures: world.adventures?.map(adv => translateAdventure(adv, lang)) || []
  };
}

/**
 * Translate an adventure object
 * @param {Object} adventure - Adventure object
 * @param {String} lang - Language code
 * @returns {Object} Adventure with current language
 */
export function translateAdventure(adventure, lang = "en") {
  if (!adventure) return null;

  return {
    ...adventure,
    name: getTranslation(adventure, "name", lang),
    description: getTranslation(adventure, "description", lang)
  };
}

/**
 * Translate an array of worlds
 * @param {Array} worlds - Array of world objects
 * @param {String} lang - Language code
 * @returns {Array} Translated worlds
 */
export function translateWorlds(worlds, lang = "en") {
  if (!worlds || !Array.isArray(worlds)) return [];
  return worlds.map(world => translateWorld(world, lang));
}
