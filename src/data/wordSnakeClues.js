/**
 * Word Snake Game - Environmental Clues
 *
 * Clues organized by difficulty level for educational word-building game.
 * Each clue has an answer that students must spell by collecting letters.
 */

export const WORD_CLUES = {
  beginner: [
    {
      id: 1,
      clue: "Largest animal on Earth",
      answer: "WHALE",
      hint: "Found in the ocean",
      fact: "Blue whales are the largest animals ever known to have lived on Earth, even bigger than the largest dinosaurs!",
    },
    {
      id: 2,
      clue: "Underwater forests made of this seaweed",
      answer: "KELP",
      hint: "Starts with K",
      fact: "Kelp forests can grow up to 45 meters tall and provide homes for thousands of marine species.",
    },
    {
      id: 3,
      clue: "Black and white bird that can't fly but swims",
      answer: "PENGUIN",
      hint: "Lives in cold places",
      fact: "Penguins are excellent swimmers and can hold their breath underwater for up to 20 minutes!",
    },
    {
      id: 4,
      clue: "Colorful structure built by tiny sea animals",
      answer: "CORAL",
      hint: "Forms reefs",
      fact: "Coral reefs cover less than 1% of the ocean floor but support 25% of all marine species!",
    },
    {
      id: 5,
      clue: "Green plant that produces oxygen",
      answer: "TREE",
      hint: "Has leaves and bark",
      fact: "A single tree can produce enough oxygen for two people to breathe for a year!",
    },
    {
      id: 6,
      clue: "The planet we live on",
      answer: "EARTH",
      hint: "Our home",
      fact: "Earth is the only known planet with liquid water on its surface, making life possible!",
    },
    {
      id: 7,
      clue: "Flying insect that makes honey",
      answer: "BEE",
      hint: "Buzzes around flowers",
      fact: "Bees pollinate about one-third of the food crops we eat!",
    },
    {
      id: 8,
      clue: "Largest land animal with a trunk",
      answer: "ELEPHANT",
      hint: "Found in Africa and Asia",
      fact: "Elephants are incredibly intelligent and have excellent memories. They can recognize themselves in mirrors!",
    },
  ],

  intermediate: [
    {
      id: 9,
      clue: "Dense forest near the equator with heavy rainfall",
      answer: "RAINFOREST",
      hint: "Amazon is an example",
      fact: "Rainforests produce 20% of Earth's oxygen and are home to over half of the world's plant and animal species!",
    },
    {
      id: 10,
      clue: "Process plants use to make food from sunlight",
      answer: "PHOTOSYNTHESIS",
      hint: "Uses chlorophyll",
      fact: "Photosynthesis converts carbon dioxide into oxygen, making it essential for all animal life on Earth!",
    },
    {
      id: 11,
      clue: "Coldest continent covered in ice",
      answer: "ANTARCTICA",
      hint: "Home to penguins",
      fact: "Antarctica contains 90% of the world's ice and 70% of its fresh water!",
    },
    {
      id: 12,
      clue: "Animals at risk of disappearing forever",
      answer: "ENDANGERED",
      hint: "Species that need protection",
      fact: "Over 41,000 species are currently threatened with extinction due to habitat loss and climate change.",
    },
    {
      id: 13,
      clue: "The variety of life in an ecosystem",
      answer: "BIODIVERSITY",
      hint: "Bio means life",
      fact: "Earth's biodiversity took billions of years to develop, but we're losing species faster than ever before.",
    },
    {
      id: 14,
      clue: "Layer of gas protecting Earth from UV rays",
      answer: "OZONE",
      hint: "In the stratosphere",
      fact: "The ozone layer is slowly recovering thanks to the global ban on harmful chemicals!",
    },
    {
      id: 15,
      clue: "Energy from the sun",
      answer: "SOLAR",
      hint: "Renewable energy",
      fact: "The sun provides enough energy in one hour to power the entire world for a year!",
    },
  ],

  advanced: [
    {
      id: 16,
      clue: "Gradual increase in Earth's temperature",
      answer: "GLOBAL WARMING",
      hint: "Climate crisis",
      fact: "The last decade was the hottest on record, with temperatures rising faster than at any time in the past 2,000 years.",
    },
    {
      id: 17,
      clue: "Place where an animal or plant naturally lives",
      answer: "HABITAT",
      hint: "Natural home",
      fact: "Habitat loss is the biggest threat to wildlife, affecting 85% of all threatened and endangered species.",
    },
    {
      id: 18,
      clue: "Materials that can be used again",
      answer: "RECYCLABLE",
      hint: "Reduce, reuse, ___",
      fact: "Recycling one aluminum can saves enough energy to power a TV for three hours!",
    },
    {
      id: 19,
      clue: "System of interacting organisms and environment",
      answer: "ECOSYSTEM",
      hint: "Web of life",
      fact: "Everything in an ecosystem is connected - removing one species can affect dozens of others!",
    },
    {
      id: 20,
      clue: "Animals that eat only plants",
      answer: "HERBIVORES",
      hint: "Not carnivores",
      fact: "Large herbivores like elephants and rhinos are ecosystem engineers - they shape entire landscapes!",
    },
    {
      id: 21,
      clue: "Turning waste into nutrient-rich soil",
      answer: "COMPOSTING",
      hint: "Natural recycling",
      fact: "Composting reduces methane emissions from landfills and creates rich soil for growing plants!",
    },
    {
      id: 22,
      clue: "Long-term weather patterns of a region",
      answer: "CLIMATE",
      hint: "Different from weather",
      fact: "Climate is what you expect, weather is what you get - climate is the average over many years!",
    },
  ],

  expert: [
    {
      id: 23,
      clue: "Type of energy that doesn't run out",
      answer: "RENEWABLE",
      hint: "Like wind and solar",
      fact: "Renewable energy could meet 80% of global energy needs by 2050!",
    },
    {
      id: 24,
      clue: "Complex network of feeding relationships",
      answer: "FOOD WEB",
      hint: "Who eats whom",
      fact: "Food webs show how energy flows through an ecosystem - they're much more complex than simple food chains!",
    },
    {
      id: 25,
      clue: "Gas that traps heat in the atmosphere",
      answer: "CARBON DIOXIDE",
      hint: "CO2",
      fact: "Carbon dioxide levels are higher now than at any time in the past 800,000 years!",
    },
    {
      id: 26,
      clue: "Preservation of the natural environment",
      answer: "CONSERVATION",
      hint: "Protecting nature",
      fact: "Conservation efforts have saved species like the giant panda and American bald eagle from extinction!",
    },
    {
      id: 27,
      clue: "Meeting needs without harming future generations",
      answer: "SUSTAINABILITY",
      hint: "Thinking long-term",
      fact: "Sustainable practices help ensure that resources will be available for our children and grandchildren!",
    },
    {
      id: 28,
      clue: "Frozen soil found in polar regions",
      answer: "PERMAFROST",
      hint: "Permanently frozen",
      fact: "Thawing permafrost releases ancient carbon, accelerating climate change!",
    },
  ],
};

