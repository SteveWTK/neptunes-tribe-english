// app/eco-map/EcoMapClient.js - Updated to pass weekly theme data
"use client";

import EcoMapProgressOceanZones from "@/components/EcoMapProgressOceanZones";
import RegionExplorer from "@/components/RegionExplorer";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Lightbulb,
  TrendingUp,
  Trophy,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function EcoMapClient({
  firstName,
  completedUnitsCount,
  completedCountriesCount,
  completedOceanZonesCount,
  totalPoints,
  currentLevel,
  highlightedRegions,
  completedUnitsByCountry,
  highlightedOceanZones,
  completedUnitsByOcean,
  allAvailableRegions,
  allAvailableMarineZones,
  ecosystemProgress = {},
  lastActivityDate = null,
  currentWeeklyTheme = null,
  themeImages = [],
}) {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [userChallengeProgress, setUserChallengeProgress] = useState({});
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEcosystemProgress, setShowEcosystemProgress] = useState(false);

  const t = {
    en: {
      title: "Welcome to your virtual eco-journey around the world",
      subTitle: "Click on the map to view units related to that region",
      weeklyThemeTitle: "This Week's Adventure",
      exploreTheme: "Start Adventure",
      exploreWorlds: "Explore the Planet",
      worldsSubtitle: "Begin your adventure into the 8 Worlds",
      impactTitle: "Keep increasing your impact",
      impactSubtitle:
        "Explore more ecosystems and complete environmental challenges to expand your impact!",
      continueLearning: "View all Units",
    },
    pt: {
      title: "Bem-vindo à sua jornada ecológica virtual ao redor do mundo",
      subTitle:
        "Clique no mapa para visualizar as unidades relacionadas àquela região",
      weeklyThemeTitle: "Aventura desta Semana",
      exploreTheme: "Iniciar Aventura",
      exploreWorlds: "Explore o Planeta",
      worldsSubtitle: "Inicie a sua aventura pelos 8 Mundos",
      impactTitle: "Continue aumentando seu impacto",
      impactSubtitle:
        "Explore mais ecossistemas e conclua desafios ambientais para expandir seu impacto!",
      continueLearning: "Veja todas as unidades",
    },
  };

  const copy = t[lang];

  // Process ecosystem data (your existing code)
  const completedUnitsByEcosystem = {
    marine: ecosystemProgress.marine?.units_completed || 0,
    forest: ecosystemProgress.forest?.units_completed || 0,
    polar: ecosystemProgress.polar?.units_completed || 0,
    grassland: ecosystemProgress.grassland?.units_completed || 0,
    mountains: ecosystemProgress.mountains?.units_completed || 0,
    freshwater: ecosystemProgress.freshwater?.units_completed || 0,
  };

  // Ecosystem definitions (your existing code)
  const ecosystems = [
    {
      id: "marine",
      name: "Marine Guardian",
      icon: "🌊",
      color: "blue",
      description: "Protect marine life and ocean ecosystems",
      unitsCompleted: completedUnitsByEcosystem.marine || 0,
      levels: [
        { name: "Tide Pool Explorer", requirement: 1, badge: "🐚" },
        { name: "Coral Protector", requirement: 3, badge: "🪸" },
        { name: "Deep Sea Guardian", requirement: 6, badge: "🐋" },
        { name: "Marine Master", requirement: 10, badge: "🌊" },
      ],
    },
    {
      id: "forest",
      name: "Forest Protector",
      icon: "🌳",
      color: "green",
      description: "Safeguard forests and woodland creatures",
      unitsCompleted: completedUnitsByEcosystem.forest || 0,
      levels: [
        { name: "Seedling Tender", requirement: 1, badge: "🌱" },
        { name: "Tree Hugger", requirement: 3, badge: "🌳" },
        { name: "Forest Ranger", requirement: 6, badge: "🦉" },
        { name: "Woodland Master", requirement: 10, badge: "🍃" },
      ],
    },
    {
      id: "polar",
      name: "Polar Defender",
      icon: "❄️",
      color: "cyan",
      description: "Champion polar regions and ice habitats",
      unitsCompleted: completedUnitsByEcosystem.polar || 0,
      levels: [
        { name: "Ice Walker", requirement: 1, badge: "🧊" },
        { name: "Penguin Friend", requirement: 3, badge: "🐧" },
        { name: "Polar Guardian", requirement: 6, badge: "🐻‍❄️" },
        { name: "Polar Master", requirement: 10, badge: "❄️" },
      ],
    },
    {
      id: "grassland",
      name: "Grassland Keeper",
      icon: "🌾",
      color: "yellow",
      description: "Preserve savannas and prairie ecosystems",
      unitsCompleted: completedUnitsByEcosystem.grassland || 0,
      levels: [
        { name: "Prairie Walker", requirement: 1, badge: "🌾" },
        { name: "Savanna Scout", requirement: 3, badge: "🦓" },
        { name: "Grassland Guardian", requirement: 6, badge: "🦁" },
        { name: "Plains Master", requirement: 10, badge: "🌅" },
      ],
    },
    {
      id: "mountains",
      name: "Mountain Guardian",
      icon: "🏔️",
      color: "gray",
      description: "Protect mountain ecosystems and alpine wildlife",
      unitsCompleted: completedUnitsByEcosystem.mountains || 0,
      levels: [
        { name: "Valley Explorer", requirement: 1, badge: "⛰️" },
        { name: "Peak Climber", requirement: 3, badge: "🏔️" },
        { name: "Alpine Guardian", requirement: 6, badge: "🦅" },
        { name: "Mountain Master", requirement: 10, badge: "🏔️" },
      ],
    },
    {
      id: "freshwater",
      name: "Freshwater Protector",
      icon: "💧",
      color: "teal",
      description: "Safeguard rivers, lakes, and freshwater ecosystems",
      unitsCompleted: completedUnitsByEcosystem.freshwater || 0,
      levels: [
        { name: "Stream Walker", requirement: 1, badge: "💧" },
        { name: "River Guardian", requirement: 3, badge: "🏞️" },
        { name: "Lake Protector", requirement: 6, badge: "🦆" },
        { name: "Freshwater Master", requirement: 10, badge: "🌊" },
      ],
    },
  ];

  // Fetch challenge data (your existing code)
  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        setLoading(true);

        const challengesResponse = await fetch("/api/challenges/active");
        let challengesData = [];
        if (challengesResponse.ok) {
          challengesData = await challengesResponse.json();
          setActiveChallenges(challengesData);
        }

        const userProgressResponse = await fetch(
          "/api/user/challenge-progress"
        );
        if (userProgressResponse.ok) {
          const progressData = await userProgressResponse.json();
          setUserChallengeProgress(progressData.challengeProgress || {});
        }

        const totalChallenges = challengesData?.length || 0;
        const completedChallenges =
          challengesData?.filter((c) => c.completion_percentage >= 100)
            .length || 0;
        const totalParticipants =
          challengesData?.reduce(
            (sum, c) => sum + (c.participants_count || 0),
            0
          ) || 0;

        setGlobalStats({
          totalChallenges,
          completedChallenges,
          totalParticipants,
        });
      } catch (error) {
        console.error("Error fetching challenge data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeData();
  }, []);

  // Get challenge summary (your existing code)
  const getChallengesSummary = () => {
    if (!activeChallenges.length) return null;

    const urgentChallenges = activeChallenges.filter((c) => {
      const daysLeft = c.end_date
        ? Math.ceil((new Date(c.end_date) - new Date()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysLeft <= 3;
    });

    const userTotalContributions = Object.values(userChallengeProgress).reduce(
      (sum, progress) => sum + (progress.units_contributed || 0),
      0
    );

    return {
      urgent: urgentChallenges.length,
      userContributions: userTotalContributions,
      globalProgress: Math.round(
        activeChallenges.reduce(
          (sum, c) => sum + (c.completion_percentage || 0),
          0
        ) / activeChallenges.length
      ),
    };
  };

  // Get current level for each ecosystem (your existing code)
  const getEcosystemLevel = (ecosystem) => {
    const completed = ecosystem.unitsCompleted;
    for (let i = ecosystem.levels.length - 1; i >= 0; i--) {
      if (completed >= ecosystem.levels[i].requirement) {
        return { ...ecosystem.levels[i], index: i };
      }
    }
    return null;
  };

  const challengesSummary = getChallengesSummary();

  return (
    <div className="pt-4">
      {/* Header Section */}
      <div className="text-center mb-4">
        <h1 className="text-xl lg:text-2xl text-primary-800 dark:text-[#e5e7eb] font-bold mb-2 mx-2">
          {copy.title}!
        </h1>
        {/* <p className="text-md text-gray-600 dark:text-gray-400">
          {copy.subTitle}
        </p> */}
      </div>

      {/* Weekly Theme Banner */}
      {/* {currentWeeklyTheme && (
        <div className="max-w-6xl mx-auto mb-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-600 via-primary-700 to-green-600 dark:from-primary-800 dark:via-primary-900 dark:to-accent-700 text-white rounded-xl p-4 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <div>
                  <div className="flex justify-center sm:justify-start items-center gap-3">
                    <Calendar className="w-4 h-4" />
                    <span className="text-center sm:text-start">
                      {copy.weeklyThemeTitle}
                    </span>
                  </div>
                  <h3 className="text-center sm:text-start text-2xl font-bold">
                    {lang === "pt"
                      ? currentWeeklyTheme.theme_title_pt
                      : currentWeeklyTheme.theme_title}
                  </h3>
                </div>
              </div>
              <Link
                href={`/adventures`}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                {copy.exploreTheme}
                <MapPin className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      )} */}

      {/* New: Prominent Worlds CTA */}
      <div className="max-w-6xl mx-auto mb-8 px-4">
        <Link href="/worlds">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-primary-600 to-accent-600 dark:from-primary-700 dark:to-accent-700 rounded-2xl px-8 pt-2 pb-1 text-white hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            // className="bg-primary-600 dark:bg-primary-700 rounded-2xl px-8 pt-2 pb-1 text-white hover:shadow-2xl transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  {/* <span>🌍</span> */}
                  {copy.exploreWorlds}
                </h2>
                <p className="text-white/90 text-lg mb-2">
                  {copy.worldsSubtitle}
                </p>
                {/* <div className="flex gap-3 flex-wrap">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    7 Worlds
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    28 Adventures
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    100+ Activities
                  </span>
                </div> */}
              </div>
              <div className="hidden md:block ml-6">
                <div className="bg-white/10 rounded-full p-3 group-hover:bg-white/20 transition-all">
                  <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Main Map Section */}
      <div data-tour="eco-map" className="max-w-6xl mx-auto space-y-8">
        <EcoMapProgressOceanZones
          highlightedRegions={highlightedRegions}
          completedUnitsByCountry={completedUnitsByCountry}
          highlightedOceanZones={highlightedOceanZones}
          completedUnitsByOcean={completedUnitsByOcean}
          challenges={activeChallenges}
          userChallengeProgress={userChallengeProgress}
          currentWeeklyTheme={currentWeeklyTheme}
          themeImages={themeImages}
        />

        {/* Ecosystem Progress Toggle Section (your existing code) */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Environmental Mastery Progress
            </h2>
            <button
              onClick={() => setShowEcosystemProgress(!showEcosystemProgress)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {showEcosystemProgress ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showEcosystemProgress ? "Hide" : "Show"} Progress Bars
            </button>
          </div>

          <AnimatePresence>
            {showEcosystemProgress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
              >
                {ecosystems.map((ecosystem) => {
                  const currentLevel = getEcosystemLevel(ecosystem);
                  const nextLevel = currentLevel
                    ? ecosystem.levels[currentLevel.index + 1]
                    : ecosystem.levels[0];

                  return (
                    <div
                      key={ecosystem.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{ecosystem.icon}</span>
                          <div>
                            <h4 className="font-semibold text-sm">
                              {ecosystem.name}
                            </h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {ecosystem.description}
                            </p>
                          </div>
                        </div>

                        {currentLevel && (
                          <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs">
                            {currentLevel.badge} {currentLevel.name}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            Progress: {ecosystem.unitsCompleted} units
                          </span>
                          {nextLevel && (
                            <span className="text-gray-500">
                              Next: {nextLevel.requirement} units
                            </span>
                          )}
                        </div>

                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 bg-${ecosystem.color}-500`}
                            style={{
                              width: nextLevel
                                ? `${Math.min(
                                    100,
                                    (ecosystem.unitsCompleted /
                                      nextLevel.requirement) *
                                      100
                                  )}%`
                                : "100%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Region Explorer Section */}
        <RegionExplorer
          completedUnitsByCountry={completedUnitsByCountry}
          completedUnitsByOcean={completedUnitsByOcean}
          highlightedRegions={highlightedRegions}
          highlightedOceanZones={highlightedOceanZones}
          allAvailableRegions={allAvailableRegions}
          allAvailableMarineZones={allAvailableMarineZones}
        />
      </div>

      {/* Enhanced Call to Action Section */}
      {/* <div className="max-w-4xl mx-auto mt-12">
        {completedUnitsCount > 0 ? (
          <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">{copy.impactTitle}</h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {copy.impactSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/units"
                className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg hover:bg-[#059669] transition-colors font-medium"
              >
                {copy.continueLearning}
              </Link>
              <Link
                href="/eco-news"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Neptune&apos;s News
              </Link>
              {currentWeeklyTheme && (
                <Link
                  href={`/units?theme=${currentWeeklyTheme.id}`}
                  className="inline-block bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {copy.exploreTheme}
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">
                Start Your Environmental Journey!
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Complete your first unit to see countries and marine ecosystems
              light up on your eco-map!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/units"
                className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg hover:bg-[#059669] transition-colors font-medium"
              >
                Start Learning
              </Link>
              {currentWeeklyTheme && (
                <Link
                  href={`/units?theme=${currentWeeklyTheme.id}`}
                  className="inline-block bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  {copy.exploreTheme}
                </Link>
              )}
              <Link
                href="/pricing"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Go Premium
              </Link>
            </div>
          </div>
        )}
      </div> */}
    </div>
  );
}
