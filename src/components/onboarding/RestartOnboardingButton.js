"use client";

import React from "react";
import { useOnboarding } from "./OnboardingProvider";
import { RotateCcw } from "lucide-react";

/**
 * Restart Onboarding Button
 *
 * Allows users to view the main app onboarding (Student/Educator) again.
 * Can be placed anywhere in the app - typically in settings, profile, or help menu.
 *
 * Usage:
 * import RestartOnboardingButton from "@/components/onboarding/RestartOnboardingButton";
 *
 * <RestartOnboardingButton />
 *
 * Or customize the appearance:
 * <RestartOnboardingButton
 *   variant="link"  // "button" (default), "link", or "icon"
 *   className="your-custom-classes"
 * />
 */
export default function RestartOnboardingButton({
  variant = "button",
  className = "",
  children
}) {
  const { restartOnboarding } = useOnboarding();

  const handleClick = () => {
    restartOnboarding();
    // Optionally show a toast notification
    console.log("Onboarding restarted - refresh or navigate to see it again");
  };

  // Button variant - Full styled button
  if (variant === "button") {
    return (
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2 px-4 py-2
          bg-gradient-to-r from-emerald-500 to-cyan-500
          hover:from-emerald-600 hover:to-cyan-600
          text-white font-medium rounded-lg
          shadow-md hover:shadow-lg
          transition-all duration-200
          ${className}
        `}
      >
        <RotateCcw className="w-4 h-4" />
        <span>{children || "View Tutorial Again"}</span>
      </button>
    );
  }

  // Link variant - Text link style
  if (variant === "link") {
    return (
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-2
          text-cyan-600 dark:text-cyan-400
          hover:text-cyan-700 dark:hover:text-cyan-300
          hover:underline
          transition-colors
          ${className}
        `}
      >
        <RotateCcw className="w-4 h-4" />
        <span>{children || "View Tutorial Again"}</span>
      </button>
    );
  }

  // Icon variant - Just an icon button
  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={`
          p-2 rounded-lg
          bg-cyan-100 dark:bg-cyan-900/30
          text-cyan-600 dark:text-cyan-400
          hover:bg-cyan-200 dark:hover:bg-cyan-800/50
          transition-colors
          ${className}
        `}
        title="View tutorial again"
        aria-label="Restart onboarding tutorial"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    );
  }

  return null;
}
