"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useLanguage } from "@/lib/contexts/LanguageContext";

const translations = {
  en: {
    gotIt: "Got it!",
    // Milestone messages
    firstLesson: "Great job! Start your next mission here.",
    firstAdventure: "You are a hero! Start your next adventure here.",
    firstWorld: "You are my inspiration! Start the next world here.",
    // Achievement message when all content completed
    allComplete: "Amazing! You've completed all available content. You're a true conservation champion! 🏆",
    allCompleteTitle: "Incredible Achievement!",
  },
  pt: {
    gotIt: "Entendi!",
    firstLesson: "Ótimo trabalho! Comece sua próxima missão aqui.",
    firstAdventure: "Você é um herói! Comece sua próxima aventura aqui.",
    firstWorld: "Você é minha inspiração! Comece o próximo mundo aqui.",
    allComplete: "Incrível! Você completou todo o conteúdo disponível. Você é um verdadeiro campeão da conservação! 🏆",
    allCompleteTitle: "Conquista Incrível!",
  },
  th: {
    gotIt: "เข้าใจแล้ว!",
    firstLesson: "เยี่ยมมาก! เริ่มภารกิจถัดไปของคุณที่นี่",
    firstAdventure: "คุณคือฮีโร่! เริ่มการผจญภัยครั้งต่อไปของคุณที่นี่",
    firstWorld: "คุณคือแรงบันดาลใจของฉัน! เริ่มโลกถัดไปที่นี่",
    allComplete: "เหลือเชื่อ! คุณเรียนจบเนื้อหาทั้งหมดแล้ว คุณคือแชมป์การอนุรักษ์ตัวจริง! 🏆",
    allCompleteTitle: "ความสำเร็จเหลือเชื่อ!",
  },
};

/**
 * OnboardingSpotlight - Highlights a target element with a spotlight effect
 * and displays a message with an arrow pointing to it.
 *
 * @param {Object} props
 * @param {string} props.targetSelector - CSS selector for the target element
 * @param {string} props.message - Message to display (overrides type-based message)
 * @param {string} props.type - Type of onboarding: "firstLesson", "firstAdventure", "firstWorld", "allComplete"
 * @param {boolean} props.isVisible - Whether the spotlight is visible
 * @param {function} props.onDismiss - Callback when user dismisses the spotlight
 * @param {string} props.position - Position of the tooltip: "top", "bottom", "left", "right" (default: auto)
 */
export default function OnboardingSpotlight({
  targetSelector,
  message,
  type = "firstLesson",
  isVisible = false,
  onDismiss,
  position = "auto",
}) {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.en;
  const [targetRect, setTargetRect] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowDirection, setArrowDirection] = useState("down");
  const tooltipRef = useRef(null);

  // Get the display message
  const displayMessage = message || t[type] || t.firstLesson;
  const isAchievement = type === "allComplete";

  // Calculate target position and tooltip placement
  const calculatePositions = useCallback(() => {
    if (!targetSelector) return;

    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      console.log("OnboardingSpotlight: Target not found:", targetSelector);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    setTargetRect({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
      viewportTop: rect.top,
      viewportLeft: rect.left,
    });

    // Calculate tooltip position based on available space
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 280;
    const tooltipHeight = 120;
    const padding = 16;

    let finalPosition = position;
    if (position === "auto") {
      // Prefer showing below the element
      if (rect.bottom + tooltipHeight + padding < viewportHeight) {
        finalPosition = "bottom";
      } else if (rect.top - tooltipHeight - padding > 0) {
        finalPosition = "top";
      } else if (rect.right + tooltipWidth + padding < viewportWidth) {
        finalPosition = "right";
      } else {
        finalPosition = "left";
      }
    }

    let tooltipTop, tooltipLeft;
    switch (finalPosition) {
      case "top":
        tooltipTop = rect.top + window.scrollY - tooltipHeight - padding;
        tooltipLeft = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
        setArrowDirection("down");
        break;
      case "bottom":
        tooltipTop = rect.bottom + window.scrollY + padding;
        tooltipLeft = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
        setArrowDirection("up");
        break;
      case "left":
        tooltipTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
        tooltipLeft = rect.left + window.scrollX - tooltipWidth - padding;
        setArrowDirection("right");
        break;
      case "right":
        tooltipTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
        tooltipLeft = rect.right + window.scrollX + padding;
        setArrowDirection("left");
        break;
      default:
        tooltipTop = rect.bottom + window.scrollY + padding;
        tooltipLeft = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
        setArrowDirection("up");
    }

    // Ensure tooltip stays within viewport
    tooltipLeft = Math.max(padding, Math.min(tooltipLeft, viewportWidth - tooltipWidth - padding));
    tooltipTop = Math.max(padding, tooltipTop);

    setTooltipPosition({ top: tooltipTop, left: tooltipLeft });

    // Scroll target into view if needed
    if (rect.top < 0 || rect.bottom > viewportHeight) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [targetSelector, position]);

  useEffect(() => {
    if (isVisible) {
      // Small delay to allow DOM to settle
      const timer = setTimeout(calculatePositions, 100);

      // Recalculate on resize/scroll
      window.addEventListener("resize", calculatePositions);
      window.addEventListener("scroll", calculatePositions);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", calculatePositions);
        window.removeEventListener("scroll", calculatePositions);
      };
    }
  }, [isVisible, calculatePositions]);

  // Handle escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e) => {
      if (e.key === "Escape" && onDismiss) {
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  // Achievement modal (no target element needed)
  if (isAchievement) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-md w-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/90 dark:to-orange-900/90 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative header */}
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎉</span>
                <h2 className="text-xl font-bold">{t.allCompleteTitle}</h2>
                <span className="text-3xl">🎉</span>
              </div>
            </div>

            <div className="p-6 text-center">
              <p className="text-lg text-gray-700 dark:text-gray-200 mb-6">
                {displayMessage}
              </p>

              <button
                onClick={onDismiss}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                {t.gotIt}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Regular spotlight with target element
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ pointerEvents: "none" }}
      >
        {/* Overlay with cutout */}
        <div
          className="absolute inset-0 bg-black/50"
          style={{ pointerEvents: "auto" }}
          onClick={onDismiss}
        />

        {/* Spotlight hole - renders above the overlay */}
        {targetRect && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute rounded-xl"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.5)",
              pointerEvents: "none",
            }}
          >
            {/* Pulse animation ring */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-accent-400"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 0.4, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        )}

        {/* Tooltip */}
        {targetRect && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: arrowDirection === "up" ? -10 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute w-[280px]"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
              pointerEvents: "auto",
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Arrow */}
              <div
                className={`absolute w-4 h-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transform rotate-45 ${
                  arrowDirection === "up"
                    ? "-top-2 left-1/2 -translate-x-1/2 border-t border-l"
                    : arrowDirection === "down"
                    ? "-bottom-2 left-1/2 -translate-x-1/2 border-b border-r"
                    : arrowDirection === "left"
                    ? "-left-2 top-1/2 -translate-y-1/2 border-l border-b"
                    : "-right-2 top-1/2 -translate-y-1/2 border-r border-t"
                }`}
              />

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 font-medium leading-snug pt-1">
                    {displayMessage}
                  </p>
                </div>

                <button
                  onClick={onDismiss}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {t.gotIt}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
