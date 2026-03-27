"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Storage keys for onboarding state
 */
const STORAGE_KEYS = {
  // Persistent flags (localStorage) - only show each spotlight once ever
  firstLessonShown: "onboarding_first_lesson_shown",
  firstAdventureShown: "onboarding_first_adventure_shown",
  firstWorldShown: "onboarding_first_world_shown",
  allContentComplete: "onboarding_all_content_complete_shown",

  // Session flags (sessionStorage) - pass state between pages
  fromLessonCompletion: "onboarding_from_lesson_completion",
  adventureJustCompleted: "onboarding_adventure_just_completed",
  worldJustCompleted: "onboarding_world_just_completed",
  completedAdventureId: "onboarding_completed_adventure_id",
  completedWorldId: "onboarding_completed_world_id",
};

/**
 * useOnboarding - Hook for managing onboarding spotlight state
 *
 * Tracks which onboarding steps have been shown and provides functions
 * to trigger and dismiss spotlights.
 */
export function useOnboarding() {
  const [isInitialized, setIsInitialized] = useState(false);

  // State for active spotlights
  const [showFirstLessonSpotlight, setShowFirstLessonSpotlight] = useState(false);
  const [showFirstAdventureSpotlight, setShowFirstAdventureSpotlight] = useState(false);
  const [showFirstWorldSpotlight, setShowFirstWorldSpotlight] = useState(false);
  const [showAllCompleteSpotlight, setShowAllCompleteSpotlight] = useState(false);

  // Initialize state from storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsInitialized(true);
  }, []);

  /**
   * Check if a specific onboarding step has already been shown
   */
  const hasBeenShown = useCallback((key) => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(key) === "true";
  }, []);

  /**
   * Mark an onboarding step as shown (persists across sessions)
   */
  const markAsShown = useCallback((key) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, "true");
  }, []);

  /**
   * Set a session flag (cleared when browser closes)
   */
  const setSessionFlag = useCallback((key, value = "true") => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(key, value);
  }, []);

  /**
   * Get a session flag value
   */
  const getSessionFlag = useCallback((key) => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(key);
  }, []);

  /**
   * Clear a session flag
   */
  const clearSessionFlag = useCallback((key) => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(key);
  }, []);

  // =====================
  // TRIGGER FUNCTIONS
  // Called when conditions are met
  // =====================

  /**
   * Call this when user completes a lesson and is about to navigate away
   * Sets a session flag that the world page can check
   */
  const triggerFromLessonCompletion = useCallback(() => {
    if (hasBeenShown(STORAGE_KEYS.firstLessonShown)) return;
    setSessionFlag(STORAGE_KEYS.fromLessonCompletion, "true");
  }, [hasBeenShown, setSessionFlag]);

  /**
   * Call this when user completes all lessons in an adventure
   * @param {string} adventureId - ID of the completed adventure
   */
  const triggerAdventureComplete = useCallback((adventureId) => {
    if (hasBeenShown(STORAGE_KEYS.firstAdventureShown)) return;
    setSessionFlag(STORAGE_KEYS.adventureJustCompleted, "true");
    setSessionFlag(STORAGE_KEYS.completedAdventureId, adventureId);
  }, [hasBeenShown, setSessionFlag]);

  /**
   * Call this when user completes all adventures in a world
   * @param {string} worldId - ID of the completed world
   */
  const triggerWorldComplete = useCallback((worldId) => {
    if (hasBeenShown(STORAGE_KEYS.firstWorldShown)) return;
    setSessionFlag(STORAGE_KEYS.worldJustCompleted, "true");
    setSessionFlag(STORAGE_KEYS.completedWorldId, worldId);
  }, [hasBeenShown, setSessionFlag]);

  /**
   * Call this when all content is complete
   */
  const triggerAllContentComplete = useCallback(() => {
    if (hasBeenShown(STORAGE_KEYS.allContentComplete)) return;
    setShowAllCompleteSpotlight(true);
  }, [hasBeenShown]);

  // =====================
  // CHECK FUNCTIONS
  // Called when pages load to determine what to show
  // =====================

  /**
   * Check if we should show the "next lesson" spotlight
   * Call this on the world page after load
   * @returns {boolean} - Whether to show the spotlight
   */
  const checkShowFirstLessonSpotlight = useCallback(() => {
    if (typeof window === "undefined") return false;

    // Check if flag is set and spotlight hasn't been shown before
    const fromLesson = getSessionFlag(STORAGE_KEYS.fromLessonCompletion) === "true";
    const alreadyShown = hasBeenShown(STORAGE_KEYS.firstLessonShown);

    if (fromLesson && !alreadyShown) {
      // Clear the session flag
      clearSessionFlag(STORAGE_KEYS.fromLessonCompletion);
      return true;
    }
    return false;
  }, [getSessionFlag, hasBeenShown, clearSessionFlag]);

  /**
   * Check if we should show the "next adventure" spotlight
   * @returns {{ show: boolean, completedAdventureId: string | null }}
   */
  const checkShowFirstAdventureSpotlight = useCallback(() => {
    if (typeof window === "undefined") return { show: false, completedAdventureId: null };

    const adventureComplete = getSessionFlag(STORAGE_KEYS.adventureJustCompleted) === "true";
    const completedAdventureId = getSessionFlag(STORAGE_KEYS.completedAdventureId);
    const alreadyShown = hasBeenShown(STORAGE_KEYS.firstAdventureShown);

    if (adventureComplete && !alreadyShown) {
      // Clear the session flags
      clearSessionFlag(STORAGE_KEYS.adventureJustCompleted);
      clearSessionFlag(STORAGE_KEYS.completedAdventureId);
      return { show: true, completedAdventureId };
    }
    return { show: false, completedAdventureId: null };
  }, [getSessionFlag, hasBeenShown, clearSessionFlag]);

  /**
   * Check if we should show the "next world" spotlight
   * @returns {{ show: boolean, completedWorldId: string | null }}
   */
  const checkShowFirstWorldSpotlight = useCallback(() => {
    if (typeof window === "undefined") return { show: false, completedWorldId: null };

    const worldComplete = getSessionFlag(STORAGE_KEYS.worldJustCompleted) === "true";
    const completedWorldId = getSessionFlag(STORAGE_KEYS.completedWorldId);
    const alreadyShown = hasBeenShown(STORAGE_KEYS.firstWorldShown);

    if (worldComplete && !alreadyShown) {
      // Clear the session flags
      clearSessionFlag(STORAGE_KEYS.worldJustCompleted);
      clearSessionFlag(STORAGE_KEYS.completedWorldId);
      return { show: true, completedWorldId };
    }
    return { show: false, completedWorldId: null };
  }, [getSessionFlag, hasBeenShown, clearSessionFlag]);

  // =====================
  // DISMISS FUNCTIONS
  // Called when user dismisses a spotlight
  // =====================

  /**
   * Dismiss the first lesson spotlight and mark as shown
   */
  const dismissFirstLessonSpotlight = useCallback(() => {
    markAsShown(STORAGE_KEYS.firstLessonShown);
    setShowFirstLessonSpotlight(false);
  }, [markAsShown]);

  /**
   * Dismiss the first adventure spotlight and mark as shown
   */
  const dismissFirstAdventureSpotlight = useCallback(() => {
    markAsShown(STORAGE_KEYS.firstAdventureShown);
    setShowFirstAdventureSpotlight(false);
  }, [markAsShown]);

  /**
   * Dismiss the first world spotlight and mark as shown
   */
  const dismissFirstWorldSpotlight = useCallback(() => {
    markAsShown(STORAGE_KEYS.firstWorldShown);
    setShowFirstWorldSpotlight(false);
  }, [markAsShown]);

  /**
   * Dismiss the all content complete spotlight and mark as shown
   */
  const dismissAllCompleteSpotlight = useCallback(() => {
    markAsShown(STORAGE_KEYS.allContentComplete);
    setShowAllCompleteSpotlight(false);
  }, [markAsShown]);

  // =====================
  // ACTIVATION FUNCTIONS
  // Explicitly show spotlights (called after checks pass)
  // =====================

  const activateFirstLessonSpotlight = useCallback(() => {
    setShowFirstLessonSpotlight(true);
  }, []);

  const activateFirstAdventureSpotlight = useCallback(() => {
    setShowFirstAdventureSpotlight(true);
  }, []);

  const activateFirstWorldSpotlight = useCallback(() => {
    setShowFirstWorldSpotlight(true);
  }, []);

  /**
   * Reset all onboarding state (for testing purposes)
   * Call this to re-enable all onboarding spotlights
   */
  const resetOnboarding = useCallback(() => {
    if (typeof window === "undefined") return;

    // Clear all localStorage flags
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    // Reset state
    setShowFirstLessonSpotlight(false);
    setShowFirstAdventureSpotlight(false);
    setShowFirstWorldSpotlight(false);
    setShowAllCompleteSpotlight(false);

    console.log("🔄 Onboarding state reset - all spotlights will show again");
  }, []);

  // Check for reset param in URL (for easy testing)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("reset_onboarding") === "true") {
      resetOnboarding();
      // Remove the param from URL without reload
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
  }, [resetOnboarding]);

  return {
    isInitialized,

    // Spotlight visibility state
    showFirstLessonSpotlight,
    showFirstAdventureSpotlight,
    showFirstWorldSpotlight,
    showAllCompleteSpotlight,

    // Trigger functions (call when conditions are met)
    triggerFromLessonCompletion,
    triggerAdventureComplete,
    triggerWorldComplete,
    triggerAllContentComplete,

    // Check functions (call on page load)
    checkShowFirstLessonSpotlight,
    checkShowFirstAdventureSpotlight,
    checkShowFirstWorldSpotlight,

    // Activation functions (call after checks pass)
    activateFirstLessonSpotlight,
    activateFirstAdventureSpotlight,
    activateFirstWorldSpotlight,

    // Dismiss functions (call when user dismisses)
    dismissFirstLessonSpotlight,
    dismissFirstAdventureSpotlight,
    dismissFirstWorldSpotlight,
    dismissAllCompleteSpotlight,

    // Utility functions
    hasBeenShown,
    markAsShown,
    setSessionFlag,
    getSessionFlag,
    clearSessionFlag,
    resetOnboarding, // For testing

    // Storage keys (for direct access if needed)
    STORAGE_KEYS,
  };
}

export default useOnboarding;
