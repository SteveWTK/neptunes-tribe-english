"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  TreePine,
  Mountain,
  Waves,
  MapPin,
  ChevronRight,
  Award,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getAllWorlds } from "@/data/worldsConfig";
import { translateWorlds } from "@/utils/i18n";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { motion } from "framer-motion";
import RestartOnboardingButton from "@/components/onboarding/RestartOnboardingButton";
import LevelIndicator from "@/components/LevelIndicator";

// Icon mapping for Lucide icons
const ICON_MAP = {
  TreePine: TreePine,
  Mountain: Mountain,
  Waves: Waves,
  Globe: Globe,
  Snowflake: Waves, // Using Waves as placeholder for Snowflake
};

function WorldsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLanguage(); // Get current language
  const [worlds, setWorlds] = useState([]);
  const [hoveredWorld, setHoveredWorld] = useState(null);
  const [hoveredHero, setHoveredHero] = useState(null);
  // Track current hero index for each world (worldId -> heroIndex)
  const [currentHeroIndexes, setCurrentHeroIndexes] = useState({});

  useEffect(() => {
    // Load worlds from config and translate based on current language
    const allWorlds = getAllWorlds();
    const translatedWorlds = translateWorlds(allWorlds, lang);
    setWorlds(translatedWorlds);

    // Initialize hero indexes to 0 for each world (only on first load)
    if (Object.keys(currentHeroIndexes).length === 0) {
      const initialIndexes = {};
      allWorlds.forEach((world) => {
        initialIndexes[world.id] = 0;
      });
      setCurrentHeroIndexes(initialIndexes);
    }
  }, [lang]); // Re-run when language changes

  // Carousel: Rotate heroes every 4 seconds
  useEffect(() => {
    if (worlds.length === 0) return;

    const interval = setInterval(() => {
      setCurrentHeroIndexes((prevIndexes) => {
        const newIndexes = { ...prevIndexes };
        worlds.forEach((world) => {
          // Only rotate if world has multiple heroes
          const heroes = world.ecoHeroes || [];
          if (heroes.length > 1) {
            const currentIndex = newIndexes[world.id] || 0;
            newIndexes[world.id] = (currentIndex + 1) % heroes.length;
          }
        });
        return newIndexes;
      });
    }, 4000); // Change hero every 4 seconds

    return () => clearInterval(interval);
  }, [worlds]);

  const getIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || Globe;
    return IconComponent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-primary-900 dark:to-primary-800 pb-6">
      {/* Hero Section */}
      <div className=" text-primary-950 dark:text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Help Button - Top Right */}
          {/* <div className="flex justify-end mb-0">
            <RestartOnboardingButton variant="icon" />
          </div> */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center relative"
          >
            <div className="inline-flex items-center gap-3 mb-6">
              {/* <Globe className="w-12 h-12" /> */}
              <h1 className="text-4xl md:text-5xl font-bold">
                Explore Our Planet
              </h1>
            </div>
            <p className="text-xl text-primary-950/90 dark:text-white/90 max-w-3xl mx-auto mb-2">
              Journey through 8 incredible Worlds.
            </p>

            {/* Level Indicator - Center */}
            <div className="flex justify-center mt-4 mb-2">
              <LevelIndicator variant="badge" />
            </div>

            <RestartOnboardingButton
              variant="icon"
              className="absolute bottom-0 right-0"
            />

            {/* Quick Stats */}
            {/* <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">7</div>
                <div className="text-sm text-white/80">Worlds</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">28</div>
                <div className="text-sm text-white/80">Adventures</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-sm text-white/80">Units & Lessons</div>
              </div>
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* Worlds Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {worlds.map((world, index) => {
            const IconComponent = getIcon(world.icon);
            const isHovered = hoveredWorld === world.id;

            return (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onHoverStart={() => setHoveredWorld(world.id)}
                onHoverEnd={() => setHoveredWorld(null)}
                onClick={() => router.push(`/worlds/${world.slug}`)}
                className="group cursor-pointer"
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                  {/* Colored Header Band */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: world.color.primary }}
                  />

                  {/* World Number Badge */}
                  <div className="absolute top-6 left-6 z-10">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: world.color.primary }}
                    >
                      {world.order}
                    </div>
                  </div>
                  {world.coming_soon && (
                    <div className="absolute top-6 right-4 z-10">
                      <div
                        className="text-white/90 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm"
                        style={{
                          backgroundColor: world.color.primary,
                          opacity: 0.9,
                        }}
                      >
                        {world.next_week ? "Coming next!" : "Coming soon!"}
                      </div>
                    </div>
                  )}

                  {/* Image/Map Placeholder */}
                  <div
                    className="h-48 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${world.color.light} 0%, ${world.color.primary}20 100%)`,
                    }}
                  >
                    {world.imageUrl ? (
                      <img
                        src={world.imageUrl}
                        alt={world.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IconComponent
                          className="w-24 h-24 opacity-30"
                          style={{ color: world.color.primary }}
                        />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Icon in corner - Eco Hero Carousel */}
                    <div className="absolute bottom-4 right-4">
                      {(() => {
                        // Get current hero for this world
                        const heroes = world.ecoHeroes || [];
                        const hasHeroes = heroes.length > 0;
                        const currentHeroIndex =
                          currentHeroIndexes[world.id] || 0;
                        const currentHero = heroes[currentHeroIndex];

                        // Fallback to legacy single hero if no heroes array
                        const heroImageUrl =
                          currentHero?.imageUrl || world.ecoHeroUrl;
                        const heroName = currentHero?.name || world.ecoHeroName;

                        return heroImageUrl ? (
                          <div
                            className="relative"
                            onMouseEnter={() => setHoveredHero(world.id)}
                            onMouseLeave={() => setHoveredHero(null)}
                          >
                            {/* Hero Image with fade transition */}
                            <img
                              key={`${world.id}-${currentHeroIndex}`}
                              src={heroImageUrl}
                              alt={heroName}
                              style={{ backgroundColor: world.color.primary }}
                              className="w-12 h-12 rounded-full p-[2px] object-cover shadow-lg md:cursor-help transition-opacity duration-500"
                            />

                            {/* Carousel indicators (dots) - only show if multiple heroes */}
                            {heroes.length > 1 && (
                              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                                {heroes.map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                      idx === currentHeroIndex
                                        ? "bg-white scale-110"
                                        : "bg-white/50"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Hero Name Tooltip - Always visible on mobile (<md), hover-only on desktop (>=md) */}
                            {heroName && (
                              <div
                                key={`tooltip-${world.id}-${currentHeroIndex}`}
                                className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 text-white text-sm rounded-lg shadow-xl whitespace-nowrap z-20 transition-opacity duration-300
                                  ${
                                    hoveredHero === world.id
                                      ? "opacity-100"
                                      : "opacity-0 pointer-events-none"
                                  }
                                  max-md:opacity-100 max-md:pointer-events-auto
                                `}
                                style={{ backgroundColor: world.color.primary }}
                              >
                                {heroName}
                                {/* Arrow */}
                                <div
                                  className="absolute top-full right-4 -mt-1 w-2 h-2 transform rotate-45"
                                  style={{
                                    backgroundColor: world.color.primary,
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg"
                            style={{ color: world.color.primary }}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                      {world.name}
                      <ChevronRight
                        className={`w-6 h-6 text-gray-400 transition-transform ${
                          isHovered ? "translate-x-1" : ""
                        }`}
                      />
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                      {world.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                      {/* <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>{world.adventures.length} Adventures</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>4 Weeks</span>
                      </div> */}
                    </div>

                    {/* Adventure Preview */}
                    {/* <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                        Adventures Include:
                      </p>
                      <div className="space-y-1">
                        {world.adventures.slice(0, 2).map((adventure) => (
                          <div
                            key={adventure.id}
                            className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: world.color.primary }}
                            />
                            <span className="line-clamp-1">
                              {adventure.name}
                            </span>
                          </div>
                        ))}
                        {world.adventures.length > 2 && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 pl-3.5">
                            +{world.adventures.length - 2} more...
                          </div>
                        )}
                      </div>
                    </div> */}

                    {/* CTA Button */}
                    <button
                      className="mt-6 w-full py-3 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
                      style={{
                        backgroundColor: world.color.primary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          world.color.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          world.color.primary;
                      }}
                    >
                      <span>Start Exploring</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function WorldsPage() {
  return (
    <ProtectedRoute>
      <WorldsContent />
    </ProtectedRoute>
  );
}
