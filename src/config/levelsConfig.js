/**
 * Levels Configuration for Habitat
 *
 * Defines the progression levels for the learning experience.
 * Each level corresponds to a difficulty tier in the lesson database.
 *
 * IMPORTANT FOR CLONING:
 * - When cloning to new projects (Startup Nation, FieldTalk, etc.)
 * - Keep the 'value' field the same (it matches database difficulty column)
 * - Customize displayName, description, icon, color per project theme
 * - Add/remove levels as needed (flexible system)
 */

export const LEVELS = {
  // Level 0: Survival Basics (Optional - for absolute beginners)
  survival_absolute: {
    id: "survival_absolute",
    value: "Survival Absolute", // Must match lesson.difficulty in database
    displayName: "Survival Mode",
    shortName: "Survival",
    description: "Essential basics for immediate communication",
    order: 0,
    icon: "🆘", // Customize per project
    color: {
      primary: "#ef4444", // red-500
      light: "#fef2f2",
      dark: "#7f1d1d",
    },
    // Content characteristics
    characteristics: [
      "Very short lessons (5-10 min)",
      "Survival vocabulary only",
      "Immediate practical use",
      "Minimal grammar",
    ],
    // Estimated duration to complete
    estimatedDuration: "2-4 weeks",
    // For schools: Which grade level
    recommendedGrade: "Any (Emergency preparedness)",
  },

  // Level 1: Discovery/Beginner
  beginner: {
    id: "beginner",
    value: "Beginner", // Must match lesson.difficulty in database
    displayName: "Level 1: Discovery",
    shortName: "Beginner",
    description: "Start your environmental English journey",
    order: 1,
    icon: "🌱", // Customize per project
    color: {
      primary: "#10b981", // emerald-500
      light: "#d1fae5",
      dark: "#064e3b",
    },
    characteristics: [
      "Basic vocabulary and grammar",
      "Short readings (200-400 words)",
      "Simple exercises",
      "Clear explanations",
    ],
    estimatedDuration: "3-6 months",
    recommendedGrade: "6th-8th grade",
  },

  // Level 2: Exploration/Intermediate
  intermediate: {
    id: "intermediate",
    value: "Intermediate", // Must match lesson.difficulty in database
    displayName: "Level 2: Explorer",
    shortName: "Intermediate",
    description: "Deepen your understanding and skills",
    order: 2,
    icon: "🔍", // Customize per project
    color: {
      primary: "#3b82f6", // blue-500
      light: "#dbeafe",
      dark: "#1e3a8a",
    },
    characteristics: [
      "Expanded vocabulary",
      "Medium readings (400-800 words)",
      "Analytical exercises",
      "Connected concepts",
    ],
    estimatedDuration: "6-12 months",
    recommendedGrade: "9th-10th grade",
  },

  // Level 3: Mastery/Advanced
  advanced: {
    id: "advanced",
    value: "Advanced", // Must match lesson.difficulty in database
    displayName: "Level 3: Expert",
    shortName: "Advanced",
    description: "Master complex environmental topics",
    order: 3,
    icon: "🏆", // Customize per project
    color: {
      primary: "#8b5cf6", // violet-500
      light: "#ede9fe",
      dark: "#4c1d95",
    },
    characteristics: [
      "Advanced vocabulary and idioms",
      "Long readings (800-1500 words)",
      "Critical thinking exercises",
      "Research and debate topics",
    ],
    estimatedDuration: "12+ months",
    recommendedGrade: "11th-12th grade / College",
  },

  // Individual users: free travellers
  solo: {
    id: "solo",
    value: "Solo", // Must match lesson.difficulty in database
    displayName: "Solo Explorer",
    shortName: "Solo Explorer",
    description: "Master complex environmental topics",
    order: 3,
    icon: "🌍", // Customize per project
    color: {
      primary: "#8b5cf6", // violet-500
      light: "#ede9fe",
      dark: "#4c1d95",
    },
    characteristics: [
      "Advanced vocabulary and idioms",
      "Long readings (800-1500 words)",
      "Critical thinking exercises",
      "Research and debate topics",
    ],
    estimatedDuration: "12+ months",
    recommendedGrade: "11th-12th grade / College",
  },

  // FUTURE LEVELS (Add as needed):
  // expert: {
  //   id: "expert",
  //   value: "Expert",
  //   displayName: "Level 4: Master",
  //   shortName: "Expert",
  //   description: "Professional-level environmental English",
  //   order: 4,
  //   icon: "⭐",
  //   color: { primary: "#f59e0b", light: "#fef3c7", dark: "#78350f" },
  //   characteristics: ["Academic writing", "Professional presentations"],
  //   estimatedDuration: "Ongoing",
  //   recommendedGrade: "College / Professional",
  // },
};

