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
 * - All translatable fields have an English version (e.g., "name"), Portuguese version (e.g., "name_pt"), and Thai version (e.g., "name_th")
 * - Use the i18n utility functions to get the correct translation based on current language
 * - Pattern: field (English), field_pt (Portuguese), field_th (Thai)
 */

export const WORLDS = {
  south_america: {
    id: "south_america",
    name: "South America",
    name_pt: "América do Sul",
    name_th: "อเมริกาใต้",
    slug: "south-america",
    description:
      "Explore the incredible biodiversity of South America, from the Amazon rainforest to the Andes mountains and the Galápagos Islands.",
    description_pt:
      "Explore a incrível biodiversidade da América do Sul, desde a floresta amazônica até as montanhas dos Andes e as Ilhas Galápagos.",
    description_th:
      "สำรวจความหลากหลายทางชีวภาพอันน่าทึ่งของอเมริกาใต้ ตั้งแต่ป่าฝนแอมะซอนไปจนถึงเทือกเขาแอนดีสและหมู่เกาะกาลาปากอส",
    order: 1,
    coming_soon: false,
    color: {
      // primary: "#10b981", // emerald-500
      // secondary: "#059669", // emerald-600
      // light: "#d1fae5", // emerald-100
      // dark: "#064e3b", // emerald-900
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
        name: "Muriqui Instituto de Biodiversidade",
        imageUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/mib.jpeg",
        description: "Tapir conservationist", // Optional: for future use
      },
      // {
      //   name: "Instituto de Pesquisas Ecológicas",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/ipe.jpeg",
      //   description: "Defending the rainforest", // Optional: for future use
      // },
    ],
    adventures: [
      {
        id: "amazon_rainforest",
        name: "Amazon Rainforest: Lungs of the Earth",
        name_pt: "Floresta Amazônica: Pulmões da Terra",
        name_th: "ป่าฝนแอมะซอน: ปอดของโลก",
        week: 1,
        ecosystemType: "rainforest",
        description:
          "Discover the world's largest tropical rainforest, home to millions of species and indigenous communities.",
        description_pt:
          "Descubra a maior floresta tropical do mundo, lar de milhões de espécies e comunidades indígenas.",
        description_th:
          "ค้นพบป่าฝนเขตร้อนที่ใหญ่ที่สุดในโลก ซึ่งเป็นถิ่นที่อยู่ของสิ่งมีชีวิตนับล้านชนิดและชุมชนชนพื้นเมือง",
        themeTag: "amazon",
        adventureUrl:
          "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/eco/Caqueta%20titi%20with%20baby.webp",
        is_premium: false,
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
        id: "andes_mountains",
        name: "Andes Mountains: Roof of South America",
        name_pt: "Cordilheira dos Andes: Teto da América do Sul",
        name_th: "เทือกเขาแอนดีส: หลังคาของอเมริกาใต้",
        week: 2,
        ecosystemType: "mountain",
        description:
          "Journey through the world's longest mountain range, from cloud forests to alpine peaks.",
        description_pt:
          "Viaje pela cordilheira mais longa do mundo, desde florestas nubladas até picos alpinos.",
        description_th:
          "เดินทางผ่านเทือกเขาที่ยาวที่สุดในโลก ตั้งแต่ป่าเมฆไปจนถึงยอดเขาสูงเสียดฟ้า",
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
        name_th: "พื้นที่ชุ่มน้ำแพนทานัล: สวรรค์ของสัตว์ป่า",
        week: 3,
        ecosystemType: "wetlands",
        description:
          "Experience the world's largest tropical wetland and its incredible concentration of wildlife.",
        description_pt:
          "Experimente a maior área úmida tropical do mundo e sua incrível concentração de vida selvagem.",
        description_th:
          "สัมผัสพื้นที่ชุ่มน้ำเขตร้อนที่ใหญ่ที่สุดในโลกและความหนาแน่นอันน่าทึ่งของสัตว์ป่า",
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
        name_th: "ชายฝั่งและภูเขาของบราซิล",
        week: 4,
        ecosystemType: "mountain",
        description:
          "Explore the coastal regions and mountain ranges of Brazil, with their lush vegetation and rich wildlife.",
        description_pt:
          "Explore as regiões costeiras e serras do Brasil, com sua vegetação exuberante e rica fauna.",
        description_th:
          "สำรวจชายฝั่งทะเลและเทือกเขาของบราซิล พร้อมพืชพรรณอันอุดมสมบูรณ์และสัตว์ป่าที่หลากหลาย",
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
    name_th: "แอฟริกา",
    slug: "africa",
    description:
      "Experience the continent's stunning diversity, from the Sahara Desert to the Congo Basin and the savannas of East Africa.",
    description_pt:
      "Descubra a impressionante diversidade do continente, do Deserto do Saara à Bacia do Congo e às savanas da África Oriental.",
    description_th:
      "สัมผัสความหลากหลายอันน่าตื่นตาตื่นใจของทวีป ตั้งแต่ทะเลทรายซาฮาราไปจนถึงแอ่งคองโกและทุ่งหญ้าสะวันนาในแอฟริกาตะวันออก",
    order: 2,
    coming_soon: true,
    next_week: true,
    color: {
      // primary: "#06b6d4", // cyan-500
      // secondary: "#0891b2", // cyan-600
      // light: "#cffafe", // cyan-100
      // dark: "#164e63", // cyan-900
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
      // {
      //   name: "Paula Kahumbu",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/Paula-Kahumbu.avif",
      //   description: "Campaigner for Elephants", // Optional: for future use
      // },
      // {
      //   name: "WildlifeDirect",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/wildlife-direct-logo.png",
      //   description:
      //     "Changing hearts, minds and laws to ensure Africa’s critical species endure forever.", // Optional: for future use
      // },
    ],
    adventures: [
      {
        id: "serengeti",
        name: "Savannahs",
        name_pt: "Savanas",
        name_th: "ทุ่งหญ้าสะวันนา",
        week: 1,
        ecosystemType: "savanna",
        description:
          "Witness the world's largest land animal migration across the African plains.",
        description_pt:
          "Testemunhe a maior migração de animais terrestres do mundo pelas planícies africanas.",
        description_th:
          "เป็นสักขีพยานการอพยพของสัตว์บกที่ใหญ่ที่สุดในโลกข้ามที่ราบแอฟริกา",
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
        name_th: "แอ่งคองโก: หัวใจของแอฟริกา",
        week: 2,
        ecosystemType: "rainforest",
        description:
          "Explore the world's second-largest rainforest and home to gorillas and bonobos.",
        description_pt:
          "Explore a segunda maior floresta tropical do mundo, lar de gorilas e bonobos.",
        description_th:
          "สำรวจป่าฝนที่ใหญ่เป็นอันดับสองของโลกและถิ่นที่อยู่ของกอริลลาและโบโนโบ",
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
        name_th: "ทะเลทรายซาฮารา: ทะเลแห่งทราย",
        week: 3,
        ecosystemType: "desert",
        description:
          "Discover life in the world's largest hot desert and its adaptation strategies.",
        description_pt:
          "Descubra a vida no maior deserto quente do mundo e suas estratégias de adaptação.",
        description_th:
          "ค้นพบชีวิตในทะเลทรายร้อนที่ใหญ่ที่สุดในโลกและกลยุทธ์การปรับตัวของสิ่งมีชีวิต",
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
        name_th: "มาดากัสการ์: เกาะแห่งวิวัฒนาการ",
        week: 4,
        ecosystemType: "islands",
        description:
          "Meet lemurs and other unique species found nowhere else on Earth.",
        description_pt:
          "Conheça lêmures e outras espécies únicas encontradas em nenhum outro lugar da Terra.",
        description_th:
          "พบกับลีเมอร์และสัตว์สายพันธุ์เฉพาะถิ่นที่ไม่พบที่ไหนอื่นในโลก",
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

  the_oceans: {
    id: "the_oceans",
    name: "The Oceans",
    name_pt: "Os oceanos",
    name_th: "มหาสมุทร",
    slug: "the-oceans",
    description:
      "Dive into Earth's largest ecosystem, covering 71% of our planet, from sunlit surface waters to the mysterious deep sea.",
    description_pt:
      "Explore o maior ecossistema da Terra, que cobre 71% do nosso planeta, desde as águas superficiais iluminadas pelo sol até as misteriosas profundezas do oceano.",
    description_th:
      "ดำดิ่งสู่ระบบนิเวศที่ใหญ่ที่สุดของโลก ซึ่งครอบคลุมพื้นที่ 71% ของดาวเคราะห์ของเรา ตั้งแต่ผิวน้ำที่สว่างไสวไปจนถึงท้องทะเลลึกอันลึกลับ",
    order: 3,
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
        name_th: "ป่าสาหร่ายเคลป์: ป่าดงดิบใต้น้ำ",
        week: 1,
        ecosystemType: "kelp_forest",
        description:
          "Explore the towering underwater forests and their importance to marine life.",
        description_pt:
          "Explore as imponentes florestas subaquáticas e sua importância para a vida marinha.",
        description_th:
          "สำรวจป่าใต้น้ำอันสูงตระหง่านและความสำคัญของมันต่อสิ่งมีชีวิตทางทะเล",
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
        name_th: "ทะเลลึก: ห้วงมหาสมุทร",
        week: 2,
        ecosystemType: "deep_sea",
        description:
          "Descend into the mysterious depths and meet bizarre deep-sea creatures.",
        description_pt:
          "Desça às profundezas misteriosas e conheça criaturas bizarras das profundezas do mar.",
        description_th:
          "ดำดิ่งสู่ห้วงลึกอันลึกลับและพบกับสิ่งมีชีวิตใต้ทะเลลึกที่แปลกประหลาด",
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
        name_th: "การอพยพของวาฬ: ยักษ์ใหญ่แห่งมหาสมุทร",
        week: 3,
        ecosystemType: "migration",
        description:
          "Follow the epic journeys of whales across the world's oceans.",
        description_pt:
          "Acompanhe as jornadas épicas das baleias pelos oceanos do mundo.",
        description_th:
          "ติดตามการเดินทางอันยิ่งใหญ่ของวาฬข้ามมหาสมุทรทั่วโลก",
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
        name_th: "สามเหลี่ยมปะการัง: จุดหมายแห่งความหลากหลายทางทะเล",
        week: 4,
        ecosystemType: "coral_reef",
        description: "Discover the most biodiverse marine region on Earth.",
        description_pt: "Descubra a região marinha mais biodiversa da Terra.",
        description_th: "ค้นพบภูมิภาคทางทะเลที่มีความหลากหลายทางชีวภาพมากที่สุดในโลก",
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

  eurasia: {
    id: "eurasia",
    name: "Eurasia",
    name_pt: "Eurásia",
    name_th: "ยูเรเชีย",
    slug: "eurasia",
    description:
      "Journey across the world's largest landmass, from European forests to Asian steppes and tropical rainforests.",
    description_pt:
      "Viaje pela maior massa de terra do mundo, das florestas europeias às estepes asiáticas e florestas tropicais.",
    description_th:
      "เดินทางข้ามแผ่นดินที่ใหญ่ที่สุดในโลก ตั้งแต่ป่าในยุโรปไปจนถึงทุ่งหญ้าสเตปป์ในเอเชียและป่าฝนเขตร้อน",
    order: 4,
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
      // {
      //   name: "Lek Chailert",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/Lek%20Chailert.jpg",
      //   description: "Campaigner for Elephants", // Optional: for future use
      // },
      // {
      //   name: "Elephant Nature Park",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/Elephant-Nature-Park.png",
      //   description: "The first ethical elephant sanctuary of its kind in Asia", // Optional: for future use
      // },
    ],
    adventures: [
      {
        id: "siberian_taiga",
        name: "Siberian Taiga: Northern Forest",
        name_pt: "Taiga Siberiana: Floresta do Norte",
        name_th: "ไทกาไซบีเรีย: ป่าแห่งดินแดนเหนือ",
        week: 1,
        ecosystemType: "taiga",
        description:
          "Explore the world's largest forest biome and its role in climate regulation.",
        description_pt:
          "Explore o maior bioma florestal do mundo e seu papel na regulação climática.",
        description_th:
          "สำรวจไบโอมป่าที่ใหญ่ที่สุดในโลกและบทบาทของมันในการควบคุมสภาพภูมิอากาศ",
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
        name_th: "เทือกเขาหิมาลัย: หลังคาของโลก",
        week: 2,
        ecosystemType: "mountain",
        description:
          "Discover the world's highest mountains and their unique biodiversity.",
        description_pt:
          "Descubra as montanhas mais altas do mundo e sua biodiversidade única.",
        description_th:
          "ค้นพบเทือกเขาที่สูงที่สุดในโลกและความหลากหลายทางชีวภาพอันเป็นเอกลักษณ์",
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
        name_th: "ป่าฝนบอร์เนียว: บ้านของอุรังอุตัง",
        week: 3,
        ecosystemType: "rainforest",
        description:
          "Meet orangutans, pygmy elephants, and other incredible species in one of the oldest rainforests.",
        description_pt:
          "Conheça orangotangos, elefantes-pigmeus e outras espécies incríveis em uma das florestas tropicais mais antigas.",
        description_th:
          "พบกับอุรังอุตัง ช้างแคระ และสัตว์สายพันธุ์มหัศจรรย์อื่น ๆ ในป่าฝนที่เก่าแก่ที่สุดแห่งหนึ่งของโลก",
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
        name_th: "เมดิเตอร์เรเนียน: แหล่งกำเนิดอารยธรรม",
        week: 4,
        ecosystemType: "mediterranean",
        description:
          "Explore the unique climate and biodiversity of the Mediterranean region.",
        description_pt:
          "Explore o clima único e a biodiversidade da região do Mediterrâneo.",
        description_th:
          "สำรวจสภาพภูมิอากาศอันเป็นเอกลักษณ์และความหลากหลายทางชีวภาพของภูมิภาคเมดิเตอร์เรเนียน",
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
    name_th: "โอเชียเนีย",
    slug: "oceania",
    description:
      "Explore the islands and marine environments of the Pacific, from the Great Barrier Reef to New Zealand's unique ecosystems.",
    description_pt:
      "Explore as ilhas e os ambientes marinhos do Pacífico, desde a Grande Barreira de Corais até os ecossistemas únicos da Nova Zelândia.",
    description_th:
      "สำรวจหมู่เกาะและสภาพแวดล้อมทางทะเลของมหาสมุทรแปซิฟิก ตั้งแต่แนวปะการังเกรทแบร์ริเออร์รีฟไปจนถึงระบบนิเวศอันเป็นเอกลักษณ์ของนิวซีแลนด์",
    order: 5,
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
      // {
      //   name: "Farwiza Farhan",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/FarwizaFarhan_2021.jpg",
      //   description: "Forest Conservationist", // Optional: for future use
      // },
      // {
      //   name: "Future for Nature",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/hero/future-for-nature.png",
      //   description: "", // Optional: for future use
      // },
    ],
    adventures: [
      {
        id: "great_barrier_reef",
        name: "Great Barrier Reef: Coral Kingdom",
        name_pt: "Grande Barreira de Corais: Reino de Coral",
        name_th: "แนวปะการังเกรทแบร์ริเออร์: อาณาจักรปะการัง",
        week: 1,
        ecosystemType: "coral_reef",
        description:
          "Dive into the world's largest coral reef system and its incredible biodiversity.",
        description_pt:
          "Mergulhe no maior sistema de recifes de coral do mundo e sua incrível biodiversidade.",
        description_th:
          "ดำดิ่งสู่ระบบแนวปะการังที่ใหญ่ที่สุดในโลกและความหลากหลายทางชีวภาพอันน่าทึ่ง",
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
        name_th: "นิวซีแลนด์: ป่าโบราณ",
        week: 2,
        ecosystemType: "forest",
        description:
          "Meet kiwis, kakapos, and other unique species in these isolated islands.",
        description_pt:
          "Conheça kiwis, kakapos e outras espécies únicas nestas ilhas isoladas.",
        description_th:
          "พบกับนกกีวี นกแก้วคาคาโป และสัตว์สายพันธุ์เฉพาะถิ่นอื่น ๆ บนหมู่เกาะที่โดดเดี่ยวเหล่านี้",
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
        name_th: "หมู่เกาะแปซิฟิก: ประเทศแห่งมหาสมุทร",
        week: 3,
        ecosystemType: "islands",
        description:
          "Discover the culture and ecosystems of Pacific Island nations facing climate change.",
        description_pt:
          "Descubra a cultura e os ecossistemas das nações insulares do Pacífico que enfrentam as mudanças climáticas.",
        description_th:
          "ค้นพบวัฒนธรรมและระบบนิเวศของประเทศหมู่เกาะแปซิฟิกที่กำลังเผชิญกับการเปลี่ยนแปลงสภาพภูมิอากาศ",
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
        name_th: "เขตทุรกันดารออสเตรเลีย: ใจกลางสีแดง",
        week: 4,
        ecosystemType: "desert",
        description:
          "Explore the unique wildlife of Australia's arid interior.",
        description_pt: "Explore a fauna única do interior árido da Austrália.",
        description_th:
          "สำรวจสัตว์ป่าที่เป็นเอกลักษณ์ของพื้นที่แห้งแล้งภายในออสเตรเลีย",
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
    name_th: "ขั้วโลก",
    slug: "polar-regions",
    description:
      "Venture to the ends of the Earth, exploring the Arctic and Antarctic and the unique adaptations of their inhabitants to extreme cold.",
    description_pt:
      "Aventure-se até os confins da Terra, explorando o Ártico e a Antártida e as adaptações únicas de seus habitantes ao frio extremo.",
    description_th:
      "ผจญภัยสู่สุดขอบโลก สำรวจอาร์กติกและแอนตาร์กติกา พร้อมเรียนรู้การปรับตัวอันเป็นเอกลักษณ์ของสิ่งมีชีวิตในสภาพอากาศหนาวจัด",
    order: 6,
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
      // {
      //   name: "Pablo Borboroglu",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/Pablo-Garcia-Borboroglu.jpg",
      //   description:
      //     "Dedicated to the survival and protection of the world's penguin species",
      // },
      // {
      //   name: "Global Penguin Society",
      //   imageUrl:
      //     "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/global-penguin-society.jpg",
      //   description:
      //     "Dedicated to the conservation of the world´s penguin species.",
      // },
    ],
    adventures: [
      {
        id: "arctic_tundra",
        name: "Arctic Tundra: Frozen Frontier",
        name_pt: "Tundra Ártica: Fronteira Congelada",
        name_th: "ทุนดราอาร์กติก: พรมแดนน้ำแข็ง",
        week: 1,
        ecosystemType: "tundra",
        description:
          "Explore the treeless plains of the Arctic and meet polar bears, Arctic foxes, and caribou.",
        description_pt:
          "Explore as planícies sem árvores do Ártico e conheça ursos polares, raposas árticas e caribus.",
        description_th:
          "สำรวจที่ราบไร้ต้นไม้ของอาร์กติกและพบกับหมีขั้วโลก สุนัขจิ้งจอกอาร์กติก และกวางแคริบู",
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
        name_th: "แอนตาร์กติกา: ทวีปน้ำแข็ง",
        week: 2,
        ecosystemType: "ice",
        description:
          "Journey to Earth's coldest continent and discover penguins, seals, and whales.",
        description_pt:
          "Viaje até o continente mais frio da Terra e descubra pinguins, focas e baleias.",
        description_th:
          "เดินทางสู่ทวีปที่หนาวที่สุดของโลกและค้นพบเพนกวิน แมวน้ำ และวาฬ",
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
        name_th: "กรีนแลนด์: ยักษ์ใหญ่ที่กำลังละลาย",
        week: 3,
        ecosystemType: "ice",
        description:
          "Understand the impact of climate change on the world's largest island.",
        description_pt:
          "Compreenda o impacto das mudanças climáticas na maior ilha do mundo.",
        description_th:
          "ทำความเข้าใจผลกระทบของการเปลี่ยนแปลงสภาพภูมิอากาศต่อเกาะที่ใหญ่ที่สุดในโลก",
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
        name_th: "แสงเหนือ: มนตร์แห่งออโรรา",
        week: 4,
        ecosystemType: "arctic",
        description:
          "Learn about the aurora borealis and life in the Arctic Circle.",
        description_pt:
          "Aprenda sobre a aurora boreal e a vida no Círculo Ártico.",
        description_th:
          "เรียนรู้เกี่ยวกับปรากฏการณ์แสงเหนือและชีวิตในเขตอาร์กติกเซอร์เคิล",
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
    name_th: "อเมริกาเหนือ",
    slug: "north-america",
    description:
      "From Arctic tundra to tropical forests, discover the diverse ecosystems of North America and Central America.",
    description_pt:
      "Da tundra ártica às florestas tropicais, descubra os diversos ecossistemas da América do Norte e da América Central.",
    description_th:
      "จากทุนดราอาร์กติกสู่ป่าเขตร้อน ค้นพบระบบนิเวศอันหลากหลายของอเมริกาเหนือและอเมริกากลาง",
    order: 7,
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
        name_th: "เยลโลว์สโตน: ธรรมชาติป่าเถื่อนของอเมริกา",
        week: 1,
        ecosystemType: "forest",
        description:
          "Explore geysers, hot springs, and the restoration of wolves in this iconic national park.",
        description_pt:
          "Explore gêiseres, fontes termais e a restauração de lobos neste parque nacional icônico.",
        description_th:
          "สำรวจน้ำพุร้อน บ่อน้ำแร่ร้อน และการฟื้นฟูประชากรหมาป่าในอุทยานแห่งชาติอันเป็นสัญลักษณ์แห่งนี้",
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
        name_th: "แนวปะการังแคริบเบียน: สวนใต้น้ำ",
        week: 2,
        ecosystemType: "coral_reef",
        description:
          "Dive into the vibrant coral reefs of the Caribbean and their conservation challenges.",
        description_pt:
          "Mergulhe nos vibrantes recifes de coral do Caribe e seus desafios de conservação.",
        description_th:
          "ดำดิ่งสู่แนวปะการังอันมีชีวิตชีวาของแคริบเบียนและความท้าทายในการอนุรักษ์",
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
        name_th: "การอพยพของผีเสื้อมอนาร์ก: การเดินทางมหากาพย์",
        week: 3,
        ecosystemType: "migration",
        description:
          "Follow the incredible 3,000-mile journey of monarch butterflies.",
        description_pt:
          "Acompanhe a incrível jornada de 4.800 quilômetros das borboletas-monarca.",
        description_th:
          "ติดตามการเดินทางอันน่าทึ่งระยะทาง 3,000 ไมล์ของผีเสื้อมอนาร์ก",
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
        name_th: "เอเวอร์เกลดส์: แม่น้ำแห่งทุ่งหญ้า",
        week: 4,
        ecosystemType: "wetlands",
        description:
          "Discover this unique subtropical wetland and its importance to Florida's ecosystem.",
        description_pt:
          "Descubra esta área úmida subtropical única e sua importância para o ecossistema da Flórida.",
        description_th:
          "ค้นพบพื้นที่ชุ่มน้ำกึ่งเขตร้อนอันเป็นเอกลักษณ์แห่งนี้และความสำคัญต่อระบบนิเวศของฟลอริดา",
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

  lost_worlds: {
    id: "lost_worlds",
    name: "Lost Worlds",
    name_pt: "Mundos Perdidos",
    name_th: "โลกที่สูญหาย",
    slug: "lost-worlds",
    description:
      "Find out about some of the extraordinary species that once inhabited this planet, but have disappeared because of environmental changes or human activity",
    description_pt:
      "Descubra algumas das espécies extraordinárias que outrora habitaram este planeta, mas que desapareceram devido a alterações ambientais ou à atividade humana.",
    description_th:
      "ค้นพบสิ่งมีชีวิตสายพันธุ์พิเศษที่เคยอาศัยอยู่บนโลกใบนี้ แต่ได้สูญหายไปเนื่องจากการเปลี่ยนแปลงของสิ่งแวดล้อมหรือกิจกรรมของมนุษย์",
    // description:
    //   "Journey through 4 billion years of Earth's history, from the first spark of life to the Ice Age. Meet dinosaurs, mammoths, and countless extinct species that once ruled our planet.",
    // description_pt:
    //   "Embarque em uma jornada através de 4 bilhões de anos da história da Terra, desde o primeiro vislumbre de vida até a Era do Gelo. Conheça dinossauros, mamutes e inúmeras espécies extintas que um dia dominaram nosso planeta.",
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
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/tyranosaurus-rex.jpg", // Placeholder - can
    // be replaced with prehistoric image
    heroUrl:
      "https://pqlrhabwbajghxjukgea.supabase.co/storage/v1/object/public/unit-images/worlds/woolly_mammoth_bbc.jpg", // Placeholder
    mapUrl: "/maps/lost-worlds.png", // Will need to be created
    ecoHeroUrl: "",
    adventures: [
      {
        id: "dawn_of_life",
        name: "Dawn of Life: Ancient Seas",
        name_pt: "Aurora da Vida: Mares Antigos",
        name_th: "รุ่งอรุณแห่งชีวิต: ทะเลโบราณ",
        week: 1,
        ecosystemType: "ancient_ocean",
        description:
          "Dive into Earth's primordial oceans 3.5 billion years ago. Discover the first microscopic life forms, stromatolites, and the strange creatures of the Cambrian Explosion that changed life forever.",
        description_pt:
          "Mergulhe nos oceanos primordiais da Terra há 3,5 bilhões de anos. Descubra as primeiras formas de vida microscópicas, estromatólitos e as estranhas criaturas da Explosão Cambriana que mudaram a vida para sempre.",
        description_th:
          "ดำดิ่งสู่มหาสมุทรดึกดำบรรพ์ของโลกเมื่อ 3,500 ล้านปีก่อน ค้นพบสิ่งมีชีวิตจุลทรรศน์กลุ่มแรก สโตรมาโตไลต์ และสิ่งมีชีวิตประหลาดจากการระเบิดแคมเบรียนที่เปลี่ยนแปลงชีวิตไปตลอดกาล",
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
        name_th: "ยุคไดโนเสาร์: ยักษ์ใหญ่แห่งมีโซโซอิก",
        week: 2,
        ecosystemType: "prehistoric",
        description:
          "Walk among the giants of the Mesozoic Era. Meet Tyrannosaurus rex, Triceratops, long-necked sauropods, and discover why these magnificent creatures vanished 66 million years ago.",
        description_pt:
          "Caminhe entre os gigantes da Era Mesozoica. Conheça o Tyrannosaurus rex, Triceratops, saurópodes de pescoço longo e descubra por que essas criaturas magníficas desapareceram há 66 milhões de anos.",
        description_th:
          "เดินท่ามกลางยักษ์ใหญ่แห่งยุคมีโซโซอิก พบกับไทแรนโนซอรัสเร็กซ์ ไทรเซอราทอปส์ ซอโรพอดคอยาว และค้นพบว่าเหตุใดสิ่งมีชีวิตอันยิ่งใหญ่เหล่านี้จึงสูญพันธุ์ไปเมื่อ 66 ล้านปีก่อน",
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
        name_th: "ยุคน้ำแข็ง: ยักษ์ใหญ่ที่ถูกแช่แข็ง",
        week: 3,
        ecosystemType: "ice_age",
        description:
          "Journey to the last Ice Age, just 10,000 years ago. Meet woolly mammoths, saber-toothed cats, giant ground sloths, and discover how humans lived alongside these incredible beasts.",
        description_pt:
          "Viaje à última Era do Gelo, há apenas 10.000 anos. Conheça mamutes lanosos, tigres-dentes-de-sabre, preguiças-gigantes e descubra como os humanos viveram ao lado dessas bestas incríveis.",
        description_th:
          "เดินทางย้อนสู่ยุคน้ำแข็งครั้งสุดท้ายเมื่อเพียง 10,000 ปีก่อน พบกับแมมมอธขนยาว แมวเขี้ยวดาบ สลอธพื้นดินยักษ์ และค้นพบว่ามนุษย์ใช้ชีวิตร่วมกับสัตว์มหัศจรรย์เหล่านี้อย่างไร",
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
        name_th: "การสูญพันธุ์ครั้งใหญ่: เรื่องราวแห่งการอยู่รอด",
        week: 4,
        ecosystemType: "extinction_events",
        description:
          "Explore Earth's five mass extinctions and the resilient species that survived. Learn about dodo birds, passenger pigeons, and what extinction teaches us about protecting life today.",
        description_pt:
          "Explore as cinco extinções em massa da Terra e as espécies resilientes que sobreviveram. Aprenda sobre os dodôs, pombos-passageiros e o que a extinção nos ensina sobre proteger a vida hoje.",
        description_th:
          "สำรวจการสูญพันธุ์ครั้งใหญ่ทั้งห้าครั้งของโลกและสิ่งมีชีวิตที่แข็งแกร่งซึ่งรอดชีวิตมาได้ เรียนรู้เกี่ยวกับนกโดโด นกพิราบอพยพ และบทเรียนจากการสูญพันธุ์ที่สอนเราเกี่ยวกับการปกป้องชีวิตในปัจจุบัน",
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
