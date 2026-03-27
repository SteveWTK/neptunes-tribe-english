"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { getLevelByValue, getAllLevels } from "@/config/levelsConfig";
import { ChevronDown, Check, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * FloatingLevelIndicator - A floating level selector that appears when scrolling
 *
 * Shows when the user scrolls past the main navigation, providing easy access
 * to level switching while browsing lessons.
 *
 * @param {Object} props
 * @param {number} props.showAfterScroll - Pixels to scroll before showing (default: 200)
 * @param {string} props.className - Additional CSS classes
 */
export default function FloatingLevelIndicator({
  showAfterScroll = 200,
  className = "",
}) {
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState(null);
  const [userType, setUserType] = useState(null);
  const [levelConfig, setLevelConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const dropdownRef = useRef(null);

  // Load user level and type from Supabase
  useEffect(() => {
    const fetchUserLevel = async () => {
      const userId = user?.userId || user?.id;

      if (!userId) {
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
          setLoading(false);
          return;
        }

        const level = data?.current_level || "Level 1";
        const type = data?.user_type || "individual";
        setUserLevel(level);
        setUserType(type);

        const config = getLevelByValue(level);
        if (!config) {
          setLevelConfig({
            icon: "",
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

  // Load saved filter preference
  useEffect(() => {
    if (userType === "individual") {
      const savedFilter = localStorage.getItem("level_filter");
      if (savedFilter === null || savedFilter === "all") {
        setSelectedFilter(null);
      } else {
        setSelectedFilter(savedFilter);
      }
    } else if (userType === "school") {
      setSelectedFilter(userLevel);
    }
  }, [userType, userLevel]);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showAfterScroll);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll]);

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

    if (newFilter === null) {
      localStorage.setItem("level_filter", "all");
    } else {
      localStorage.setItem("level_filter", newFilter);
    }

    window.location.reload();
  };

  const allLevels = getAllLevels();
  const isIndividual = userType === "individual";
  const displayConfig =
    selectedFilter === null
      ? { icon: "", shortName: "All Levels", color: { primary: "#6b7280" } }
      : getLevelByValue(selectedFilter) || levelConfig;

  // Don't render for school users or while loading
  if (loading || !levelConfig || !isIndividual) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-6 right-4 md:bottom-6 md:right-6 z-40 ${className}`}
          ref={dropdownRef}
        >
          {/* Main Button */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full bg-accent-700 dark:bg-accent-700 shadow-lg border border-accent-200 dark:border-accent-600 hover:shadow-xl transition-all group"
            style={{
              boxShadow: isDropdownOpen
                ? `0 0 0 2px ${displayConfig.color?.primary || "#10b981"}`
                : undefined,
            }}
          >
            <Layers className="w-4 h-4 text-white dark:text-white group-hover:text-primary-400 dark:group-hover:text-primary-400 transition-colors" />
            <span className="text-sm font-medium text-white dark:text-white inline sm:inline">
              {displayConfig.shortName}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-white dark:text-white transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] overflow-hidden"
              >
                {/* Header */}
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Filter by Level
                  </p>
                </div>

                {/* All Levels option */}
                <button
                  onClick={() => handleFilterChange(null)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors ${
                    selectedFilter === null
                      ? "bg-primary-50 dark:bg-primary-900/20"
                      : ""
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      All Levels
                    </span>
                  </span>
                  {selectedFilter === null && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                </button>

                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                {/* Individual level options */}
                {allLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleFilterChange(level.value)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center justify-between transition-colors ${
                      selectedFilter === level.value
                        ? "bg-primary-50 dark:bg-primary-900/20"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: level.color?.primary }}
                      >
                        {level.icon || level.order}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white block">
                          {level.shortName}
                        </span>
                      </div>
                    </span>
                    {selectedFilter === level.value && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </button>
                ))}

                {/* Helper text */}
                <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Change difficulty to match your level
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
