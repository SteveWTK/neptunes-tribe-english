"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

export const OnboardingProvider = ({ children }) => {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const [onboardingState, setOnboardingState] = useState({
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

  // Check if user needs onboarding
  useEffect(() => {
    const checkOnboardingStatus = () => {
      try {
        const stored = localStorage.getItem("neptunes-tribe-onboarding");
        if (stored) {
          const parsedState = JSON.parse(stored);
          setOnboardingState((prev) => ({ ...prev, ...parsedState }));
        } else if (session?.user) {
          // New user - trigger onboarding
          setOnboardingState((prev) => ({
            ...prev,
            shouldTriggerOnboarding: true,
            showWelcomeModal: true,
          }));
        }
      } catch (error) {
        console.error("Error loading onboarding state:", error);
      }
    };

    checkOnboardingStatus();
  }, [session]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "neptunes-tribe-onboarding",
        JSON.stringify(onboardingState)
      );
    } catch (error) {
      console.error("Error saving onboarding state:", error);
    }
  }, [onboardingState]);

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
    localStorage.removeItem("neptunes-tribe-onboarding");
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
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
