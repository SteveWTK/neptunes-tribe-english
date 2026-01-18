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
  Award,
  Home,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getWorldBySlug } from "@/data/worldsConfig";
import { translateWorld } from "@/utils/i18n";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  getLessonsForUser,
  getAvailableAdventures,
} from "@/lib/supabase/lesson-queries";
import LevelIndicator from "@/components/LevelIndicator";
import LessonLevelBadge from "@/components/LessonLevelBadge";
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
  ancient_ocean: Waves,
  prehistoric: Mountain,
  ice_age: Mountain,
  extinction_events: Globe,
};

function WorldDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { lang } = useLanguage(); // Get current language
  const [world, setWorld] = useState(null);
  const [filteredAdventures, setFilteredAdventures] = useState([]);
  const [selectedAdventure, setSelectedAdventure] = useState(null);
  const [adventureData, setAdventureData] = useState({});
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [viewingAllLevels, setViewingAllLevels] = useState(false);
  const [hoveredHero, setHoveredHero] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      if (!user?.id && !user?.userId) return;

      try {
        const supabaseClient = createClient();
        const userId = user.userId || user.id;

        const { data, error } = await supabaseClient
          .from("users")
          .select("user_type, is_premium")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        const type = data?.user_type || "individual";
        const premium = data?.is_premium || false;
        setUserType(type);
        setIsPremiumUser(premium);

        // Check if viewing all levels (individual users only)
        if (type === "individual" && typeof window !== "undefined") {
          const levelFilter = localStorage.getItem("level_filter");
          setViewingAllLevels(levelFilter === "all" || levelFilter === null);
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
      }
    }

    fetchUserData();
  }, [user]);

  useEffect(() => {
    // Load world from config using slug (URL parameter uses hyphens)
    const loadWorldData = async () => {
      const worldData = getWorldBySlug(params.worldId);

      // Translate world data based on current language
      const translatedWorld = worldData
        ? translateWorld(worldData, lang)
        : null;

      if (translatedWorld && user) {
        setWorld(translatedWorld);

        // Filter adventures by user's level and type (use original worldData for adventures)
        const userId = user.userId || user.id;
        const availableAdventures = await getAvailableAdventures(
          userId,
          worldData.id,
          translatedWorld.adventures // Use translated adventures
        );

        console.log(`🎮 Available adventures for user:`, availableAdventures);
        setFilteredAdventures(availableAdventures);

        // Auto-select first adventure that has lessons
        const firstWithLessons = availableAdventures.find(
          (adv) => adv.hasLessons
        );
        if (firstWithLessons) {
          setSelectedAdventure(firstWithLessons);
        } else if (availableAdventures.length > 0) {
          // If no adventures have lessons, select the first one anyway
          setSelectedAdventure(availableAdventures[0]);
        }
      } else if (translatedWorld) {
        // Fallback if no user (shouldn't happen with ProtectedRoute)
        setWorld(translatedWorld);
        setFilteredAdventures(translatedWorld.adventures);
        if (translatedWorld.adventures.length > 0) {
          setSelectedAdventure(translatedWorld.adventures[0]);
        }
      }
      setLoading(false);
    };

    loadWorldData();
  }, [params.worldId, user, lang]); // Re-run when language changes

  // Carousel: Rotate through eco heroes every 4 seconds
  useEffect(() => {
    if (!world) return;

    const heroes = world.ecoHeroes || [];

    // Only set up carousel if there are multiple heroes
    if (heroes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => {
        // Move to next hero, loop back to 0 at the end
        return (prevIndex + 1) % heroes.length;
      });
    }, 4000); // Change hero every 4 seconds

    // Cleanup: clear interval when component unmounts or world changes
    return () => clearInterval(interval);
  }, [world]); // Re-run if world changes

  useEffect(() => {
    // Load units and lessons for selected adventure
    if (selectedAdventure && user) {
      loadAdventureContent(selectedAdventure);
    }
  }, [selectedAdventure, user]);

  useEffect(() => {
    // Handle anchor scrolling after content loads
    if (typeof window !== "undefined" && window.location.hash === "#content") {
      // Wait for content to render, then scroll
      setTimeout(() => {
        const element = document.getElementById("content");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    }
  }, [adventureData, selectedAdventure]);

  const loadAdventureContent = async (adventure) => {
    try {
      const supabase = createClient();

      // Load lessons filtered by user's level and type
      const userId = user.userId || user.id;
      const lessonsData = await getLessonsForUser(
        userId,
        world.id,
        adventure.themeTag
      );

      console.log(
        `📚 Loaded ${lessonsData?.length || 0} lessons for user at their level`
      );

      // Load all units for this adventure
      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("id, title, image, length")
        .contains("theme_tags", [adventure.themeTag]);

      if (unitsError) console.error("Error loading units:", unitsError);

      console.log(
        `📦 Loaded ${unitsData?.length || 0} units for theme '${
          adventure.themeTag
        }':`,
        unitsData?.map((u) => ({ id: u.id, title: u.title }))
      );

      // Create a map of unit_id -> unit for quick lookup
      const unitsMap = {};
      (unitsData || []).forEach((unit) => {
        unitsMap[unit.id] = unit;
      });

      // Attach unit data to lessons based on unit_reference steps
      const lessonsWithUnits = (lessonsData || []).map((lesson) => {
        // Find first unit_reference step in lesson content
        const unitStep = lesson.content?.steps?.find(
          (step) => step.type === "unit_reference"
        );
        const unitId = unitStep?.unit_id;
        const unit = unitId ? unitsMap[unitId] : null;

        // Debug logging
        console.log("Lesson:", lesson.title);
        console.log("Unit step found:", unitStep);
        console.log("Unit ID:", unitId);
        console.log("Unit data:", unit);
        console.log("---");

        return {
          ...lesson,
          unit: unit || null,
        };
      });

      console.log("Units map:", unitsMap);
      console.log("Final lessons with units:", lessonsWithUnits);

      setAdventureData((prev) => ({
        ...prev,
        [adventure.id]: {
          lessons: lessonsWithUnits,
        },
      }));

      // Load lesson completions for the user
      if ((user?.userId || user?.id) && lessonsWithUnits.length > 0) {
        console.log("📚 Calling loadLessonCompletions with user:", user);
        loadLessonCompletions(lessonsWithUnits.map((l) => l.id));
      } else {
        console.log("⚠️ Not loading completions:", {
          hasUserId: !!(user?.userId || user?.id),
          hasLessons: lessonsWithUnits.length > 0,
          user,
        });
      }
    } catch (error) {
      console.error("Error loading adventure content:", error);
    }
  };

  const loadLessonCompletions = async (lessonIds) => {
    try {
      const supabase = createClient();
      const userId = user.userId || user.id;

      console.log(
        "🔍 Loading completions for user:",
        userId,
        "lessons:",
        lessonIds
      );

      const { data, error } = await supabase
        .from("lesson_completions")
        .select("lesson_id")
        .eq("user_id", userId)
        .in("lesson_id", lessonIds);

      if (error) {
        console.error("Error loading lesson completions:", error);
        return;
      }

      console.log("✅ Completions data from DB:", data);
      const completedSet = new Set(data.map((c) => c.lesson_id));
      setCompletedLessons(completedSet);
      console.log("✅ Completed lessons set:", Array.from(completedSet));
    } catch (error) {
      console.error("Error loading lesson completions:", error);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => router.push("/dashboard")}
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
            {/* Level Indicator */}
            <LevelIndicator variant="badge" />
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
              className="object-cover object-[50%_30%]"
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
                {world.coming_soon && (
                  <div className="z-10">
                    <div
                      className="text-white/90 bg-black/20 text-sm font-medium px-3 py-1 rounded-full backdrop-blur-sm"
                      // style={{
                      //   backgroundColor: world.color.primary,
                      //   opacity: 0.9,
                      // }}
                    >
                      {world.next_week ? "Coming next!" : "Coming soon!"}
                    </div>
                  </div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                {world.name}
              </h1>
              <p className="text-xl text-white/95 max-w-3xl drop-shadow-md bg-black/20 backdrop-blur-sm rounded-lg p-4">
                {world.description}
              </p>

              {/* Stats */}
              {/* <div className="flex flex-wrap gap-3 mt-6">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">
                    {world.adventures.length} Adventures
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Calendar className="w-5 h-5" />
                  {userType === "school" ? (
                    <span className="font-medium">4 Weeks of Learning</span>
                  ) : (
                    <span className="font-medium">Learn at your own page</span>
                  )}
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">Earn XP & Badges</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* {world.coming_soon && (
          <div className="absolute top-6 right-6 z-10">
            <div
              className="text-white/90 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm"
              style={{
                backgroundColor: world.color.primary,
                opacity: 0.9,
              }}
            >
              {world.next_week ? "Coming next week!" : "Coming soon!"}
            </div>
          </div>
        )} */}

        {/* Eco Hero Carousel - Bottom Right Corner */}
        <div className="absolute bottom-4 right-4">
          {(() => {
            // Get current hero for this world
            const heroes = world.ecoHeroes || [];
            const currentHero = heroes[currentHeroIndex];

            // Fallback to legacy single hero if no heroes array
            const heroImageUrl = currentHero?.imageUrl || world.ecoHeroUrl;
            const heroName = currentHero?.name || world.ecoHeroName;

            return heroImageUrl ? (
              <div
                className="relative"
                onMouseEnter={() => setHoveredHero(true)}
                onMouseLeave={() => setHoveredHero(false)}
              >
                {/* Hero Image with fade transition */}
                <img
                  key={`hero-${currentHeroIndex}`}
                  src={heroImageUrl}
                  alt={heroName}
                  style={{ backgroundColor: world.color.primary }}
                  className="w-12 lg:w-24 h-12 lg:h-24 rounded-full p-[2px] object-cover shadow-lg md:cursor-help transition-opacity duration-500"
                />

                {/* Carousel indicators (dots) - only show if multiple heroes */}
                {heroes.length > 1 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {heroes.map((_, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
                    key={`tooltip-${currentHeroIndex}`}
                    className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 text-white text-sm lg:text-base rounded-lg shadow-xl whitespace-nowrap z-20 transition-opacity duration-300
                      ${
                        hoveredHero
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
                      style={{ backgroundColor: world.color.primary }}
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
            Adventures
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose an adventure to explore its units and lessons
          </p>
        </div>

        {/* Adventure Cards - Timeline Style */}
        <Link href="#content">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredAdventures.map((adventure, index) => {
              const EcoIcon = getEcosystemIcon(adventure.ecosystemType);
              const isSelected =
                selectedAdventure && selectedAdventure.id === adventure.id;
              const hasLessons = adventure.lessonCount > 0;
              const isPremiumContent = adventure.is_premium;
              const hasAccess = !isPremiumContent || isPremiumUser;

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
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border-2 transition-all relative ${
                      isSelected
                        ? "border-primary-500 shadow-xl"
                        : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                    } ${!hasAccess ? "opacity-90" : ""}`}
                  >
                    {/* Premium Badge */}
                    {isPremiumContent && (
                      <div className="absolute top-6 right-2 text-accent-600 dark:text-accent-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
                        Premium
                      </div>
                    )}

                    {/* Adventure Badge */}
                    <div
                      className="h-1"
                      style={{ backgroundColor: world.color.primary }}
                    />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: world.color.primary }}
                          >
                            {userType === "school" ? "Week" : "Adventure"}{" "}
                            {adventure.week}
                          </div>
                          {(!hasLessons || adventure.underConstruction) && (
                            <Lock
                              className="w-3 h-3 text-gray-400"
                              title={
                                !hasLessons
                                  ? "No lessons at your level yet"
                                  : "Under Construction"
                              }
                            />
                          )}
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
                          {!hasAccess ? (
                            <>
                              <Lock className="w-3 h-3" />
                              <span className="text-accent-600 dark:text-accent-400 font-semibold">
                                Upgrade to Unlock
                              </span>
                            </>
                          ) : (
                            <>
                              {/* <BookOpen className="w-3 h-3" /> */}
                              <span>
                                {/* {hasLessons
                                  ? `${adventure.lessonCount} lesson${
                                      adventure.lessonCount !== 1 ? "s" : ""
                                    }`
                                  : "Coming soon"} */}
                                {world.coming_soon
                                  ? world.next_week
                                    ? "Coming next week!"
                                    : "Coming soon!"
                                  : "Explore"}
                              </span>
                            </>
                          )}
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
                      {userType === "school" ? "Week" : "Adventure"}{" "}
                      {selectedAdventure.week}
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
                  {/* Learning Activities */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Sparkles
                        className="w-5 h-5"
                        style={{ color: world.color.primary }}
                      />
                      Learning Activities
                    </h3>
                    {currentData.lessons && currentData.lessons.length > 0 ? (
                      <div className="space-y-3">
                        {currentData.lessons.map((lesson) => {
                          const isCompleted = completedLessons.has(lesson.id);
                          const isPremiumAdventure =
                            selectedAdventure?.is_premium;
                          const canAccessLesson =
                            !isPremiumAdventure || isPremiumUser;
                          console.log(
                            `Lesson ${lesson.id} (${lesson.title}):`,
                            {
                              isCompleted,
                              completedLessons: Array.from(completedLessons),
                              hasUnit: !!lesson.unit,
                              unitImage: lesson.unit?.image,
                            }
                          );
                          return (
                            <div
                              key={lesson.id}
                              onClick={() => {
                                if (!canAccessLesson) {
                                  router.push("/subscriptions");
                                } else if (!lesson.under_construction) {
                                  router.push(`/lesson/${lesson.id}`);
                                }
                              }}
                              className={`p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all border border-gray-200 dark:border-gray-600 relative ${
                                lesson.under_construction
                                  ? "opacity-60 cursor-not-allowed"
                                  : canAccessLesson
                                  ? "hover:shadow-md cursor-pointer"
                                  : "opacity-75 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                    {lesson.title}
                                    {!canAccessLesson && (
                                      <span className="text-xs text-accent-600 dark:text-accent-400 font-semibold flex items-center gap-1">
                                        <Lock className="w-3 h-3" />
                                        Upgrade to Unlock
                                      </span>
                                    )}
                                    {lesson.under_construction && (
                                      <Lock className="w-3 h-3 text-gray-400" />
                                    )}
                                    {isCompleted && canAccessLesson && (
                                      <CheckCircle
                                        className="w-4 h-4"
                                        style={{ color: world.color.primary }}
                                        title="Completed"
                                      />
                                    )}
                                  </div>
                                  <div className="flex gap-2 items-center py-2">
                                    {/* Show level badge when viewing all levels */}
                                    {viewingAllLevels && lesson.difficulty && (
                                      <LessonLevelBadge
                                        difficulty={lesson.difficulty}
                                        size="sm"
                                      />
                                    )}
                                    {/* Show difficulty text when not viewing all levels */}
                                    {!viewingAllLevels && (
                                      <div
                                        className="text-sm text-gray-600 dark:text-gray-400"
                                        style={{ color: world.color.light }}
                                      >
                                        {lesson.difficulty}
                                      </div>
                                    )}
                                    {/* <span className="text-sm text-gray-600 dark:text-gray-400">
                                      •
                                    </span>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {lesson.content?.steps?.length || 0}{" "}
                                      activities
                                    </div> */}
                                  </div>
                                </div>

                                <div className="flex gap-3 items-center">
                                  {/* Unit Image */}
                                  {lesson.unit?.image && (
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                      <Image
                                        src={lesson.unit.image}
                                        alt={lesson.unit.title || "Unit"}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  {!lesson.unit?.image && (
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                      <Image
                                        src={selectedAdventure.adventureUrl}
                                        alt={selectedAdventure.name || "Unit"}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )}
                                  {lesson.under_construction ? (
                                    <div className="text-xs text-gray-500">
                                      Soon
                                    </div>
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-gray-500 dark:text-gray-400">
                        No learning activities available yet
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {selectedAdventure?.is_premium && !isPremiumUser ? (
                    <Link
                      href="/subscriptions"
                      className="w-full md:w-auto px-8 py-4 rounded-lg text-accent-600 dark:text-accent-400 font-bold text-lg transition-all hover:shadow-lg flex items-center justify-center gap-3"
                    >
                      <Lock className="w-6 h-6" />
                      Upgrade to Unlock This Adventure
                    </Link>
                  ) : (
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
                        (!currentData.units ||
                          currentData.units.length === 0) &&
                        (!currentData.lessons ||
                          currentData.lessons.length === 0)
                      }
                    >
                      <Play className="w-6 h-6" />
                      Start This Adventure
                    </button>
                  )}
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
