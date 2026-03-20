"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Reusable IUCN Progress Bar Component
 * Shows progress through IUCN conservation status levels
 *
 * @param {Object} props
 * @param {string} props.currentStatus - Current IUCN status code (CR, EN, VU, NT, LC)
 * @param {string} props.startingStatus - Starting IUCN status (default: CR)
 * @param {number} props.lessonsCompleted - Number of lessons completed (0-5)
 * @param {number} props.totalLessons - Total lessons in adventure (default: 5)
 * @param {Object} props.speciesInfo - Species information {name, scientificName, imageUrl}
 * @param {string} props.nextLevelName - Name of next IUCN level
 * @param {boolean} props.showLabels - Show status labels below bar (default: true)
 * @param {boolean} props.animated - Enable animations (default: true)
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {string} props.className - Additional CSS classes
 */

// IUCN Status configuration (5 levels: CR → EN → VU → NT → LC)
const IUCN_LEVELS = [
  { code: "CR", label: "Critically Endangered", shortLabel: "CR", color: "#dc2626" },
  { code: "EN", label: "Endangered", shortLabel: "EN", color: "#f97316" },
  { code: "VU", label: "Vulnerable", shortLabel: "VU", color: "#eab308" },
  { code: "NT", label: "Near Threatened", shortLabel: "NT", color: "#84cc16" },
  { code: "LC", label: "Least Concern", shortLabel: "LC", color: "#22c55e" },
];

export default function IUCNProgressBar({
  currentStatus = "CR",
  startingStatus = "CR",
  lessonsCompleted = 0,
  totalLessons = 5,
  speciesInfo = null,
  nextLevelName = null,
  showLabels = true,
  animated = true,
  size = "md",
  className = "",
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Helper to get IUCN status index
  const getStatusIndex = (status) => {
    return IUCN_LEVELS.findIndex((l) => l.code === status);
  };

  const currentStatusIndex = getStatusIndex(currentStatus);
  const startingStatusIndex = getStatusIndex(startingStatus);
  const currentLevel = IUCN_LEVELS[currentStatusIndex];

  // Calculate which levels to show (from starting status onwards)
  const visibleLevels = IUCN_LEVELS.slice(startingStatusIndex);

  // Size variants
  const sizeClasses = {
    sm: {
      bar: "h-2",
      label: "text-xs",
      spacing: "gap-0.5",
    },
    md: {
      bar: "h-3",
      label: "text-sm",
      spacing: "gap-1",
    },
    lg: {
      bar: "h-4",
      label: "text-base",
      spacing: "gap-2",
    },
  };

  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  // Calculate progress percentage within current level
  const progressWithinLevel = lessonsCompleted > 0
    ? ((lessonsCompleted % 1) || 1) * 100
    : 0;

  const ProgressBar = () => (
    <div className={`${sizeConfig.spacing}`}>
      {/* Progress Info */}
      {speciesInfo && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {speciesInfo.imageUrl && (
              <img
                src={speciesInfo.imageUrl}
                alt={speciesInfo.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
              />
            )}
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">
                {speciesInfo.name}
              </p>
              {speciesInfo.scientificName && (
                <p className="text-xs italic text-gray-600 dark:text-gray-400">
                  {speciesInfo.scientificName}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Progress
            </div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">
              {lessonsCompleted}/{totalLessons} Lessons
            </div>
          </div>
        </div>
      )}

      {/* Status Label & Next Level Info */}
      {!speciesInfo && (
        <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mb-2">
          <span className="font-medium">Recovery Progress</span>
          {nextLevelName && lessonsCompleted < totalLessons && (
            <span>
              {totalLessons - lessonsCompleted} lesson{totalLessons - lessonsCompleted !== 1 ? 's' : ''} to {nextLevelName}
            </span>
          )}
          {lessonsCompleted === totalLessons && (
            <span className="text-green-600 dark:text-green-400 font-semibold">
              Species Saved! 🎉
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className={`flex items-center ${sizeConfig.spacing}`}>
        {visibleLevels.map((level, i) => {
          const actualIndex = startingStatusIndex + i;
          const isPast = actualIndex > currentStatusIndex;
          const isCurrent = actualIndex === currentStatusIndex;
          const isComplete = actualIndex < currentStatusIndex;

          return (
            <div
              key={level.code}
              className="flex-1 relative"
              onMouseEnter={() => setActiveTooltip(level.code)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {activeTooltip === level.code && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg">
                      {level.label}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                        <div className="w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bar Segment */}
              <motion.div
                className={`${sizeConfig.bar} rounded-full transition-all cursor-pointer relative overflow-hidden ${
                  isCurrent
                    ? "ring-2 ring-offset-1 ring-gray-400 dark:ring-white"
                    : ""
                }`}
                style={{
                  backgroundColor: isComplete || isCurrent
                    ? level.color
                    : `${level.color}40`,
                  opacity: isPast ? 0.4 : 1,
                }}
                initial={animated ? { scaleX: 0 } : {}}
                animate={animated ? { scaleX: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Progress fill within current level */}
                {isCurrent && progressWithinLevel > 0 && (
                  <motion.div
                    className="absolute inset-0 bg-white/30"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressWithinLevel}%` }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>

              {/* Label */}
              {showLabels && (
                <div
                  className={`text-center mt-1 ${sizeConfig.label} font-medium transition-colors ${
                    isPast
                      ? "text-gray-400 dark:text-gray-500"
                      : isCurrent
                      ? "text-gray-900 dark:text-white font-bold"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {level.shortLabel}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Badge (optional for larger sizes) */}
      {size === "lg" && currentLevel && (
        <div className="mt-3 text-center">
          <div
            className="inline-block px-4 py-2 rounded-full text-white font-semibold text-sm shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${currentLevel.color}dd 0%, ${currentLevel.color}99 100%)`,
            }}
          >
            Current Status: {currentLevel.label}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      {animated ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProgressBar />
        </motion.div>
      ) : (
        <ProgressBar />
      )}
    </div>
  );
}

// Export IUCN_LEVELS for use in other components
export { IUCN_LEVELS };
