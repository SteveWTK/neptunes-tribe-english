/**
 * Worlds Configuration
 *
 * Defines the 8 main Worlds in the Habitat curriculum.
 * Each World represents a major geographic region and contains 4 Adventures (weekly themes).
 *
 * Structure:
 * - World → 4 Adventures → Multiple Units & Lessons
 * - Each Adventure represents one week of classroom material
 *
 * BILINGUAL SUPPORT:
 * - All translatable fields have an English version (e.g., "name") and Portuguese version (e.g., "name_pt")
 * - Use the i18n utility functions to get the correct translation based on current language
 * - Pattern: field (English), field_pt (Portuguese)
 */

export const WORLDS = {
  south_america: {
    id: "south_america",
    name: "South America",
    name_pt: "América do Sul",
    slug: "south-america",
    description:
      "Explore the incredible biodiversity of South America, from the Amazon rainforest to the Andes mountains and the Galápagos Islands.",
    description_pt:
      "Explore a incrível biodiversidade da América do Sul, desde a floresta amazônica até as montanhas dos Andes e as Ilhas Galápagos.",
    order: 1,
    coming_soon: false,
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
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Caqueta%20titi%20with%20baby.webp",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Caqueta%20titi%20with%20baby.webp",
    mapUrl: "/maps/south-america.png",
    // Legacy single hero (kept for backward compatibility)
    ecoHeroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/PATRICIA-MEDICI.png",
    ecoHeroName: "Patricia Medici",
    // NEW: Multiple eco heroes carousel
    ecoHeroes: [
      {
        name: "Patricia Medici",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/PATRICIA-MEDICI.png",
        description: "Tapir conservationist", // Optional: for future use
      },
      {
        name: "INCAB BRASIL",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/INCAB-BRASIL.jpeg",
        description: "Defending the rainforest", // Optional: for future use
      },
    ],
    adventures: [
      {
        id: "amazon_rainforest",
        name: "Amazon Rainforest: Lungs of the Earth",
        name_pt: "Floresta Amazônica: Pulmões da Terra",
        week: 1,
        ecosystemType: "rainforest",
        description:
          "Discover the world's largest tropical rainforest, home to millions of species and indigenous communities.",
        description_pt:
          "Descubra a maior floresta tropical do mundo, lar de milhões de espécies e comunidades indígenas.",
        themeTag: "amazon", // Links to theme_tags in database
        adventureUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Caqueta%20titi%20with%20baby.webp",
        is_premium: false, // Free for all users
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ], // Which levels can access this adventure
        underConstruction: false,
      },
      {
        id: "andes_mountains",
        name: "Andes Mountains: Roof of South America",
        name_pt: "Cordilheira dos Andes: Teto da América do Sul",
        week: 2,
        ecosystemType: "mountain",
        description:
          "Journey through the world's longest mountain range, from cloud forests to alpine peaks.",
        description_pt:
          "Viaje pela cordilheira mais longa do mundo, desde florestas nubladas até picos alpinos.",
        themeTag: "andes",
        adventureUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/Andes.jpg",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ], // Available at Beginner and Intermediate levels
        underConstruction: true,
      },
      {
        id: "pantanal_wetlands",
        name: "Pantanal Wetlands: Wildlife Paradise",
        name_pt: "Pantanal: Paraíso da Vida Selvagem",
        week: 3,
        ecosystemType: "wetlands",
        description:
          "Experience the world's largest tropical wetland and its incredible concentration of wildlife.",
        description_pt:
          "Experimente a maior área úmida tropical do mundo e sua incrível concentração de vida selvagem.",
        themeTag: "pantanal",
        adventureUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Jaguar%20underwater.jpg",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ], // Available at Advanced level only
        underConstruction: true,
      },
      {
        id: "brazil_coasts_and_moutains",
        name: "Brazil's Coasts and Mountains",
        name_pt: "Costas e Montanhas do Brasil",
        week: 4,
        ecosystemType: "mountain",
        description:
          "Explore the coastal regions and mountain ranges of Brazil, with their lush vegetation and rich wildlife.",
        description_pt:
          "Explore as regiões costeiras e serras do Brasil, com sua vegetação exuberante e rica fauna.",
        themeTag: "brazil_coast",
        adventureUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Piaui%20coast%20marine%20turtle.webp",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ], // Available at Intermediate and Advanced levels
        underConstruction: true,
      },
      // {
      //   id: "galapagos_islands",
      //   name: "Galápagos Islands: Darwin's Laboratory",
      //   week: 4,
      //   ecosystemType: "islands",
      //   description:
      //     "Explore the unique wildlife that inspired the theory of evolution.",
      //   themeTag: "galapagos",
      //   levels: ["Beginner", "Intermediate", "Advanced", "Solo"], // Available at Intermediate and Advanced levels
      //   underConstruction: true,
      // },
    ],
  },

  africa: {
    id: "africa",
    name: "Africa",
    name_pt: "África",
    slug: "africa",
    description:
      "Experience the continents stunning diversity, from the Sahara Desert to the Congo Basin and the savannas of East Africa.",
    description_pt:
      "Descubra a impressionante diversidade do continente, do Deserto do Saara à Bacia do Congo e às savanas da África Oriental.",
    order: 2,
    coming_soon: true,
    next_week: true,
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
    ecoHeroUrl: "",
    ecoHeroes: [
      {
        name: "Paula Kahumbu",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/Paula-Kahumbu.avif",
        description: "Campaigner for Elephants", // Optional: for future use
      },
      {
        name: "WildlifeDirect",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/wildlife-direct-logo.png",
        description:
          "Changing hearts, minds and laws to ensure Africa’s critical species endure forever.", // Optional: for future use
      },
    ],
    adventures: [
      {
        id: "serengeti",
        name: "Serengeti: Great Migration",
        name_pt: "Serengeti: Grande Migração",
        week: 1,
        ecosystemType: "savanna",
        description:
          "Witness the world's largest land animal migration across the African plains.",
        description_pt:
          "Testemunhe a maior migração de animais terrestres do mundo pelas planícies africanas.",
        themeTag: "serengeti",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "congo_basin",
        name: "Congo Basin: Heart of Africa",
        name_pt: "Bacia do Congo: Coração da África",
        week: 2,
        ecosystemType: "rainforest",
        description:
          "Explore the world's second-largest rainforest and home to gorillas and bonobos.",
        description_pt:
          "Explore a segunda maior floresta tropical do mundo, lar de gorilas e bonobos.",
        themeTag: "congo",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: true,
      },
      {
        id: "sahara_desert",
        name: "Sahara Desert: Sea of Sand",
        name_pt: "Deserto do Saara: Mar de Areia",
        week: 3,
        ecosystemType: "desert",
        description:
          "Discover life in the world's largest hot desert and its adaptation strategies.",
        description_pt:
          "Descubra a vida no maior deserto quente do mundo e suas estratégias de adaptação.",
        themeTag: "sahara",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: true,
      },
      {
        id: "madagascar",
        name: "Madagascar: Island of Evolution",
        name_pt: "Madagascar: Ilha da Evolução",
        week: 4,
        ecosystemType: "islands",
        description:
          "Meet lemurs and other unique species found nowhere else on Earth.",
        description_pt:
          "Conheça lêmures e outras espécies únicas encontradas em nenhum outro lugar da Terra.",
        themeTag: "madagascar",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: true,
      },
    ],
  },

  eurasia: {
    id: "eurasia",
    name: "Eurasia",
    name_pt: "Eurásia",
    slug: "eurasia",
    description:
      "Journey across the world's largest landmass, from European forests to Asian steppes and tropical rainforests.",
    description_pt:
      "Viaje pela maior massa de terra do mundo, das florestas europeias às estepes asiáticas e florestas tropicais.",
    order: 3,
    coming_soon: true,
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
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/Giant%20panda.jpg",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/Giant%20panda.jpg",
    mapUrl: "/maps/eurasia.png",
    ecoHeroUrl: "",
    ecoHeroes: [
      {
        name: "Lek Chailert",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/Lek%20Chailert.jpg",
        description: "Campaigner for Elephants", // Optional: for future use
      },
      {
        name: "Elephant Nature Park",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/Elephant-Nature-Park.png",
        description: "The first ethical elephant sanctuary of its kind in Asia", // Optional: for future use
      },
    ],
    adventures: [
      {
        id: "siberian_taiga",
        name: "Siberian Taiga: Northern Forest",
        name_pt: "Taiga Siberiana: Floresta do Norte",
        week: 1,
        ecosystemType: "taiga",
        description:
          "Explore the world's largest forest biome and its role in climate regulation.",
        description_pt:
          "Explore o maior bioma florestal do mundo e seu papel na regulação climática.",
        themeTag: "taiga",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "himalayan_mountains",
        name: "Himalayas: Roof of the World",
        name_pt: "Himalaia: Teto do Mundo",
        week: 2,
        ecosystemType: "mountain",
        description:
          "Discover the world's highest mountains and their unique biodiversity.",
        description_pt:
          "Descubra as montanhas mais altas do mundo e sua biodiversidade única.",
        themeTag: "himalayas",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "borneo_rainforest",
        name: "Borneo Rainforest: Orangutan Home",
        name_pt: "Floresta de Bornéu: Lar dos Orangotangos",
        week: 3,
        ecosystemType: "rainforest",
        description:
          "Meet orangutans, pygmy elephants, and other incredible species in one of the oldest rainforests.",
        description_pt:
          "Conheça orangotangos, elefantes-pigmeus e outras espécies incríveis em uma das florestas tropicais mais antigas.",
        themeTag: "borneo",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "mediterranean",
        name: "Mediterranean: Cradle of Civilizations",
        name_pt: "Mediterrâneo: Berço das Civilizações",
        week: 4,
        ecosystemType: "mediterranean",
        description:
          "Explore the unique climate and biodiversity of the Mediterranean region.",
        description_pt:
          "Explore o clima único e a biodiversidade da região do Mediterrâneo.",
        themeTag: "mediterranean",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
    ],
  },

  oceania: {
    id: "oceania",
    name: "Oceania",
    name_pt: "Oceânia",
    slug: "oceania",
    description:
      "Explore the islands and marine environments of the Pacific, from the Great Barrier Reef to New Zealand's unique ecosystems.",
    description_pt:
      "Explore as ilhas e os ambientes marinhos do Pacífico, desde a Grande Barreira de Corais até os ecossistemas únicos da Nova Zelândia.",
    order: 4,
    coming_soon: true,
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
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/Golden-mantled%20tree%20kangaroo.jpg",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/Golden-mantled%20tree%20kangaroo.jpg",
    mapUrl: "/maps/oceania.png",
    ecoHeroUrl: "",
    ecoHeroes: [
      {
        name: "Farwiza Farhan",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/FarwizaFarhan_2021.jpg",
        description: "Forest Conservationist", // Optional: for future use
      },
      {
        name: "Future for Nature",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/future-for-nature.png",
        description: "", // Optional: for future use
      },
    ],
    adventures: [
      {
        id: "great_barrier_reef",
        name: "Great Barrier Reef: Coral Kingdom",
        name_pt: "Grande Barreira de Corais: Reino de Coral",
        week: 1,
        ecosystemType: "coral_reef",
        description:
          "Dive into the world's largest coral reef system and its incredible biodiversity.",
        description_pt:
          "Mergulhe no maior sistema de recifes de coral do mundo e sua incrível biodiversidade.",
        themeTag: "great_barrier_reef",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "new_zealand",
        name: "New Zealand: Ancient Forests",
        name_pt: "Nova Zelândia: Florestas Antigas",
        week: 2,
        ecosystemType: "forest",
        description:
          "Meet kiwis, kakapos, and other unique species in these isolated islands.",
        description_pt:
          "Conheça kiwis, kakapos e outras espécies únicas nestas ilhas isoladas.",
        themeTag: "new_zealand",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "pacific_islands",
        name: "Pacific Islands: Ocean Nations",
        name_pt: "Ilhas do Pacífico: Nações Oceânicas",
        week: 3,
        ecosystemType: "islands",
        description:
          "Discover the culture and ecosystems of Pacific Island nations facing climate change.",
        description_pt:
          "Descubra a cultura e os ecossistemas das nações insulares do Pacífico que enfrentam as mudanças climáticas.",
        themeTag: "pacific_islands",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "australian_outback",
        name: "Australian Outback: Red Centre",
        name_pt: "Outback Australiano: Centro Vermelho",
        week: 4,
        ecosystemType: "desert",
        description:
          "Explore the unique wildlife of Australia's arid interior.",
        description_pt: "Explore a fauna única do interior árido da Austrália.",
        themeTag: "outback",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
    ],
  },

  polar_regions: {
    id: "polar_regions",
    name: "Polar Regions",
    name_pt: "Regiões polares",
    slug: "polar-regions",
    description:
      "Venture to the ends of the Earth, exploring the Arctic and Antarctic and the unique adaptations of their inhabitants to extreme cold.",
    description_pt:
      "Aventure-se até os confins da Terra, explorando o Ártico e a Antártida e as adaptações únicas de seus habitantes ao frio extremo.",
    order: 5,
    coming_soon: true,
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
    ecoHeroUrl: "",
    ecoHeroes: [
      {
        name: "Pablo Borboroglu",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/Pablo-Garcia-Borboroglu.jpg",
        description:
          "Dedicated to the survival and protection of the world's penguin species",
      },
      {
        name: "Global Penguin Society",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/global-penguin-society.jpg",
        description:
          "Dedicated to the conservation of the world´s penguin species.",
      },
    ],
    adventures: [
      {
        id: "arctic_tundra",
        name: "Arctic Tundra: Frozen Frontier",
        name_pt: "Tundra Ártica: Fronteira Congelada",
        week: 1,
        ecosystemType: "tundra",
        description:
          "Explore the treeless plains of the Arctic and meet polar bears, Arctic foxes, and caribou.",
        description_pt:
          "Explore as planícies sem árvores do Ártico e conheça ursos polares, raposas árticas e caribus.",
        themeTag: "arctic",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "antarctica",
        name: "Antarctica: Ice Continent",
        name_pt: "Antártida: Continente de Gelo",
        week: 2,
        ecosystemType: "ice",
        description:
          "Journey to Earth's coldest continent and discover penguins, seals, and whales.",
        description_pt:
          "Viaje até o continente mais frio da Terra e descubra pinguins, focas e baleias.",
        themeTag: "antarctica",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "greenland_ice_sheet",
        name: "Greenland: Melting Giant",
        name_pt: "Groenlândia: Gigante Derretendo",
        week: 3,
        ecosystemType: "ice",
        description:
          "Understand the impact of climate change on the world's largest island.",
        description_pt:
          "Compreenda o impacto das mudanças climáticas na maior ilha do mundo.",
        themeTag: "greenland",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "northern_lights",
        name: "Northern Lights: Aurora Magic",
        name_pt: "Aurora Boreal: Magia da Aurora",
        week: 4,
        ecosystemType: "arctic",
        description:
          "Learn about the aurora borealis and life in the Arctic Circle.",
        description_pt:
          "Aprenda sobre a aurora boreal e a vida no Círculo Ártico.",
        themeTag: "aurora",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
    ],
  },

  north_america: {
    id: "north_america",
    name: "North America",
    name_pt: "América do Norte",
    slug: "north-america",
    description:
      "From Arctic tundra to tropical forests, discover the diverse ecosystems of North America and Central America.",
    description_pt:
      "Da tundra ártica às florestas tropicais, descubra os diversos ecossistemas da América do Norte e da América Central.",
    order: 6,
    coming_soon: true,
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
    ecoHeroUrl: "",
    adventures: [
      {
        id: "yellowstone",
        name: "Yellowstone: America's Wilderness",
        name_pt: "Yellowstone: Natureza Selvagem da América",
        week: 1,
        ecosystemType: "forest",
        description:
          "Explore geysers, hot springs, and the restoration of wolves in this iconic national park.",
        description_pt:
          "Explore gêiseres, fontes termais e a restauração de lobos neste parque nacional icônico.",
        themeTag: "yellowstone",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "great_barrier_reef_americas",
        name: "Caribbean Coral Reefs: Underwater Gardens",
        name_pt: "Recifes de Coral do Caribe: Jardins Subaquáticos",
        week: 2,
        ecosystemType: "coral_reef",
        description:
          "Dive into the vibrant coral reefs of the Caribbean and their conservation challenges.",
        description_pt:
          "Mergulhe nos vibrantes recifes de coral do Caribe e seus desafios de conservação.",
        themeTag: "caribbean_reef",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "monarch_migration",
        name: "Monarch Migration: Epic Journey",
        name_pt: "Migração das Monarcas: Jornada Épica",
        week: 3,
        ecosystemType: "migration",
        description:
          "Follow the incredible 3,000-mile journey of monarch butterflies.",
        description_pt:
          "Acompanhe a incrível jornada de 4.800 quilômetros das borboletas-monarca.",
        themeTag: "monarch",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "everglades",
        name: "Everglades: River of Grass",
        name_pt: "Everglades: Rio de Capim",
        week: 4,
        ecosystemType: "wetlands",
        description:
          "Discover this unique subtropical wetland and its importance to Florida's ecosystem.",
        description_pt:
          "Descubra esta área úmida subtropical única e sua importância para o ecossistema da Flórida.",
        themeTag: "everglades",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
    ],
  },

  the_oceans: {
    id: "the_oceans",
    name: "The Oceans",
    name_pt: "Os oceanos",
    slug: "the-oceans",
    description:
      "Dive into Earth's largest ecosystem, covering 71% of our planet, from sunlit surface waters to the mysterious deep sea.",
    description_pt:
      "Explore o maior ecossistema da Terra, que cobre 71% do nosso planeta, desde as águas superficiais iluminadas pelo sol até as misteriosas profundezas do oceano.",
    order: 7,
    coming_soon: true,
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
    imageUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Piaui%20coast%20marine%20turtle.webp",
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Great%20white%20shark.jpg",
    mapUrl: "/maps/oceans.png",
    ecoHeroUrl: "",
    adventures: [
      {
        id: "kelp_forests",
        name: "Kelp Forests: Underwater Jungles",
        name_pt: "Florestas de Kelp: Selvas Subaquáticas",
        week: 1,
        ecosystemType: "kelp_forest",
        description:
          "Explore the towering underwater forests and their importance to marine life.",
        description_pt:
          "Explore as imponentes florestas subaquáticas e sua importância para a vida marinha.",
        themeTag: "kelp",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "deep_ocean",
        name: "Deep Ocean: The Abyss",
        name_pt: "Oceano Profundo: O Abismo",
        week: 2,
        ecosystemType: "deep_sea",
        description:
          "Descend into the mysterious depths and meet bizarre deep-sea creatures.",
        description_pt:
          "Desça às profundezas misteriosas e conheça criaturas bizarras das profundezas do mar.",
        themeTag: "deep_ocean",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "whale_migration",
        name: "Whale Migration: Ocean Giants",
        name_pt: "Migração das Baleias: Gigantes do Oceano",
        week: 3,
        ecosystemType: "migration",
        description:
          "Follow the epic journeys of whales across the world's oceans.",
        description_pt:
          "Acompanhe as jornadas épicas das baleias pelos oceanos do mundo.",
        themeTag: "whales",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
      {
        id: "coral_triangle",
        name: "Coral Triangle: Marine Diversity Hotspot",
        name_pt: "Triângulo de Coral: Hotspot de Diversidade Marinha",
        week: 4,
        ecosystemType: "coral_reef",
        description: "Discover the most biodiverse marine region on Earth.",
        description_pt: "Descubra a região marinha mais biodiversa da Terra.",
        themeTag: "coral_triangle",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: false,
      },
    ],
  },

  lost_worlds: {
    id: "lost_worlds",
    name: "Lost Worlds",
    name_pt: "Mundos Perdidos",
    slug: "lost-worlds",
    description:
      "Journey through 4 billion years of Earth's history, from the first spark of life to the Ice Age. Meet dinosaurs, mammoths, and countless extinct species that once ruled our planet.",
    description_pt:
      "Embarque em uma jornada através de 4 bilhões de anos da história da Terra, desde o primeiro vislumbre de vida até a Era do Gelo. Conheça dinossauros, mamutes e inúmeras espécies extintas que um dia dominaram nosso planeta.",
    order: 8,
    coming_soon: true,
    color: {
      primary: "#a855f7", // purple-500
      secondary: "#9333ea", // purple-600
      light: "#f3e8ff", // purple-100
      dark: "#581c87", // purple-900
    },
    bounds: {
      // Global (time-based rather than location-based)
      north: 85,
      south: -85,
      east: 180,
      west: -180,
    },
    icon: "Mountain",
    imageUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/tyranosaurus-rex.jpg", // Placeholder - can be replaced with prehistoric image
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/woolly_mammoth_bbc.jpg", // Placeholder
    mapUrl: "/maps/lost-worlds.png", // Will need to be created
    ecoHeroUrl: "",
    adventures: [
      {
        id: "dawn_of_life",
        name: "Dawn of Life: Ancient Seas",
        name_pt: "Aurora da Vida: Mares Antigos",
        week: 1,
        ecosystemType: "ancient_ocean",
        description:
          "Dive into Earth's primordial oceans 3.5 billion years ago. Discover the first microscopic life forms, stromatolites, and the strange creatures of the Cambrian Explosion that changed life forever.",
        description_pt:
          "Mergulhe nos oceanos primordiais da Terra há 3,5 bilhões de anos. Descubra as primeiras formas de vida microscópicas, estromatólitos e as estranhas criaturas da Explosão Cambriana que mudaram a vida para sempre.",
        themeTag: "ancient_seas",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: true,
      },
      {
        id: "age_of_dinosaurs",
        name: "Age of Dinosaurs: Mesozoic Giants",
        name_pt: "Era dos Dinossauros: Gigantes do Mesozoico",
        week: 2,
        ecosystemType: "prehistoric",
        description:
          "Walk among the giants of the Mesozoic Era. Meet Tyrannosaurus rex, Triceratops, long-necked sauropods, and discover why these magnificent creatures vanished 66 million years ago.",
        description_pt:
          "Caminhe entre os gigantes da Era Mesozoica. Conheça o Tyrannosaurus rex, Triceratops, saurópodes de pescoço longo e descubra por que essas criaturas magníficas desapareceram há 66 milhões de anos.",
        themeTag: "dinosaurs",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: true,
      },
      {
        id: "ice_age_megafauna",
        name: "Ice Age: Frozen Giants",
        name_pt: "Era do Gelo: Gigantes Congelados",
        week: 3,
        ecosystemType: "ice_age",
        description:
          "Journey to the last Ice Age, just 10,000 years ago. Meet woolly mammoths, saber-toothed cats, giant ground sloths, and discover how humans lived alongside these incredible beasts.",
        description_pt:
          "Viaje à última Era do Gelo, há apenas 10.000 anos. Conheça mamutes lanosos, tigres-dentes-de-sabre, preguiças-gigantes e descubra como os humanos viveram ao lado dessas bestas incríveis.",
        themeTag: "ice_age",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: true,
      },
      {
        id: "extinction_and_survival",
        name: "Mass Extinctions: Stories of Survival",
        name_pt: "Extinções em Massa: Histórias de Sobrevivência",
        week: 4,
        ecosystemType: "extinction_events",
        description:
          "Explore Earth's five mass extinctions and the resilient species that survived. Learn about dodo birds, passenger pigeons, and what extinction teaches us about protecting life today.",
        description_pt:
          "Explore as cinco extinções em massa da Terra e as espécies resilientes que sobreviveram. Aprenda sobre os dodôs, pombos-passageiros e o que a extinção nos ensina sobre proteger a vida hoje.",
        themeTag: "extinctions",
        is_premium: true, // Premium content
        levels: [
          "Level 1",
          "Level 2",
          "Level 3",
          "Beginner",
          "Intermediate",
          "Advanced",
          "Solo",
        ],
        underConstruction: true,
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