/**
 * Get clues for a specific difficulty level
 */
export function getCluesByDifficulty(difficulty) {
  return WORD_CLUES[difficulty] || WORD_CLUES.beginner;
}

/**
 * Get all clues in order of difficulty
 */
export function getAllCluesProgressive() {
  return [
    ...WORD_CLUES.beginner,
    ...WORD_CLUES.intermediate,
    ...WORD_CLUES.advanced,
    ...WORD_CLUES.expert,
  ];
}

/**
 * Get a random clue from a difficulty level
 */
export function getRandomClue(difficulty) {
  const clues = WORD_CLUES[difficulty] || WORD_CLUES.beginner;
  return clues[Math.floor(Math.random() * clues.length)];
}

/**
 * Get clue by ID
 */
export function getClueById(id) {
  const allClues = getAllCluesProgressive();
  return allClues.find((clue) => clue.id === id);
}

/**
 * Difficulty thresholds for level progression
 */
export const DIFFICULTY_PROGRESSION = {
  beginner: { levels: [1, 2, 3, 4, 5, 6, 7, 8], speed: 180 },
  intermediate: { levels: [9, 10, 11, 12, 13, 14, 15], speed: 140 },
  advanced: { levels: [16, 17, 18, 19, 20, 21, 22], speed: 110 },
  expert: { levels: [23, 24, 25, 26, 27, 28], speed: 90 },
};

/**
 * Get difficulty for a given level number
 */
export function getDifficultyForLevel(levelNumber) {
  if (levelNumber <= 8) return "beginner";
  if (levelNumber <= 15) return "intermediate";
  if (levelNumber <= 22) return "advanced";
  return "expert";
}

/**
 * Calculate speed based on level
 */
export function getSpeedForLevel(levelNumber) {
  const difficulty = getDifficultyForLevel(levelNumber);
  const baseSpeed = DIFFICULTY_PROGRESSION[difficulty].speed;
  // Gradually increase speed within difficulty level
  const speedIncrease = (levelNumber % 7) * 5;
  return Math.max(60, baseSpeed - speedIncrease);
}
