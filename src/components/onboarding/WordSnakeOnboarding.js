"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Keyboard,
  Target,
  Zap,
  CheckCircle2,
  X,
} from "lucide-react";

/**
 * Word Snake Game Onboarding
 *
 * Shows first-time users how to play the Word Snake game
 * - Detects device type (mobile vs desktop)
 * - Shows different instructions for Easy vs Hard mode
 * - Stores completion in localStorage to not show again
 *
 * @param {string} difficulty - "easy" or "hard" - determines which instructions to show
 * @param {function} onComplete - Called when user dismisses onboarding
 * @param {boolean} show - Whether to show the onboarding
 */
export default function WordSnakeOnboarding({
  difficulty = "easy",
  onComplete,
  show = true,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!show) return null;

  // Define steps based on difficulty and device
  const steps = [
    {
      title: "Welcome to Word Snake! 🐍",
      icon: Target,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Guide your snake to collect letters and spell words based on the
            clues.
          </p>
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-4 rounded-lg border-2 border-accent-200 dark:border-accent-400">
            <div className="flex items-start gap-3">
              {/* <div className="text-3xl">🎯</div> */}
              <Target />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white mb-1">
                  Your Goal
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Read the clue, then collect letters{" "}
                  <strong>in the correct order</strong> to spell the word.
                  Complete all words to finish this activity!
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: isMobile ? "Swipe to Move 📱" : "Use Arrow Keys ⌨️",
      icon: isMobile ? Smartphone : Keyboard,
      content: (
        <div className="space-y-4">
          {isMobile ? (
            <>
              <p className="text-gray-700 dark:text-gray-300">
                Control your snake by <strong>swiping</strong> on the screen:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">⬆️</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Swipe Up
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">⬇️</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Swipe Down
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">⬅️</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Swipe Left
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2">➡️</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Swipe Right
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300">
                Control your snake using the <strong>arrow keys</strong> on your
                keyboard:
              </p>
              <div className="flex justify-center gap-2 mb-4">
                <div className="grid grid-cols-3 grid-rows-3 gap-2">
                  <div className="col-start-2">
                    <div className="bg-gray-800 dark:bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center">
                      <ArrowUp className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="col-start-1 row-start-2">
                    <div className="bg-gray-800 dark:bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center">
                      <ArrowLeft className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="col-start-3 row-start-2">
                    <div className="bg-gray-800 dark:bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="col-start-2 row-start-3">
                    <div className="bg-gray-800 dark:bg-gray-700 text-white p-3 rounded-lg flex items-center justify-center">
                      <ArrowDown className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                You can also use W-A-S-D keys if you prefer!
              </div>
            </>
          )}
          <div className="bg-accent-50 dark:bg-accent-900/20 p-3 rounded-lg border border-accent-200 dark:border-accent-400">
            <p className="text-sm text-accent-800 dark:text-accent-200">
              ⚠️ <strong>Avoid the walls!</strong> Hitting a wall ends the game.
            </p>
          </div>
        </div>
      ),
    },
    {
      title:
        difficulty === "easy"
          ? "Collect Letters in Order ✨"
          : "Collect & Erase Letters ⚡",
      icon: difficulty === "easy" ? CheckCircle2 : Zap,
      content: (
        <div className="space-y-4">
          {difficulty === "easy" ? (
            <>
              <p className="text-gray-700 dark:text-gray-300">
                In <strong>Easy Mode</strong>, only the correct letters appear
                on the board.
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-700">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">1️⃣</div>
                    <div>
                      <div className="font-semibold text-green-800 dark:text-green-300 mb-1">
                        Read the Clue
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Look at the clue at the top to know which word to spell
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">2️⃣</div>
                    <div>
                      <div className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Collect in Order
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Guide your snake to pick up the letters in the correct
                        sequence
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-700">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">3️⃣</div>
                    <div>
                      <div className="font-semibold text-purple-800 dark:text-purple-300 mb-1">
                        Complete the Word
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        When you spell the word correctly, you&apos;ll move to
                        the next one!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 dark:text-gray-300">
                In <strong>Hard Mode</strong>, there are distractor letters and
                eraser tiles!
              </p>
              <div className="space-y-3">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-2 border-amber-200 dark:border-amber-700">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <div className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                        Watch Out for Distractors
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Wrong letters appear on the board - avoid collecting
                        them!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border-2 border-red-200 dark:border-red-700">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⌫</div>
                    <div>
                      <div className="font-semibold text-red-800 dark:text-red-300 mb-1">
                        Use Eraser Tiles
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        If you pick up a wrong letter, collect an{" "}
                        <strong>eraser tile</strong> or press{" "}
                        <strong>Backspace</strong> on your keyboard to remove it
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-700">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <div className="font-semibold text-green-800 dark:text-green-300 mb-1">
                        Pro Tip
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        The snake gets faster with each word - stay focused!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Ready to Play!",
      icon: CheckCircle2,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            You&apos;re all set! Here&apos;s a quick recap:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Read the clue to know what word to spell
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                {isMobile
                  ? "Swipe to move your snake"
                  : "Use arrow keys to move your snake"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Collect letters in the correct order
              </span>
            </div>
            {difficulty === "hard" && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  Use erasers or Backspace to fix mistakes
                </span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                Avoid the walls!
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-4 rounded-lg border-2 border-accent-200 dark:border-accent-400 mt-6">
            <p className="text-sm font-medium text-center text-gray-900 dark:text-white">
              Click &quot;Start Playing&quot; below to begin!{" "}
              {/* <span>
                <PartyPopper className="w-6 h-6" />
              </span> */}
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Store in localStorage that user has seen this onboarding
    localStorage.setItem(`wordSnakeOnboarding_${difficulty}_completed`, "true");
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-none p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {difficulty === "easy" ? "Easy Mode" : "Hard Mode"} • Step{" "}
                  {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Skip tutorial"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? "bg-gradient-to-r from-primary-500 to-accent-500"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Skip Tutorial
            </button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-lg bg-primary-900 text-white font-medium hover:bg-primary-950 transition-all shadow-lg shadow-primary-500/30"
              >
                {currentStep === steps.length - 1 ? "Start Playing!" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
