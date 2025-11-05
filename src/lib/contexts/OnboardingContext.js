// Legacy file - provides backwards compatibility for old onboarding components
// This maintains the old API while using the new onboarding system under the hood

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const LegacyOnboardingContext = createContext();

// For old components that use the detailed onboarding state
export const useOnboarding = () => {
  const context = useContext(LegacyOnboardingContext);
  if (!context) {
    // Return a default state if not in provider (to prevent errors)
    return {
      onboardingState: {
        hasSeenWelcome: true,
        hasCompletedTour: true,
        hasViewedUnits: true,
        hasViewedEcoMap: true,
        hasTriedUnit: true,
        currentStep: 0,
        showWelcomeModal: false,
        showTour: false,
        shouldTriggerOnboarding: false,
      },
      updateOnboardingState: () => {},
      completeStep: () => {},
      resetOnboarding: () => {},
      startTour: () => {},
      dismissWelcome: () => {},
    };
  }
  return context;
};

// Legacy provider for backwards compatibility
export const LegacyOnboardingProvider = ({ children }) => {
  const { data: session } = useSession();
  const [onboardingState, setOnboardingState] = useState({
    hasSeenWelcome: true, // Default to true to not show old modals
    hasCompletedTour: true,
    hasViewedUnits: true,
    hasViewedEcoMap: true,
    hasTriedUnit: true,
    currentStep: 0,
    showWelcomeModal: false, // Don't show old welcome modal
    showTour: false,
    shouldTriggerOnboarding: false,
  });

  const updateOnboardingState = (updates) => {
    setOnboardingState((prev) => ({ ...prev, ...updates }));
  };

  const completeStep = (stepName) => {
    setOnboardingState((prev) => ({
      ...prev,
      [stepName]: true,
    }));
  };

  const resetOnboarding = () => {
    setOnboardingState({
      hasSeenWelcome: false,
      hasCompletedTour: false,
      hasViewedUnits: false,
      hasViewedEcoMap: false,
      hasTriedUnit: false,
      currentStep: 0,
      showWelcomeModal: false,
      showTour: false,
      shouldTriggerOnboarding: false,
    });
  };

  const startTour = () => {
    setOnboardingState((prev) => ({
      ...prev,
      showTour: true,
      currentStep: 0,
    }));
  };

  const dismissWelcome = () => {
    setOnboardingState((prev) => ({
      ...prev,
      showWelcomeModal: false,
      hasSeenWelcome: true,
    }));
  };

  const value = {
    onboardingState,
    updateOnboardingState,
    completeStep,
    resetOnboarding,
    startTour,
    dismissWelcome,
  };

  return (
    <LegacyOnboardingContext.Provider value={value}>
      {children}
    </LegacyOnboardingContext.Provider>
  );
};

// Also export as default and named export for compatibility
export const OnboardingProvider = LegacyOnboardingProvider;
export default LegacyOnboardingProvider;
