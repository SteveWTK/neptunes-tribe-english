"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Flower2,
  Sun,
  Leaf,
  Snowflake,
  Globe,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";

// Season configurations with colors and icons
const SEASON_CONFIG = {
  spring: {
    name: "Spring",
    name_pt: "Primavera",
    icon: Flower2,
    gradient: "from-emerald-400 via-green-400 to-lime-400",
    bgLight: "bg-gradient-to-r from-emerald-50 to-lime-50",
    bgDark:
      "dark:bg-gradient-to-r dark:from-emerald-950/50 dark:to-lime-950/50",
    textColor: "text-emerald-700 dark:text-emerald-300",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    progressBg: "bg-emerald-100 dark:bg-emerald-900/50",
    progressFill: "bg-gradient-to-r from-emerald-400 to-lime-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    emoji: "🌸",
  },
  summer: {
    name: "Summer",
    name_pt: "Verão",
    icon: Sun,
    gradient: "from-amber-400 via-orange-400 to-yellow-400",
    bgLight: "bg-gradient-to-r from-amber-50 to-yellow-50",
    bgDark:
      "dark:bg-gradient-to-r dark:from-amber-950/50 dark:to-yellow-950/50",
    textColor: "text-amber-700 dark:text-amber-300",
    accentColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800",
    progressBg: "bg-amber-100 dark:bg-amber-900/50",
    progressFill: "bg-gradient-to-r from-amber-400 to-orange-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    emoji: "☀️",
  },
  autumn: {
    name: "Autumn",
    name_pt: "Outono",
    icon: Leaf,
    gradient: "from-orange-400 via-red-400 to-amber-500",
    bgLight: "bg-gradient-to-r from-orange-50 to-red-50",
    bgDark: "dark:bg-gradient-to-r dark:from-orange-950/50 dark:to-red-950/50",
    textColor: "text-orange-700 dark:text-orange-300",
    accentColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800",
    progressBg: "bg-orange-100 dark:bg-orange-900/50",
    progressFill: "bg-gradient-to-r from-orange-400 to-red-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    emoji: "🍂",
  },
  winter: {
    name: "Winter",
    name_pt: "Inverno",
    icon: Snowflake,
    gradient: "from-blue-400 via-cyan-400 to-slate-400",
    bgLight: "bg-gradient-to-r from-blue-50 to-slate-50",
    bgDark: "dark:bg-gradient-to-r dark:from-blue-950/50 dark:to-slate-950/50",
    textColor: "text-blue-700 dark:text-blue-300",
    accentColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    progressBg: "bg-blue-100 dark:bg-blue-900/50",
    progressFill: "bg-gradient-to-r from-blue-400 to-cyan-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    emoji: "❄️",
  },
};

export default function SeasonProgressBar({ lang = "en" }) {
  const { data: session } = useSession();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const response = await fetch("/api/user/season-progress");
        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress);
        }
      } catch (err) {
        console.error("Error fetching season progress:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [session]);

  // Don't render if not logged in or still loading
  if (!session || loading) {
    if (loading && session) {
      return (
        <div className="h-14 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      );
    }
    return null;
  }

  // Don't render if no progress data
  if (!progress) {
    return null;
  }

  const seasonConfig =
    SEASON_CONFIG[progress.currentSeason] || SEASON_CONFIG.spring;
  const SeasonIcon = seasonConfig.icon;
  const worldName =
    lang === "pt"
      ? progress.currentWorld?.name_pt || progress.currentWorld?.name
      : progress.currentWorld?.name;

  return (
    <div
      className={`${seasonConfig.bgLight} ${seasonConfig.bgDark} border-b ${seasonConfig.borderColor}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Season & World Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Season Icon */}
            <div
              className={`flex-shrink-0 w-9 h-9 rounded-full ${seasonConfig.iconBg} flex items-center justify-center`}
            >
              <SeasonIcon className={`w-5 h-5 ${seasonConfig.accentColor}`} />
            </div>

            {/* Season & World Text */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${seasonConfig.textColor}`}
                >
                  {/* {seasonConfig.emoji}{" "} */}
                  {lang === "pt" ? seasonConfig.name_pt : seasonConfig.name}
                  {progress.seasonCycle === 2 && (
                    <span className="ml-1 text-xs opacity-70">II</span>
                  )}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span
                  className={`text-sm ${seasonConfig.accentColor} truncate`}
                >
                  World {progress.currentWorldIndex + 1}: {worldName}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Time */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Progress Bar */}
            <div className="hidden sm:flex items-center gap-2">
              <div
                className={`w-32 h-2 rounded-full ${seasonConfig.progressBg} overflow-hidden`}
              >
                <div
                  className={`h-full ${seasonConfig.progressFill} rounded-full transition-all duration-500`}
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Time Remaining */}
            <div className="flex items-center gap-1.5">
              <Clock className={`w-4 h-4 ${seasonConfig.accentColor}`} />
              <span className={`text-sm font-medium ${seasonConfig.textColor}`}>
                {progress.daysRemaining}
                <span className="hidden sm:inline"> days left</span>
                <span className="sm:hidden">d</span>
              </span>
            </div>

            {/* Link to Worlds */}
            {/* <Link
              href="/worlds"
              className={`hidden md:flex items-center gap-1 text-sm ${seasonConfig.accentColor} hover:opacity-80 transition-opacity`}
            >
              <Globe className="w-4 h-4" />
              <span>Explore</span>
              <ChevronRight className="w-4 h-4" />
            </Link> */}
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="sm:hidden mt-2">
          <div
            className={`w-full h-1.5 rounded-full ${seasonConfig.progressBg} overflow-hidden`}
          >
            <div
              className={`h-full ${seasonConfig.progressFill} rounded-full transition-all duration-500`}
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
