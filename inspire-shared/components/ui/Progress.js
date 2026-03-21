"use client";

import * as React from "react";

/**
 * Progress bar component
 *
 * @param {Object} props
 * @param {number} props.value - Progress value (0-100)
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.barClassName - Additional CSS classes for the progress bar
 * @param {'sm' | 'md' | 'lg'} props.size - Progress bar height
 * @param {'default' | 'success' | 'warning' | 'error'} props.variant - Color variant
 */
const Progress = React.forwardRef(({
  value = 0,
  className = "",
  barClassName = "",
  size = "md",
  variant = "default",
  ...props
}, ref) => {
  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variants = {
    default: "bg-primary-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      ref={ref}
      className={`w-full bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden ${sizes[size]} ${className}`}
      {...props}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out ${variants[variant]} ${barClassName}`}
        style={{ width: `${normalizedValue}%` }}
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
});

Progress.displayName = "Progress";

export { Progress };
