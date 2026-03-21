"use client";

import { useState, useEffect } from "react";

/**
 * AnimatedProgressBar - An animated progress bar with gradient and pulse effect
 *
 * @param {Object} props
 * @param {number} props.value - Current value
 * @param {number} props.maxValue - Maximum value (default: 100)
 * @param {string} props.label - Optional label text
 * @param {string} props.color - Gradient color classes (default: "from-blue-500 to-green-500")
 * @param {boolean} props.showPercentage - Whether to show percentage (default: true)
 * @param {number} props.animationDelay - Delay before animation in ms (default: 0)
 * @param {string} props.className - Additional CSS classes for container
 * @param {string} props.barClassName - Additional CSS classes for the bar
 * @param {'sm' | 'md' | 'lg'} props.size - Bar height size (default: 'md')
 * @param {boolean} props.showPulse - Whether to show pulse animation (default: true)
 */
export default function AnimatedProgressBar({
  value,
  maxValue = 100,
  label,
  color = "from-blue-500 to-green-500",
  showPercentage = true,
  animationDelay = 0,
  className = "",
  barClassName = "",
  size = "md",
  showPulse = true,
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  const sizes = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [percentage, animationDelay]);

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm mb-2">
          {label && (
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
          )}
          {showPercentage && (
            <span className="text-gray-900 dark:text-white font-medium">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizes[size]} overflow-hidden`}>
        <div
          className={`bg-gradient-to-r ${color} ${sizes[size]} rounded-full transition-all duration-1000 ease-out ${barClassName}`}
          style={{ width: `${animatedValue}%` }}
        >
          {showPulse && (
            <div className="h-full bg-white bg-opacity-20 animate-pulse"></div>
          )}
        </div>
      </div>
    </div>
  );
}
