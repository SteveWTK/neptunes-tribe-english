// app/eco-map/EcoMapClient.js - Updated to pass weekly theme data
"use client";

import { ContentPinsMap } from "@inspire/shared";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  MapPin,
  ChevronRight,
  Globe,
  BookOpen,
  Binoculars,
  PawPrint,
  Camera,
  ChevronLeft,
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
      worldsSubtitle: "Start your adventure",
      vocabularySubtitle: "Your vocabulary",
      observationsSubtitle: "Observations",
      avatarSubtitle: "Avatars",
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
      worldsSubtitle: "Inicie sua aventura",
      vocabularySubtitle: "Seu vocabulário",
      observationsSubtitle: "Observações",
      avatarSubtitle: "Avatares",
      impactTitle: "Continue aumentando seu impacto",
      impactSubtitle:
        "Explore mais ecossistemas e conclua desafios ambientais para expandir seu impacto!",
      continueLearning: "Veja todas as unidades",
    },
    th: {
      title: "ยินดีต้อนรับสู่การเดินทางเชิงนิเวศเสมือนจริงรอบโลกของคุณ",
      subTitle: "คลิกบนแผนที่เพื่อดูบทเรียนที่เกี่ยวข้องกับภูมิภาคนั้น",
      weeklyThemeTitle: "การผจญภัยประจำสัปดาห์นี้",
      exploreTheme: "เริ่มการผจญภัย",
      exploreWorlds: "สำรวจโลก",
      worldsSubtitle: "เริ่มต้นการผจญภัยของคุณ",
      vocabularySubtitle: "คำศัพท์ของคุณ",
      observationsSubtitle: "การสังเกต",
      avatarSubtitle: "อวาตาร์",
      impactTitle: "เพิ่มผลกระทบของคุณต่อไป",
      impactSubtitle:
        "สำรวจระบบนิเวศเพิ่มเติมและทำภารกิจด้านสิ่งแวดล้อมให้สำเร็จเพื่อขยายผลกระทบของคุณ!",
      continueLearning: "ดูบทเรียนทั้งหมด",
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
      {/* <div className="text-center mb-2">
        <h1 className="text-xl lg:text-2xl text-primary-800 dark:text-[#e5e7eb] font-bold mb-2 mx-2">
          {copy.title}!
        </h1>
        <p className="text-md text-gray-600 dark:text-gray-400">
          {copy.subTitle}
        </p>
      </div> */}

      {/* Wildlife Observations Map Section */}
      <div className="px-4 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-primary-800 dark:text-white">
            <Camera className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            {lang === "pt"
              ? "Observações da Comunidade"
              : "Community Observations"}
          </h2>
          <Link
            href="/observations"
            className="text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium flex items-center gap-1"
          >
            {lang === "pt" ? "Ver todas" : "View all"}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {lang === "pt"
            ? "Explore observações de vida selvagem compartilhadas pela comunidade ao redor do mundo"
            : "Explore wildlife observations shared by the community around the world"}
        </p> */}
        {/* Using shared ContentPinsMap from @inspire/shared */}
        <ContentPinsMap
          apiEndpoint="/api/observations/map"
          showFilters={true}
          initialFilter="global"
          maxPins={100}
          className="shadow-lg"
          detailPagePath="/observations/{id}"
          emptyState={{
            title: lang === "pt" ? "Nenhuma observação ainda" : "No observations yet",
            mineMessage: lang === "pt" ? "Crie sua primeira observação!" : "Create your first observation!",
            globalMessage: lang === "pt" ? "Seja o primeiro a adicionar" : "Be the first to add one",
            createLabel: lang === "pt" ? "Adicionar Observação" : "Add Observation",
            createPath: "/observations/create",
          }}
          translations={{
            pins: lang === "pt" ? "observações" : "observations",
            loadingMap: lang === "pt" ? "Carregando mapa..." : "Loading map...",
          }}
        />
      </div>
    </div>
  );
}
