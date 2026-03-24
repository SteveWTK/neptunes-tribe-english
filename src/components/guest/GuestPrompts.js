"use client";

import { GuestPromptProvider } from "@/lib/contexts/GuestPromptContext";
import SaveProgressButton from "./SaveProgressButton";
import SpeciesCompanionReminder from "./SpeciesCompanionReminder";
import MilestoneModal from "./MilestoneModal";
import ExitIntentPrompt from "./ExitIntentPrompt";
import TimeWarningBanner from "./TimeWarningBanner";

/**
 * GuestPrompts - Wrapper component that renders all guest user CTAs.
 * Provides the GuestPromptProvider context and renders all prompt components.
 *
 * CTAs included:
 * 1. SaveProgressButton - Floating button after 1st lesson completion
 * 2. SpeciesCompanionReminder - Speech bubble from species avatar after 2nd lesson
 * 3. MilestoneModal - Celebration modal after 3rd lesson completion
 * 4. ExitIntentPrompt - Desktop-only prompt when mouse leaves viewport
 * 5. TimeWarningBanner - Banners at 30min and 10min remaining
 */
export default function GuestPrompts() {
  return (
    <GuestPromptProvider>
      <GuestPromptsInner />
    </GuestPromptProvider>
  );
}

function GuestPromptsInner() {
  return (
    <>
      {/* Floating save progress button (bottom right) */}
      <SaveProgressButton />

      {/* Species companion speech bubble (modal overlay) */}
      <SpeciesCompanionReminder />

      {/* Milestone celebration modal */}
      <MilestoneModal />

      {/* Exit intent prompt (desktop only) */}
      <ExitIntentPrompt />

      {/* Time warning banners (bottom of screen) */}
      <TimeWarningBanner />
    </>
  );
}
