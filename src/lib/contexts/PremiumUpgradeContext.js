"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";

const PremiumUpgradeContext = createContext(null);

// Session storage keys for tracking dismissed prompts
const STORAGE_KEYS = {
  companionUpgradeShown: "premium_companion_shown",
  lessonModalDismissed: "premium_lesson_modal_dismissed",
};

export function PremiumUpgradeProvider({ children }) {
  const { data: session } = useSession();

  // User status
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Journey data for species companion
  const [journey, setJourney] = useState(null);
  const [stats, setStats] = useState({
    lessons: 0,
    points: 0,
  });

  // Prompt visibility state (persisted in sessionStorage)
  const [promptState, setPromptState] = useState({
    companionUpgradeShown: false,
    lessonModalDismissed: false,
  });

  // Currently triggered premium modal (for lesson/adventure clicks)
  const [premiumModal, setPremiumModal] = useState(null);

  // Load persisted state from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadedState = {};
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      loadedState[key] = sessionStorage.getItem(storageKey) === "true";
    });
    setPromptState(loadedState);
  }, []);

  // Fetch user premium status and journey
  const fetchUserData = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const userId = session.user.userId || session.user.id;
    const isGuestUser = session.user.is_guest || session.user.role === "guest";
    setIsGuest(isGuestUser);

    // Guests are not premium (unless they have a premium QR code, but that's temporary)
    if (isGuestUser) {
      setIsPremiumUser(false);
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Fetch user premium status
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("is_premium")
        .eq("id", userId)
        .single();

      if (!userError && userData) {
        setIsPremiumUser(userData.is_premium || false);
      }

      // Fetch journey for species companion
      let journeyPoints = 0;
      const journeyRes = await fetch("/api/user/journey");
      if (journeyRes.ok) {
        const journeyData = await journeyRes.json();
        if (journeyData.journey) {
          setJourney(journeyData.journey);
          journeyPoints = journeyData.journey.total_points || 0;
        }
      }

      // Fetch lesson completion stats
      const { count: lessonCount } = await supabase
        .from("lesson_completions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      setStats({
        lessons: lessonCount || 0,
        points: journeyPoints,
      });
    } catch (err) {
      console.error("Error fetching user data for premium context:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Initial fetch
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Update a prompt state and persist to sessionStorage
  const updatePromptState = useCallback((key, value) => {
    setPromptState(prev => ({ ...prev, [key]: value }));
    if (typeof window !== "undefined" && STORAGE_KEYS[key]) {
      sessionStorage.setItem(STORAGE_KEYS[key], String(value));
    }
  }, []);

  // Show premium modal for a specific context (lesson, adventure, etc.)
  const showPremiumModal = useCallback((context) => {
    setPremiumModal(context);
  }, []);

  // Hide premium modal
  const hidePremiumModal = useCallback(() => {
    setPremiumModal(null);
  }, []);

  // Check if species companion upgrade should show
  // Shows after 3+ lessons for non-premium, non-guest users who have a species
  const shouldShowCompanionUpgrade =
    !loading &&
    !isPremiumUser &&
    !isGuest &&
    stats.lessons >= 3 &&
    !promptState.companionUpgradeShown &&
    journey?.species_avatar;

  // Debug logging for premium companion upgrade
  if (typeof window !== "undefined" && !loading) {
    console.log("🎁 Premium Companion Check:", {
      loading,
      isPremiumUser,
      isGuest,
      lessonsCompleted: stats.lessons,
      companionAlreadyShown: promptState.companionUpgradeShown,
      hasSpeciesAvatar: !!journey?.species_avatar,
      shouldShowCompanionUpgrade,
    });
  }

  const value = {
    // State
    isPremiumUser,
    isGuest,
    loading,
    journey,
    stats,
    promptState,
    premiumModal,

    // Visibility checks
    shouldShowCompanionUpgrade,

    // Actions
    updatePromptState,
    showPremiumModal,
    hidePremiumModal,
    refreshData: fetchUserData,
  };

  return (
    <PremiumUpgradeContext.Provider value={value}>
      {children}
    </PremiumUpgradeContext.Provider>
  );
}

export function usePremiumUpgrade() {
  const context = useContext(PremiumUpgradeContext);
  if (!context) {
    throw new Error("usePremiumUpgrade must be used within a PremiumUpgradeProvider");
  }
  return context;
}
