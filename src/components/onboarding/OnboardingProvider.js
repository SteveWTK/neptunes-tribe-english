"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import EducatorOnboarding from "./EducatorOnboarding";
import StudentOnboarding from "./StudentOnboarding";

// ============================================================
// ONBOARDING CONFIGURATION
// ============================================================
// Set to false to disable onboarding for specific roles during development
const ONBOARDING_ENABLED_BY_ROLE = {
  Teacher: true,        // Educators see the 6-step educator onboarding
  Coordinator: true,    // Coordinators see the 6-step educator onboarding
  Admin: true,          // Admins see the 6-step educator onboarding
  Platform_admin: true, // Platform admins see the 6-step educator onboarding
  User: true,           // Regular users see the 5-step student onboarding
  Student: true,        // Students see the 5-step student onboarding
};

// Set to false to completely disable all onboarding (overrides role settings)
const ONBOARDING_GLOBALLY_ENABLED = true;
// ============================================================

const OnboardingContext = createContext({});

export function OnboardingProvider({ children }) {
  const { user } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(true); // Default to true to avoid flash
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      // Check if user has completed onboarding
      const response = await fetch("/api/onboarding-status");
      const data = await response.json();

      setOnboardingComplete(data.completed || false);
      setLoading(false);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      // If there's an error, assume onboarding is needed
      setOnboardingComplete(false);
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Save onboarding completion to database
      await fetch("/api/onboarding-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });

      setOnboardingComplete(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      // Still mark as complete locally even if save fails
      setOnboardingComplete(true);
    }
  };

  const restartOnboarding = () => {
    setOnboardingComplete(false);
  };

  const value = {
    onboardingComplete,
    completeOnboarding,
    restartOnboarding,
  };

  if (loading) {
    return <>{children}</>;
  }

  const isEducator =
    user?.role === "Teacher" ||
    user?.role === "Coordinator" ||
    user?.role === "Admin" ||
    user?.role === "platform_admin";

  // Check if onboarding is enabled for this user's role
  const userRole = user?.role || "User";
  const isOnboardingEnabledForRole =
    ONBOARDING_ENABLED_BY_ROLE[userRole] !== false;
  const shouldShowOnboarding =
    ONBOARDING_GLOBALLY_ENABLED &&
    isOnboardingEnabledForRole &&
    !onboardingComplete &&
    user;

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {shouldShowOnboarding && (
        <>
          {isEducator ? (
            <EducatorOnboarding onComplete={completeOnboarding} />
          ) : (
            <StudentOnboarding onComplete={completeOnboarding} />
          )}
        </>
      )}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
