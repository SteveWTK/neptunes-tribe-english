"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getLevelByValue, getAllLevels } from "@/config/levelsConfig";
import { Trophy, TrendingUp, ChevronDown, Check } from "lucide-react";

/**
 * LevelIndicator - Shows user's current difficulty level with filtering options
 *
 * Displays the user's current learning level with:
 * - Level icon and name
 * - Color-coded badge matching level theme
 * - For individual users: Interactive dropdown to filter content by level or view all
 * - For school users: Static display (no dropdown)
 *
 * @param {Object} props
 * @param {string} props.variant - Display variant: "badge" (compact), "card" (detailed), or "inline" (text only)
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onFilterChange - Optional callback when filter changes (receives selectedFilter value)
 */
export default function LevelIndicator({
  variant = "badge",
  className = "",
  onFilterChange,
}) {
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState(null);
  const [userType, setUserType] = useState(null);
  const [levelConfig, setLevelConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null); // null = all levels
  const dropdownRef = useRef(null);

  // Load user level and type from Supabase
  useEffect(() => {
    const fetchUserLevel = async () => {
      const userId = user?.userId || user?.id;

      if (!userId) {
        console.log("LevelIndicator: No user ID found");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("users")
          .select("current_level, user_type")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user level:", error);
          setLoading(false);
          return;
        }

        console.log("LevelIndicator: User data fetched:", data);

        const level = data?.current_level || "Level 1";
        const type = data?.user_type || "individual";
        setUserLevel(level);
        setUserType(type);

        // Get level configuration from levelsConfig
        const config = getLevelByValue(level);
        console.log("LevelIndicator: Level config found:", config);

        if (!config) {
          console.warn(`LevelIndicator: No config found for level "${level}"`);
          // Set a default config
          setLevelConfig({
            icon: "🌱",
            shortName: level,
            displayName: level,
            color: { primary: "#10b981" },
            description: level,
          });
        } else {
          setLevelConfig(config);
        }
      } catch (error) {
        console.error("Error in fetchUserLevel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLevel();
  }, [user]);

  // Load saved filter preference from localStorage (individual users only)
  useEffect(() => {
    if (userType === "individual") {
      const savedFilter = localStorage.getItem("level_filter");
      // null or "all" means all levels, otherwise it's a specific level value
      if (savedFilter === null) {
        // First time user - set default to "all"
        localStorage.setItem("level_filter", "all");
        setSelectedFilter(null);
      } else if (savedFilter === "all") {
        setSelectedFilter(null);
      } else {
        setSelectedFilter(savedFilter);
      }
    } else if (userType === "school") {
      // School users always see their assigned level
      setSelectedFilter(userLevel);
    }
  }, [userType, userLevel]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  const handleFilterChange = (newFilter) => {
    setSelectedFilter(newFilter);
    setIsDropdownOpen(false);

    // Save to localStorage
    if (newFilter === null) {
      localStorage.setItem("level_filter", "all");
    } else {
      localStorage.setItem("level_filter", newFilter);
    }

    // Notify parent component if callback provided
    if (onFilterChange) {
      onFilterChange(newFilter);
    }

    // Trigger page reload to apply filter
    window.location.reload();
  };

  const allLevels = getAllLevels();
  const isIndividual = userType === "individual";
  const displayConfig =
    selectedFilter === null
      ? { icon: "", shortName: "All Levels", color: { primary: "#6b7280" } }
      : getLevelByValue(selectedFilter) || levelConfig;

  if (loading || !levelConfig) {
    return null;
  }

  // Badge variant - compact display with dropdown for individual users
  if (variant === "badge") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => isIndividual && setIsDropdownOpen(!isDropdownOpen)}
          disabled={!isIndividual}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-primary-800 text-white shadow-sm transition-all ${
            isIndividual
              ? "cursor-pointer hover:shadow-md hover:scale-105"
              : "cursor-default"
          }`}
          // style={{ backgroundColor: displayConfig.color.primary }}
          title={
            isIndividual ? "Click to filter by level" : levelConfig.description
          }
        >
          <span className="text-base">{displayConfig.icon}</span>
          <span>{displayConfig.shortName}</span>
          {isIndividual && (
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {/* Dropdown menu for individual users */}
        {isIndividual && isDropdownOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white dark:bg-primary-800 rounded-lg shadow-xl border border-gray-200 dark:border-primary-700 py-2 min-w-[180px] z-50">
            {/* All Levels option */}
            <button
              onClick={() => handleFilterChange(null)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-primary-700 flex items-center justify-between ${
                selectedFilter === null
                  ? "bg-gray-50 dark:bg-gray-700/50 font-semibold"
                  : ""
              }`}
            >
              <span className="flex items-center gap-2">
                {/* <span className="text-base">🌍</span> */}
                <span className="text-gray-900 dark:text-white">
                  All Levels
                </span>
              </span>
              {selectedFilter === null && (
                <Check className="w-4 h-4 text-green-600" />
              )}
            </button>

            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

            {/* Individual level options */}
            {allLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => handleFilterChange(level.value)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                  selectedFilter === level.value
                    ? "bg-gray-50 dark:bg-gray-700/50 font-semibold"
                    : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{level.icon}</span>
                  <span className="text-gray-900 dark:text-white">
                    {level.shortName}
                  </span>
                </span>
                {selectedFilter === level.value && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 px-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Filter content by difficulty level
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Card variant - detailed display
  if (variant === "card") {
    return (
      <div
        className={`bg-white dark:bg-primary-800 rounded-lg border-2 p-4 ${className}`}
        style={{ borderColor: levelConfig.color.primary }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
            style={{ backgroundColor: levelConfig.color.primary }}
          >
            {levelConfig.icon}
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Your Level
            </div>
            <div className="font-bold text-gray-900 dark:text-white">
              {levelConfig.displayName}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {levelConfig.description}
        </p>
      </div>
    );
  }

  // Inline variant - simple text with icon
  if (variant === "inline") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-sm font-medium ${className}`}
        style={{ color: levelConfig.color.primary }}
      >
        <span>{levelConfig.icon}</span>
        <span>{levelConfig.shortName}</span>
      </span>
    );
  }

  return null;
}
