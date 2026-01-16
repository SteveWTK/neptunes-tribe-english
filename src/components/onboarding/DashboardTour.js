"use client";

import { useState, useEffect } from "react";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  Calendar,
  Leaf,
  Settings,
  Zap,
  MapPin,
  Users,
  Award,
  Camera,
  ArrowRight,
} from "lucide-react";

const TOUR_STORAGE_KEY = "habitat_dashboard_tour_completed";

// Translations for tour content
const translations = {
  en: {
    steps: [
      {
        target: '[data-tour="season-progress"]',
        title: "Season Progress",
        content:
          "Track your progress through the current season and earn rewards!",
        icon: Calendar,
      },
      {
        target: '[data-tour="species-avatar"]',
        title: "Your Conservation Journey",
        content:
          "This is your species companion! Track their IUCN recovery status and earn points to help them thrive.",
        icon: Leaf,
      },
      {
        target: '[data-tour="settings-link"]',
        title: "Profile & Settings",
        content: "Update your display name and manage your account here.",
        icon: Settings,
      },
      {
        target: '[data-tour="quick-actions"]',
        title: "Quick Actions",
        content: "Jump to Worlds for lessons or snap a wildlife observation.",
        icon: Zap,
      },
      {
        target: '[data-tour="community-stats"]',
        title: "Community Impact",
        content:
          "See how the Habitat community is making a difference together.",
        icon: Users,
      },
      {
        target: '[data-tour="leaderboard"]',
        title: "Top Naturalists",
        content: "Compete with fellow naturalists and climb the rankings!",
        icon: Award,
      },
      {
        target: '[data-tour="recent-observations"]',
        title: "Your Observations",
        content: "Your wildlife photos appear here. Keep exploring!",
        icon: Camera,
      },
      {
        target: '[data-tour="wildlife-map"]',
        title: "Wildlife Map",
        content:
          "See where you and others have spotted wildlife around the world.",
        icon: MapPin,
      },
    ],
    buttons: {
      next: "Next",
      back: "Back",
      skip: "Skip Tour",
      finish: "Get Started!",
    },
  },
  pt: {
    steps: [
      {
        target: '[data-tour="season-progress"]',
        title: "Progresso da Temporada",
        content:
          "Acompanhe seu progresso na temporada atual e ganhe recompensas!",
        icon: Calendar,
      },
      {
        target: '[data-tour="species-avatar"]',
        title: "Sua Jornada de Conservacao",
        content:
          "Este e seu companheiro de especie! Acompanhe seu status IUCN e ganhe pontos para ajuda-lo a prosperar.",
        icon: Leaf,
      },
      {
        target: '[data-tour="settings-link"]',
        title: "Perfil e Configuracoes",
        content: "Atualize seu nome e gerencie sua conta aqui.",
        icon: Settings,
      },
      {
        target: '[data-tour="quick-actions"]',
        title: "Acoes Rapidas",
        content:
          "Va para Mundos para licoes ou registre uma observacao de vida selvagem.",
        icon: Zap,
      },
      {
        target: '[data-tour="community-stats"]',
        title: "Impacto da Comunidade",
        content:
          "Veja como a comunidade Habitat esta fazendo a diferenca juntos.",
        icon: Users,
      },
      {
        target: '[data-tour="leaderboard"]',
        title: "Top Naturalistas",
        content: "Compita com outros naturalistas e suba no ranking!",
        icon: Award,
      },
      {
        target: '[data-tour="recent-observations"]',
        title: "Suas Observacoes",
        content:
          "Suas fotos de vida selvagem aparecem aqui. Continue explorando!",
        icon: Camera,
      },
      {
        target: '[data-tour="wildlife-map"]',
        title: "Mapa de Vida Selvagem",
        content:
          "Veja onde voce e outros avistaram vida selvagem ao redor do mundo.",
        icon: MapPin,
      },
    ],
    buttons: {
      next: "Proximo",
      back: "Voltar",
      skip: "Pular Tour",
      finish: "Comecar!",
    },
  },
};

export default function DashboardTour({ onComplete }) {
  const { lang } = useLanguage();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const content = translations[lang] || translations.en;

  // Filter steps to only include those with existing targets
  const [activeSteps, setActiveSteps] = useState([]);

  useEffect(() => {
    // Check which targets exist in the DOM
    const existingSteps = content.steps.filter((step) => {
      const element = document.querySelector(step.target);
      return element !== null;
    });
    setActiveSteps(existingSteps);

    // Start the tour after a brief delay to let page render
    const timer = setTimeout(() => {
      if (existingSteps.length > 0) {
        setRun(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [content.steps]);

  // Handle tour completion
  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    setRun(false);
    onComplete?.();
  };

  // Handle Joyride events
  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Move to next/prev step
      const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      setStepIndex(nextIndex);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      handleComplete();
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({
    continuous,
    index,
    step,
    backProps,
    primaryProps,
    skipProps,
    tooltipProps,
  }) => {
    const stepData = activeSteps[index];
    const Icon = stepData?.icon || Zap;
    const isLastStep = index === activeSteps.length - 1;

    return (
      <div
        {...tooltipProps}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-5 max-w-xs"
      >
        {/* Header with step number and title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-r from-accent-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {index + 1}
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex-1">
            {step.title}
          </h3>
        </div>

        {/* Content */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
          {step.content}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {activeSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-4 bg-accent-500"
                  : i < index
                  ? "w-1.5 bg-accent-300 dark:bg-accent-700"
                  : "w-1.5 bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            {...skipProps}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            {content.buttons.skip}
          </button>

          <div className="flex gap-2">
            {index > 0 && (
              <button
                {...backProps}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                {content.buttons.back}
              </button>
            )}
            <button
              {...primaryProps}
              className="px-4 py-1.5 bg-gradient-to-r from-accent-500 to-blue-500 hover:from-accent-600 hover:to-blue-600 text-white text-sm font-medium rounded-lg transition-all flex items-center gap-1.5"
            >
              {isLastStep ? content.buttons.finish : content.buttons.next}
              {!isLastStep && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!run || activeSteps.length === 0) return null;

  // Convert steps to Joyride format
  const joyrideSteps = activeSteps.map((step) => ({
    target: step.target,
    content: step.content,
    title: step.title,
    placement: "auto",
    disableBeacon: true,
  }));

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress={false}
      showSkipButton
      steps={joyrideSteps}
      stepIndex={stepIndex}
      tooltipComponent={CustomTooltip}
      disableOverlayClose
      disableScrolling={false}
      spotlightClicks={false}
      // SCROLL OFFSET: Adds padding from top when scrolling to element
      // Increase this value if elements go under header (default: 20)
      // Typical header height is 60-80px, so 100 gives good clearance
      scrollOffset={100}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#14b8a6",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          arrowColor: "#ffffff",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        spotlight: {
          backgroundColor: "transparent",
          border: "2px solid #14b8a6",
          borderRadius: "12px",
        },
      }}
      floaterProps={{
        // TRANSITION SETTINGS: Controls tooltip animation smoothness
        disableAnimation: false,
        // Transition duration in ms (higher = slower/smoother)
        transitionDuration: 600,
        styles: {
          floater: {
            filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
            // Smooth transition for position changes
            transition: "transform 0.6s ease-in-out, opacity 0.3s ease-in-out",
          },
        },
      }}
    />
  );
}

// Helper function to check if tour should be shown
export function shouldShowDashboardTour() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TOUR_STORAGE_KEY) !== "true";
}

// Helper function to reset tour (for restart button)
export function resetDashboardTour() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOUR_STORAGE_KEY);
}
