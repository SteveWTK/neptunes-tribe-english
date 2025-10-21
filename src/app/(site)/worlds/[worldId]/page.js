"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Globe,
  TreePine,
  Mountain,
  Waves,
  ChevronRight,
  ChevronLeft,
  Calendar,
  BookOpen,
  Sparkles,
  Play,
  Lock,
  CheckCircle,
  MapPin,
  Clock,
  Award,
  Home,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getWorldBySlug } from "@/data/worldsConfig";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

// Icon mapping
const ICON_MAP = {
  TreePine: TreePine,
  Mountain: Mountain,
  Waves: Waves,
  Globe: Globe,
  Snowflake: Waves,
};

// Ecosystem icon mapping
const ECOSYSTEM_ICONS = {
  rainforest: TreePine,
  mountain: Mountain,
  ocean: Waves,
  coral_reef: Waves,
  islands: Globe,
  wetlands: Waves,
  forest: TreePine,
  desert: Mountain,
  savanna: Globe,
  tundra: Mountain,
  ice: Waves,
  arctic: Waves,
  taiga: TreePine,
  mediterranean: Globe,
  kelp_forest: Waves,
  deep_sea: Waves,
  migration: Globe,
};

function WorldDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [world, setWorld] = useState(null);
  const [selectedAdventure, setSelectedAdventure] = useState(null);
  const [adventureData, setAdventureData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load world from config using slug (URL parameter uses hyphens)
    const worldData = getWorldBySlug(params.worldId);
    if (worldData) {
      setWorld(worldData);
      // Auto-select first adventure
      if (worldData.adventures.length > 0) {
        setSelectedAdventure(worldData.adventures[0]);
      }
    }
    setLoading(false);
  }, [params.worldId]);

  useEffect(() => {
    // Load units and lessons for selected adventure
    if (selectedAdventure && user) {
      loadAdventureContent(selectedAdventure);
    }
  }, [selectedAdventure, user]);

  const loadAdventureContent = async (adventure) => {
    try {
      const supabase = createClient();

      // Load units with this theme tag
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("*")
        .contains("theme_tags", [adventure.themeTag])
        .limit(6);

      // Load lessons with this theme tag
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("is_active", true)
        .contains("theme_tags", [adventure.themeTag])
        .order("sort_order")
        .limit(5);

      setAdventureData((prev) => ({
        ...prev,
        [adventure.id]: {
          units: unitsData || [],
          lessons: lessonsData || [],
        },
      }));
    } catch (error) {
      console.error("Error loading adventure content:", error);
    }
  };

  const getIcon = (iconName) => {
    const IconComponent = ICON_MAP[iconName] || Globe;
    return IconComponent;
  };

  const getEcosystemIcon = (ecosystemType) => {
    const IconComponent = ECOSYSTEM_ICONS[ecosystemType] || Globe;
    return IconComponent;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!world) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            World Not Found
          </h2>
          <button
            onClick={() => router.push("/worlds")}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700"
          >
            Return to Worlds
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = getIcon(world.icon);
  const currentData = selectedAdventure
    ? adventureData[selectedAdventure.id] || { units: [], lessons: [] }
    : { units: [], lessons: [] };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => router.push("/eco-map")}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <button
              onClick={() => router.push("/worlds")}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Worlds
            </button>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 dark:text-white font-medium">
              {world.name}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-white relative overflow-hidden min-h-[400px]">
        {/* Background Image Layer */}
        {world.heroUrl ? (
          <div className="absolute inset-0">
            <Image
              src={world.heroUrl}
              alt={world.name}
              fill
              className="object-cover"
              priority
            />
            {/* Dark overlay for text readability */}
            {/* <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${world.color.primary}DD 0%, ${world.color.secondary}DD 10%, ${world.color.primary}AA 20%)`,
              }}
            /> */}
          </div>
        ) : (
          // Fallback gradient if no image
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${world.color.primary} 0%, ${world.color.secondary} 100%)`,
            }}
          />
        )}

        {/* Content Layer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex items-start gap-6">
            <div
              className="hidden md:block w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl backdrop-blur-sm"
              style={{ backgroundColor: `${world.color.primary}CC` }}
            >
              {world.mapUrl ? (
                <Image
                  src={world.mapUrl}
                  alt={world.name}
                  fill
                  className="object-cover rounded-2xl p-[3px]"
                  priority
                />
              ) : (
                <IconComponent className="w-12 h-12" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {/* <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg backdrop-blur-sm"
                  style={{ backgroundColor: `${world.color.dark}CC` }}
                >
                  {world.order}
                </div> */}
                <div className="text-white/90 text-sm font-medium bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                  World {world.order}
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                {world.name}
              </h1>
              <p className="text-xl text-white/95 max-w-3xl drop-shadow-md bg-black/20 backdrop-blur-sm rounded-lg p-4">
                {world.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">
                    {world.adventures.length} Adventures
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">4 Weeks of Learning</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">Earn XP & Badges</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background elements (only if no image) */}
        {!world.imageUrl && (
          <div className="absolute inset-0 opacity-10">
            <IconComponent className="absolute top-10 right-10 w-64 h-64 transform rotate-12" />
            <IconComponent className="absolute bottom-10 left-10 w-48 h-48 transform -rotate-12" />
          </div>
        )}
      </div>

      {/* Adventures Timeline */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Weekly Adventures
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose an adventure to explore its units and lessons
          </p>
        </div>

        {/* Adventure Cards - Timeline Style */}
        <Link href="#content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {world.adventures.map((adventure, index) => {
              const EcoIcon = getEcosystemIcon(adventure.ecosystemType);
              const isSelected =
                selectedAdventure && selectedAdventure.id === adventure.id;
              const totalContent =
                (currentData.units?.length || 0) +
                (currentData.lessons?.length || 0);

              return (
                <motion.div
                  key={adventure.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedAdventure(adventure)}
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected ? "scale-105" : "hover:scale-102"
                  }`}
                >
                  <div
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary-500 shadow-xl"
                        : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {/* Week Badge */}
                    <div
                      className="h-1"
                      style={{ backgroundColor: world.color.primary }}
                    />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: world.color.primary }}
                        >
                          Week {adventure.week}
                        </div>
                        <EcoIcon
                          className="w-6 h-6"
                          style={{ color: world.color.primary }}
                        />
                      </div>

                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[3rem]">
                        {adventure.name}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {adventure.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>
                            {isSelected && totalContent > 0
                              ? `${totalContent} activities`
                              : "View content"}
                          </span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Link>

        {/* Selected Adventure Content */}
        <div id="content">
          <AnimatePresence mode="wait">
            {selectedAdventure && (
              <motion.div
                key={selectedAdventure.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
              >
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="px-4 py-2 rounded-lg text-white font-bold"
                      style={{ backgroundColor: world.color.primary }}
                    >
                      Week {selectedAdventure.week}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedAdventure.name}
                    </h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedAdventure.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Units */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <BookOpen
                        className="w-5 h-5"
                        style={{ color: world.color.primary }}
                      />
                      Foundation Units
                    </h3>
                    {currentData.units && currentData.units.length > 0 ? (
                      <div className="space-y-3">
                        {currentData.units.map((unit) => (
                          <div
                            key={unit.id}
                            onClick={() => router.push(`/units/${unit.id}`)}
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {unit.title}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {unit.length || 5} min
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-gray-500 dark:text-gray-400">
                        No units available yet
                      </div>
                    )}
                  </div>

                  {/* Lessons */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles
                        className="w-5 h-5"
                        style={{ color: world.color.secondary }}
                      />
                      Activities
                    </h3>
                    {currentData.lessons && currentData.lessons.length > 0 ? (
                      <div className="space-y-3">
                        {currentData.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            onClick={() =>
                              !lesson.under_construction &&
                              router.push(`/lesson/${lesson.id}`)
                            }
                            className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all border border-gray-200 dark:border-gray-600 ${
                              lesson.under_construction
                                ? "opacity-60 cursor-not-allowed"
                                : "hover:shadow-md cursor-pointer"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                  {lesson.title}
                                  {lesson.under_construction && (
                                    <Lock className="w-3 h-3 text-gray-400" />
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {lesson.content?.steps?.length || 0} steps
                                </div>
                              </div>
                              {lesson.under_construction ? (
                                <div className="text-xs text-gray-500">
                                  Soon
                                </div>
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-gray-500 dark:text-gray-400">
                        No lessons available yet
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      // Navigate to first available unit or lesson
                      if (currentData.units && currentData.units.length > 0) {
                        router.push(`/units/${currentData.units[0].id}`);
                      } else if (
                        currentData.lessons &&
                        currentData.lessons.length > 0 &&
                        !currentData.lessons[0].under_construction
                      ) {
                        router.push(`/lesson/${currentData.lessons[0].id}`);
                      }
                    }}
                    className="w-full md:w-auto px-8 py-4 rounded-lg text-white font-bold text-lg transition-all hover:shadow-lg flex items-center justify-center gap-3"
                    style={{ backgroundColor: world.color.primary }}
                    disabled={
                      (!currentData.units || currentData.units.length === 0) &&
                      (!currentData.lessons || currentData.lessons.length === 0)
                    }
                  >
                    <Play className="w-6 h-6" />
                    Start This Adventure
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function WorldDetailPage() {
  return (
    <ProtectedRoute>
      <WorldDetailContent />
    </ProtectedRoute>
  );
}
