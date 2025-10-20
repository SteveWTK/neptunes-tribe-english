import React from "react";
import dynamic from "next/dynamic";
import { useOnboarding } from "@/lib/contexts/OnboardingContext";
import WelcomeModal from "@/components/onboarding/WelcomeModal";
import ContextualHints from "@/components/onboarding/ContextualHints";

// Dynamically import Joyride to avoid SSR issues
const GuidedTour = dynamic(() => import("@/components/onboarding/GuidedTour"), {
  ssr: false,
});

const OnboardingWrapper = ({ children }) => {
  const { onboardingState } = useOnboarding();

  return (
    <>
      {children}

      {/* Welcome Modal - shows for new users */}
      <WelcomeModal />

      {/* Guided Tour - shows after welcome modal */}
      <GuidedTour />

      {/* Contextual Hints - shows smart tips based on user behavior */}
      <ContextualHints />
    </>
  );
};

export default OnboardingWrapper;
