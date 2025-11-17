"use client";

import { getLevelByValue } from "@/config/levelsConfig";

/**
 * LessonLevelBadge - Shows the difficulty level of a lesson as a small badge
 *
 * @param {Object} props
 * @param {string} props.difficulty - The difficulty level (e.g., "Level 1", "Level 2")
 * @param {string} props.size - Size variant: "sm" (small), "md" (medium), "lg" (large)
 * @param {string} props.className - Additional CSS classes
 */
export default function LessonLevelBadge({
  difficulty,
  size = "sm",
  className = "",
}) {
  if (!difficulty) return null;

  const levelConfig = getLevelByValue(difficulty);

  if (!levelConfig) {
    // Fallback for unknown levels
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ${className}`}
      >
        {difficulty}
      </span>
    );
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3 py-1.5 text-base gap-2",
  };

  return (
    <span
      className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium text-white shadow-sm ${className}`}
      style={{ backgroundColor: levelConfig.color.dark }}
      title={`Difficulty: ${levelConfig.displayName}`}
    >
      <span>{levelConfig.icon}</span>
      <span>{levelConfig.shortName}</span>
    </span>
  );
}
