/**
 * Worlds Configuration
 *
 * Defines the 7 main Worlds in the Habitat curriculum.
 * Each World represents a major geographic region and contains 4 Adventures (weekly themes).
 *
 * Structure:
 * - World → 4 Adventures → Multiple Units & Lessons
 * - Each Adventure represents one week of classroom material
 */

export const WORLDS = {
  south_america: {
    id: "south_america",
    name: "South America",
    slug: "south-america",
    description:
      "Explore the incredible biodiversity of South America, from the Amazon rainforest to the Andes mountains and the Galápagos Islands.",
    order: 1,
    color: {
      primary: "#06b6d4", // cyan-500
      secondary: "#0891b2", // cyan-600
      light: "#cffafe", // cyan-100
      dark: "#164e63", // cyan-900
    },
    // Geographic bounds for map display (approximate)
    bounds: {
      north: 12.5,
      south: -56,
      east: -34,
      west: -81,
    },
    icon: "TreePine", // Lucide icon name
    imageUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Piaui%20coast%20marine%20turtle.webp",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Piaui%20coast%20marine%20turtle.webp",
    mapUrl: "/maps/south-america.png",
    adventures: [
      {
        id: "amazon_rainforest",
        name: "Amazon Rainforest: Lungs of the Earth",
        week: 1,
        ecosystemType: "rainforest",
        description:
          "Discover the world's largest tropical rainforest, home to millions of species and indigenous communities.",
        themeTag: "amazon", // Links to theme_tags in database
      },
      {
        id: "andes_mountains",
        name: "Andes Mountains: Roof of South America",
        week: 2,
        ecosystemType: "mountain",
        description:
          "Journey through the world's longest mountain range, from cloud forests to alpine peaks.",
        themeTag: "andes",
      },
      {
        id: "galapagos_islands",
        name: "Galápagos Islands: Darwin's Laboratory",
        week: 3,
        ecosystemType: "islands",
        description:
          "Explore the unique wildlife that inspired the theory of evolution.",
        themeTag: "galapagos",
      },
      {
        id: "pantanal_wetlands",
        name: "Pantanal Wetlands: Wildlife Paradise",
        week: 4,
        ecosystemType: "wetlands",
        description:
          "Experience the world's largest tropical wetland and its incredible concentration of wildlife.",
        themeTag: "pantanal",
      },
    ],
  },

  africa: {
    id: "africa",
    name: "Africa",
    slug: "africa",
    description:
      "Experience the continent's stunning diversity, from the Sahara Desert to the Congo Basin and the savannas of East Africa.",
    order: 2,
    color: {
      primary: "#10b981", // emerald-500
      secondary: "#059669", // emerald-600
      light: "#d1fae5", // emerald-100
      dark: "#064e3b", // emerald-900
    },
    bounds: {
      north: 37,
      south: -35,
      east: 51,
      west: -17,
    },
    icon: "TreePine",
    imageUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Gorilla.jpg",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Gorilla.jpg",
    mapUrl: "/maps/africa.png",
    adventures: [
      {
        id: "serengeti",
        name: "Serengeti: Great Migration",
        week: 1,
        ecosystemType: "savanna",
        description:
          "Witness the world's largest land animal migration across the African plains.",
        themeTag: "serengeti",
      },
      {
        id: "congo_basin",
        name: "Congo Basin: Heart of Africa",
        week: 2,
        ecosystemType: "rainforest",
        description:
          "Explore the world's second-largest rainforest and home to gorillas and bonobos.",
        themeTag: "congo",
      },
      {
        id: "sahara_desert",
        name: "Sahara Desert: Sea of Sand",
        week: 3,
        ecosystemType: "desert",
        description:
          "Discover life in the world's largest hot desert and its adaptation strategies.",
        themeTag: "sahara",
      },
      {
        id: "madagascar",
        name: "Madagascar: Island of Evolution",
        week: 4,
        ecosystemType: "islands",
        description:
          "Meet lemurs and other unique species found nowhere else on Earth.",
        themeTag: "madagascar",
      },
    ],
  },

  eurasia: {
    id: "eurasia",
    name: "Eurasia",
    slug: "eurasia",
    description:
      "Journey across the world's largest landmass, from European forests to Asian steppes and tropical rainforests.",
    order: 3,
    color: {
      primary: "#f59e0b", // amber-500
      secondary: "#d97706", // amber-600
      light: "#fef3c7", // amber-100
      dark: "#78350f", // amber-900
    },
    bounds: {
      north: 81,
      south: -11,
      east: 180,
      west: -10,
    },
    icon: "Globe",
    imageUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/yellow-crested%20cockatoo.jpg",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/yellow-crested%20cockatoo.jpg",
    mapUrl: "/maps/eurasia.png",
    adventures: [
      {
        id: "siberian_taiga",
        name: "Siberian Taiga: Northern Forest",
        week: 1,
        ecosystemType: "taiga",
        description:
          "Explore the world's largest forest biome and its role in climate regulation.",
        themeTag: "taiga",
      },
      {
        id: "himalayan_mountains",
        name: "Himalayas: Roof of the World",
        week: 2,
        ecosystemType: "mountain",
        description:
          "Discover the world's highest mountains and their unique biodiversity.",
        themeTag: "himalayas",
      },
      {
        id: "borneo_rainforest",
        name: "Borneo Rainforest: Orangutan Home",
        week: 3,
        ecosystemType: "rainforest",
        description:
          "Meet orangutans, pygmy elephants, and other incredible species in one of the oldest rainforests.",
        themeTag: "borneo",
      },
      {
        id: "mediterranean",
        name: "Mediterranean: Cradle of Civilizations",
        week: 4,
        ecosystemType: "mediterranean",
        description:
          "Explore the unique climate and biodiversity of the Mediterranean region.",
        themeTag: "mediterranean",
      },
    ],
  },

  oceania: {
    id: "oceania",
    name: "Oceania",
    slug: "oceania",
    description:
      "Explore the islands and marine environments of the Pacific, from the Great Barrier Reef to New Zealand's unique ecosystems.",
    order: 4,
    color: {
      primary: "#3b82f6", // blue-500
      secondary: "#2563eb", // blue-600
      light: "#dbeafe", // blue-100
      dark: "#1e3a8a", // blue-900
    },
    bounds: {
      north: -10,
      south: -47,
      east: -175,
      west: 110,
    },
    icon: "Waves",
    imageUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Maui%20parrotbill.jpg",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Maui%20parrotbill.jpg",
    mapUrl: "/maps/oceania.png",
    adventures: [
      {
        id: "great_barrier_reef",
        name: "Great Barrier Reef: Coral Kingdom",
        week: 1,
        ecosystemType: "coral_reef",
        description:
          "Dive into the world's largest coral reef system and its incredible biodiversity.",
        themeTag: "great_barrier_reef",
      },
      {
        id: "new_zealand",
        name: "New Zealand: Ancient Forests",
        week: 2,
        ecosystemType: "forest",
        description:
          "Meet kiwis, kakapos, and other unique species in these isolated islands.",
        themeTag: "new_zealand",
      },
      {
        id: "pacific_islands",
        name: "Pacific Islands: Ocean Nations",
        week: 3,
        ecosystemType: "islands",
        description:
          "Discover the culture and ecosystems of Pacific Island nations facing climate change.",
        themeTag: "pacific_islands",
      },
      {
        id: "australian_outback",
        name: "Australian Outback: Red Centre",
        week: 4,
        ecosystemType: "desert",
        description:
          "Explore the unique wildlife of Australia's arid interior.",
        themeTag: "outback",
      },
    ],
  },

  polar_regions: {
    id: "polar_regions",
    name: "Polar Regions",
    slug: "polar-regions",
    description:
      "Venture to the ends of the Earth, exploring the Arctic and Antarctic and their unique adaptations to extreme cold.",
    order: 5,
    color: {
      primary: "#8b5cf6", // violet-500
      secondary: "#7c3aed", // violet-600
      light: "#ede9fe", // violet-100
      dark: "#4c1d95", // violet-900
    },
    bounds: {
      // Arctic
      north: 90,
      south: 66.5,
      east: 180,
      west: -180,
    },
    icon: "Snowflake",
    imageUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/bg_polar.jpg",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/bg_polar.jpg",
    mapUrl: "/maps/polar-regions.png",
    adventures: [
      {
        id: "arctic_tundra",
        name: "Arctic Tundra: Frozen Frontier",
        week: 1,
        ecosystemType: "tundra",
        description:
          "Explore the treeless plains of the Arctic and meet polar bears, Arctic foxes, and caribou.",
        themeTag: "arctic",
      },
      {
        id: "antarctica",
        name: "Antarctica: Ice Continent",
        week: 2,
        ecosystemType: "ice",
        description:
          "Journey to Earth's coldest continent and discover penguins, seals, and whales.",
        themeTag: "antarctica",
      },
      {
        id: "greenland_ice_sheet",
        name: "Greenland: Melting Giant",
        week: 3,
        ecosystemType: "ice",
        description:
          "Understand the impact of climate change on the world's largest island.",
        themeTag: "greenland",
      },
      {
        id: "northern_lights",
        name: "Northern Lights: Aurora Magic",
        week: 4,
        ecosystemType: "arctic",
        description:
          "Learn about the aurora borealis and life in the Arctic Circle.",
        themeTag: "aurora",
      },
    ],
  },

  north_america: {
    id: "north_america",
    name: "North America",
    slug: "north-america",
    description:
      "From Arctic tundra to tropical forests, discover the diverse ecosystems of North America and Central America.",
    order: 6,
    color: {
      primary: "#ef4444", // red-500
      secondary: "#dc2626", // red-600
      light: "#fee2e2", // red-100
      dark: "#7f1d1d", // red-900
    },
    bounds: {
      north: 83,
      south: 7,
      east: -52,
      west: -168,
    },
    icon: "Mountain",
    imageUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Redwoods.jpg",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Redwoods.jpg",
    mapUrl: "/maps/north-america.png",
    adventures: [
      {
        id: "yellowstone",
        name: "Yellowstone: America's Wilderness",
        week: 1,
        ecosystemType: "forest",
        description:
          "Explore geysers, hot springs, and the restoration of wolves in this iconic national park.",
        themeTag: "yellowstone",
      },
      {
        id: "great_barrier_reef_americas",
        name: "Caribbean Coral Reefs: Underwater Gardens",
        week: 2,
        ecosystemType: "coral_reef",
        description:
          "Dive into the vibrant coral reefs of the Caribbean and their conservation challenges.",
        themeTag: "caribbean_reef",
      },
      {
        id: "monarch_migration",
        name: "Monarch Migration: Epic Journey",
        week: 3,
        ecosystemType: "migration",
        description:
          "Follow the incredible 3,000-mile journey of monarch butterflies.",
        themeTag: "monarch",
      },
      {
        id: "everglades",
        name: "Everglades: River of Grass",
        week: 4,
        ecosystemType: "wetlands",
        description:
          "Discover this unique subtropical wetland and its importance to Florida's ecosystem.",
        themeTag: "everglades",
      },
    ],
  },

  the_oceans: {
    id: "the_oceans",
    name: "The Oceans",
    slug: "the-oceans",
    description:
      "Dive into Earth's largest ecosystem, covering 71% of our planet, from sunlit surface waters to the mysterious deep sea.",
    order: 7,
    color: {
      primary: "#0ea5e9", // sky-500
      secondary: "#0284c7", // sky-600
      light: "#e0f2fe", // sky-100
      dark: "#0c4a6e", // sky-900
    },
    bounds: {
      // Global oceans
      north: 85,
      south: -85,
      east: 180,
      west: -180,
    },
    icon: "Waves",
    imageUrl: "/worlds/vaquitas.jpg",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Great%20white%20shark.jpg",
    mapUrl: "/maps/oceans.png",
    adventures: [
      {
        id: "kelp_forests",
        name: "Kelp Forests: Underwater Jungles",
        week: 1,
        ecosystemType: "kelp_forest",
        description:
          "Explore the towering underwater forests and their importance to marine life.",
        themeTag: "kelp",
      },
      {
        id: "deep_ocean",
        name: "Deep Ocean: The Abyss",
        week: 2,
        ecosystemType: "deep_sea",
        description:
          "Descend into the mysterious depths and meet bizarre deep-sea creatures.",
        themeTag: "deep_ocean",
      },
      {
        id: "whale_migration",
        name: "Whale Migration: Ocean Giants",
        week: 3,
        ecosystemType: "migration",
        description:
          "Follow the epic journeys of whales across the world's oceans.",
        themeTag: "whales",
      },
      {
        id: "coral_triangle",
        name: "Coral Triangle: Marine Diversity Hotspot",
        week: 4,
        ecosystemType: "coral_reef",
        description: "Discover the most biodiverse marine region on Earth.",
        themeTag: "coral_triangle",
      },
    ],
  },
};