/**
 * Get all levels as an array, sorted by order
 */
export function getAllLevels() {
  return Object.values(LEVELS).sort((a, b) => a.order - b.order);
}

/**
 * Get a specific level by ID
 */
export function getLevelById(levelId) {
  return LEVELS[levelId] || null;
}

/**
 * Get a level by its database value
 */
export function getLevelByValue(value) {
  return Object.values(LEVELS).find((level) => level.value === value) || null;
}

/**
 * Get the next level in progression
 */
export function getNextLevel(currentLevelId) {
  const levels = getAllLevels();
  const currentIndex = levels.findIndex((l) => l.id === currentLevelId);

  if (currentIndex === -1 || currentIndex === levels.length - 1) {
    return null; // No next level
  }

  return levels[currentIndex + 1];
}

/**
 * Get the previous level
 */
export function getPreviousLevel(currentLevelId) {
  const levels = getAllLevels();
  const currentIndex = levels.findIndex((l) => l.id === currentLevelId);

  if (currentIndex <= 0) {
    return null; // No previous level
  }

  return levels[currentIndex - 1];
}

/**
 * Check if user can level up (has next level available)
 */
export function canLevelUp(currentLevelId) {
  return getNextLevel(currentLevelId) !== null;
}

/**
 * Get level color for UI components
 */
export function getLevelColor(levelId, shade = "primary") {
  const level = getLevelById(levelId);
  return level?.color?.[shade] || "#6b7280"; // gray-500 fallback
}

/**
 * Map database difficulty value to level ID
 */
export function difficultyToLevelId(difficulty) {
  const level = getLevelByValue(difficulty);
  return level?.id || "beginner"; // Default to beginner
}

/**
 * Map level ID to database difficulty value
 */
export function levelIdToDifficulty(levelId) {
  const level = getLevelById(levelId);
  return level?.value || "Beginner"; // Default to Beginner
}

// ============================================================================
// CLONING NOTES FOR OTHER PROJECTS
// ============================================================================
/*
When cloning to Startup Nation, FieldTalk, etc.:

1. KEEP THE SAME:
   - File structure
   - Function names
   - Database value fields (Beginner, Intermediate, Advanced)
   - Helper functions

2. CUSTOMIZE:
   - displayName: "Level 1: Discovery" → "Level 1: Founder"
   - description: Match your project theme
   - icon: 🌱 → 🚀 (for Startup Nation)
   - color: Adjust to project branding
   - characteristics: Match content type
   - recommendedGrade: Adjust if needed

3. ADD MORE LEVELS:
   Just add new objects to LEVELS constant
   {
     id: "expert",
     value: "Expert",
     displayName: "Level 4: Unicorn",
     ...
   }

4. EXAMPLE - Startup Nation:
   beginner: {
     displayName: "Level 1: Founder",
     description: "Learn startup fundamentals",
     icon: "🚀",
     color: { primary: "#ff6b35" },
   }
   intermediate: {
     displayName: "Level 2: Scaleup",
     description: "Grow your business knowledge",
     icon: "📈",
     color: { primary: "#004e89" },
   }
   advanced: {
     displayName: "Level 3: Unicorn",
     description: "Master entrepreneurship",
     icon: "🦄",
     color: { primary: "#8b5cf6" },
   }
*/
