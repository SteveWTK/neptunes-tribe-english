import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useOnboarding } from "@/lib/contexts/OnboardingContext";
import { usePathname } from "next/navigation";
import {
  Lightbulb,
  X,
  ArrowRight,
  Crown,
  MapPin,
  BookOpen,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

const ContextualHints = () => {
  const { lang } = useLanguage();
  const { onboardingState, completeStep } = useOnboarding();
  const pathname = usePathname();
  const [activeHint, setActiveHint] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const t = {
    en: {
      hints: {
        firstVisitUnits: {
          title: "Start Your Learning Journey",
          message:
            "Click on any unit card to begin learning about amazing species and ecosystems while practicing English!",
          action: "Try Your First Unit",
          icon: <BookOpen className="w-5 h-5" />,
        },
        premiumUpgrade: {
          title: "Unlock Live Conversation Classes",
          message:
            "Join weekly conversation classes with learners worldwide and vote on next week's ecosystem!",
          action: "Explore Premium",
          icon: <Crown className="w-5 h-5" />,
        },
        ecoMapProgress: {
          title: "Track Your Global Impact",
          message:
            "Complete more units to light up countries and marine zones on your interactive eco-map!",
          action: "View Eco-Map",
          icon: <MapPin className="w-5 h-5" />,
        },
        weeklyTheme: {
          title: "Join This Week's Adventure",
          message:
            "The tribe is exploring a new ecosystem this week. Check out the featured units!",
          action: "Explore Theme",
          icon: <TrendingUp className="w-5 h-5" />,
        },
        conversationClass: {
          title: "Practice Speaking English Live",
          message:
            "Join other learners in weekly conversation classes focused on environmental topics!",
          action: "Join Classes",
          icon: <MessageCircle className="w-5 h-5" />,
        },
      },
      dismiss: "Got it",
      dontShowAgain: "Don't show this again",
    },
    pt: {
      hints: {
        firstVisitUnits: {
          title: "Comece Sua Jornada de Aprendizado",
          message:
            "Clique em qualquer cartão de unidade para começar a aprender sobre espécies e ecossistemas incríveis enquanto pratica inglês!",
          action: "Experimente Sua Primeira Unidade",
          icon: <BookOpen className="w-5 h-5" />,
        },
        premiumUpgrade: {
          title: "Desbloqueie Aulas de Conversação ao Vivo",
          message:
            "Participe de aulas semanais de conversação com estudantes do mundo todo e vote no ecossistema da próxima semana!",
          action: "Explorar Premium",
          icon: <Crown className="w-5 h-5" />,
        },
        ecoMapProgress: {
          title: "Acompanhe Seu Impacto Global",
          message:
            "Complete mais unidades para iluminar países e zonas marinhas no seu eco-mapa interativo!",
          action: "Ver Eco-Mapa",
          icon: <MapPin className="w-5 h-5" />,
        },
        weeklyTheme: {
          title: "Participe da Aventura desta Semana",
          message:
            "A tribo está explorando um novo ecossistema esta semana. Confira as unidades em destaque!",
          action: "Explorar Tema",
          icon: <TrendingUp className="w-5 h-5" />,
        },
        conversationClass: {
          title: "Pratique Falar Inglês ao Vivo",
          message:
            "Junte-se a outros estudantes em aulas semanais de conversação focadas em tópicos ambientais!",
          action: "Participar das Aulas",
          icon: <MessageCircle className="w-5 h-5" />,
        },
      },
      dismiss: "Entendi",
      dontShowAgain: "Não mostrar novamente",
    },
  };

  const copy = t[lang];

  // Determine which hint to show based on context
  useEffect(() => {
    const determineHint = () => {
      const completedTour = onboardingState.hasCompletedTour;
      const viewedUnits = onboardingState.hasViewedUnits;
      const viewedEcoMap = onboardingState.hasViewedEcoMap;
      const triedUnit = onboardingState.hasTriedUnit;

      // Don't show hints if user hasn't completed the tour yet
      if (!completedTour) return;

      // Check for dismissed hints in localStorage
      const dismissedHints = JSON.parse(
        localStorage.getItem("dismissed-hints") || "{}"
      );

      if (
        pathname.includes("/units") &&
        !viewedUnits &&
        !dismissedHints.firstVisitUnits
      ) {
        setActiveHint("firstVisitUnits");
        setShowHint(true);
        completeStep("hasViewedUnits");
      } else if (
        pathname.includes("/eco-map") &&
        !viewedEcoMap &&
        !dismissedHints.ecoMapProgress
      ) {
        setActiveHint("ecoMapProgress");
        setShowHint(true);
        completeStep("hasViewedEcoMap");
      } else if (
        pathname.includes("/pricing") &&
        !dismissedHints.premiumUpgrade
      ) {
        setActiveHint("premiumUpgrade");
        setShowHint(true);
      }
    };

    const timer = setTimeout(determineHint, 1500); // Delay to let page load
    return () => clearTimeout(timer);
  }, [pathname, onboardingState, completeStep]);

  const dismissHint = (dontShowAgain = false) => {
    setShowHint(false);

    if (dontShowAgain && activeHint) {
      const dismissedHints = JSON.parse(
        localStorage.getItem("dismissed-hints") || "{}"
      );
      dismissedHints[activeHint] = true;
      localStorage.setItem("dismissed-hints", JSON.stringify(dismissedHints));
    }

    setTimeout(() => setActiveHint(null), 300);
  };

  const getHintPosition = () => {
    if (pathname.includes("/units")) {
      return { top: "120px", right: "20px" };
    } else if (pathname.includes("/eco-map")) {
      return { bottom: "100px", left: "20px" };
    } else {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }
  };

  if (!activeHint || !showHint) return null;

  const hint = copy.hints[activeHint];
  if (!hint) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm"
        style={getHintPosition()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white">
              {hint.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                {hint.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Lightbulb className="w-3 h-3" />
                <span>Tip</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => dismissHint(false)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
          {hint.message}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              dismissHint(false);
              // Add navigation logic here based on hint type
              if (activeHint === "premiumUpgrade") {
                window.location.href = "/pricing";
              } else if (activeHint === "ecoMapProgress") {
                window.location.href = "/eco-map";
              } else if (activeHint === "firstVisitUnits") {
                // Scroll to first unit card or trigger unit selection
                const firstUnit = document.querySelector(
                  '[data-tour="unit-card"]'
                );
                if (firstUnit) {
                  firstUnit.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  firstUnit.style.boxShadow =
                    "0 0 20px rgba(16, 185, 129, 0.5)";
                  setTimeout(() => {
                    firstUnit.style.boxShadow = "";
                  }, 3000);
                }
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            {hint.action}
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex justify-between text-xs">
            <button
              onClick={() => dismissHint(false)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {copy.dismiss}
            </button>
            <button
              onClick={() => dismissHint(true)}
              className="text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {copy.dontShowAgain}
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-pulse"></div>
        <div
          className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextualHints;