/**
 * Get a world by its ID
 */
export function getWorldById(worldId) {
  return WORLDS[worldId] || null;
}

/**
 * Get a world by its slug (URL-friendly version)
 */
export function getWorldBySlug(slug) {
  return Object.values(WORLDS).find((world) => world.slug === slug) || null;
}

/**
 * Get all worlds as an array, sorted by order
 */
export function getAllWorlds() {
  return Object.values(WORLDS).sort((a, b) => a.order - b.order);
}

/**
 * Get an adventure by world ID and adventure ID
 */
export function getAdventureById(worldId, adventureId) {
  const world = getWorldById(worldId);
  if (!world) return null;
  return world.adventures.find((adv) => adv.id === adventureId) || null;
}

/**
 * Get adventure by theme tag (for backward compatibility with current database)
 */
export function getAdventureByThemeTag(themeTag) {
  for (const world of Object.values(WORLDS)) {
    const adventure = world.adventures.find((adv) => adv.themeTag === themeTag);
    if (adventure) {
      return {
        ...adventure,
        world: {
          id: world.id,
          name: world.name,
          color: world.color,
        },
      };
    }
  }
  return null;
}

/**
 * Get world by theme tag (finds which world contains a given theme)
 */
export function getWorldByThemeTag(themeTag) {
  for (const world of Object.values(WORLDS)) {
    const hasAdventure = world.adventures.some(
      (adv) => adv.themeTag === themeTag
    );
    if (hasAdventure) {
      return world;
    }
  }
  return null;
}

/**
 * Get total number of adventures across all worlds
 */
export function getTotalAdventures() {
  return Object.values(WORLDS).reduce(
    (sum, world) => sum + world.adventures.length,
    0
  );
}
