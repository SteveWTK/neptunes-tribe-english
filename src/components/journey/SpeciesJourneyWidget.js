"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  TrendingUp,
  Target,
  Camera,
  Trophy,
  ChevronRight,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

// IUCN Status configuration
const IUCN_LEVELS = [
  { code: "EX", label: "Extinct", labelPt: "Extinto", color: "#000000" },
  { code: "EW", label: "Extinct in Wild", labelPt: "Extinto na Natureza", color: "#1f2937" },
  { code: "CR", label: "Critically Endangered", labelPt: "Criticamente em Perigo", color: "#dc2626" },
  { code: "EN", label: "Endangered", labelPt: "Em Perigo", color: "#f97316" },
  { code: "VU", label: "Vulnerable", labelPt: "Vulnerável", color: "#eab308" },
  { code: "NT", label: "Near Threatened", labelPt: "Quase Ameaçado", color: "#84cc16" },
  { code: "LC", label: "Least Concern", labelPt: "Menor Preocupação", color: "#22c55e" },
];

export default function SpeciesJourneyWidget({ compact = false }) {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const router = useRouter();

  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNarrative, setShowNarrative] = useState(false);
  const [narrativeMessage, setNarrativeMessage] = useState(null);

  // Fetch journey data
  useEffect(() => {
    if (!session) return;

    const fetchJourney = async () => {
      try {
        const response = await fetch("/api/user/journey");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch journey");
        }

        setJourney(data.journey);

        // Show narrative if there's a new one
        if (data.journey?.current_narrative && !data.journey?.narrative_shown) {
          setNarrativeMessage(data.journey.current_narrative);
          setShowNarrative(true);
        }
      } catch (err) {
        console.error("Error fetching journey:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, [session]);

  // Get current status position in the progression
  const getStatusIndex = (status) => {
    return IUCN_LEVELS.findIndex((l) => l.code === status);
  };

  // Format narrative message with species name
  const formatNarrative = (message) => {
    if (!message || !journey?.species_avatar) return message;
    return message.replace(
      /{species}/g,
      lang === "pt"
        ? journey.species_avatar.common_name_pt || journey.species_avatar.common_name
        : journey.species_avatar.common_name
    );
  };

  if (!session) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent-600 dark:text-accent-400" />
      </div>
    );
  }

  // No journey started - prompt to select avatar
  if (!journey) {
    return (
      <div className="bg-gradient-to-br from-accent-50 to-blue-50 dark:from-accent-900/30 dark:to-blue-900/30 rounded-xl shadow-sm p-6 text-center">
        <Leaf className="w-12 h-12 text-accent-500 mx-auto mb-3" />
        <h3 className="font-bold text-gray-800 dark:text-white mb-2">
          {lang === "pt" ? "Comece sua Jornada" : "Start Your Journey"}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {lang === "pt"
            ? "Escolha uma espécie ameaçada para proteger e ajude-a a se recuperar!"
            : "Choose an endangered species to protect and help them recover!"}
        </p>
        <Link
          href="/select-avatar"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent-600 text-white font-medium rounded-lg hover:bg-accent-700 transition-colors"
        >
          {lang === "pt" ? "Escolher Espécie" : "Choose Species"}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const avatar = journey.species_avatar;
  const currentStatusIndex = getStatusIndex(journey.current_iucn_status);
  const currentLevel = IUCN_LEVELS[currentStatusIndex];
  const startingStatusIndex = getStatusIndex(journey.starting_iucn_status);

  // Compact version for header
  if (compact) {
    return (
      <Link
        href="/journey"
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-100 to-blue-100 dark:from-accent-900/50 dark:to-blue-900/50 flex items-center justify-center overflow-hidden">
          {avatar?.avatar_image_url ? (
            <img
              src={avatar.avatar_image_url}
              alt={avatar.common_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Leaf className="w-5 h-5 text-accent-500" />
          )}
        </div>

        {/* Status Bar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-800 dark:text-white">
              {avatar?.common_name}
            </span>
            <span className="text-xs font-bold" style={{ color: currentLevel?.color }}>
              {currentLevel?.label}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${journey.level_progress || 0}%`,
                backgroundColor: currentLevel?.color,
              }}
            />
          </div>
        </div>
      </Link>
    );
  }

  // Full widget
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div
          className="p-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${currentLevel?.color} 0%, ${
              IUCN_LEVELS[Math.max(0, currentStatusIndex - 1)]?.color || currentLevel?.color
            } 100%)`,
          }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/50">
              {avatar?.avatar_image_url ? (
                <img
                  src={avatar.avatar_image_url}
                  alt={avatar.common_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Leaf className="w-8 h-8 text-white" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {lang === "pt"
                  ? avatar?.common_name_pt || avatar?.common_name
                  : avatar?.common_name}
              </h3>
              <p className="text-sm opacity-90 italic">{avatar?.scientific_name}</p>
            </div>

            {/* Status Badge */}
            <div className="text-right">
              <div className="text-xs opacity-75 mb-1">
                {lang === "pt" ? "Status Atual" : "Current Status"}
              </div>
              <div className="font-bold">
                {lang === "pt" ? currentLevel?.labelPt : currentLevel?.label}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-4">
          {/* IUCN Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>
                {lang === "pt" ? "Progresso de Recuperação" : "Recovery Progress"}
              </span>
              <span>{journey.total_points?.toLocaleString()} pts</span>
            </div>

            {/* Visual Status Progression */}
            <div className="relative">
              <div className="flex items-center gap-1">
                {IUCN_LEVELS.slice(startingStatusIndex).map((level, i) => {
                  const actualIndex = startingStatusIndex + i;
                  const isPast = actualIndex > currentStatusIndex;
                  const isCurrent = actualIndex === currentStatusIndex;
                  const isComplete = actualIndex < currentStatusIndex;

                  return (
                    <div key={level.code} className="flex-1">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          isCurrent ? "ring-2 ring-offset-1 dark:ring-offset-gray-800" : ""
                        }`}
                        style={{
                          backgroundColor: isComplete || isCurrent ? level.color : "#374151",
                          ringColor: level.color,
                          opacity: isPast ? 0.3 : 1,
                        }}
                      >
                        {isCurrent && (
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${journey.level_progress || 0}%`,
                              backgroundColor: level.color,
                              filter: "brightness(0.8)",
                            }}
                          />
                        )}
                      </div>
                      <div className="text-center mt-1">
                        <span
                          className={`text-[10px] font-medium ${
                            isPast ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {level.code}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <Camera className="w-5 h-5 text-accent-600 dark:text-accent-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                {journey.observations_count || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {lang === "pt" ? "Observações" : "Observations"}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                {journey.challenges_completed || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {lang === "pt" ? "Desafios" : "Challenges"}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                {journey.total_points?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {lang === "pt" ? "Pontos" : "Points"}
              </div>
            </div>
          </div>

          {/* Next Level Info */}
          {journey.next_level_threshold && (
            <div className="bg-accent-50 dark:bg-accent-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-accent-700 dark:text-accent-300">
                <Target className="w-4 h-4" />
                <span>
                  {lang === "pt"
                    ? `${(journey.next_level_threshold.points_required - journey.total_points).toLocaleString()} pontos para ${
                        IUCN_LEVELS.find((l) => l.code === journey.next_level_threshold.to_status)
                          ?.labelPt
                      }`
                    : `${(journey.next_level_threshold.points_required - journey.total_points).toLocaleString()} points to ${
                        IUCN_LEVELS.find((l) => l.code === journey.next_level_threshold.to_status)
                          ?.label
                      }`}
                </span>
              </div>
            </div>
          )}

          {/* View Full Journey Link */}
          <Link
            href="/journey"
            className="block mt-4 text-center text-sm text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium"
          >
            {lang === "pt" ? "Ver Jornada Completa" : "View Full Journey"} →
          </Link>
        </div>
      </div>

      {/* Narrative Popup */}
      <AnimatePresence>
        {showNarrative && narrativeMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNarrative(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="text-5xl text-center mb-4">
                {narrativeMessage.icon || "🌱"}
              </div>

              {/* Message */}
              <p className="text-lg text-gray-800 dark:text-white text-center leading-relaxed mb-6">
                {formatNarrative(
                  lang === "pt"
                    ? narrativeMessage.message_pt || narrativeMessage.message
                    : narrativeMessage.message
                )}
              </p>

              <button
                onClick={() => setShowNarrative(false)}
                className="w-full py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold rounded-lg transition-colors"
              >
                {lang === "pt" ? "Continuar" : "Continue"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
