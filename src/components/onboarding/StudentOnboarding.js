"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
  MapPin,
  BookOpen,
  Award,
  Sparkles,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentOnboarding({ onComplete }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Habitat!",
      description: "Get ready for an amazing English learning adventure!",
      icon: Rocket,
      content: (
        <div className="space-y-4 text-center">
          <div className="text-6xl mb-4">🌍</div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You&apos;re about to explore{" "}
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              8 incredible worlds
            </span>
            , meet amazing animals, and learn English in the most fun way
            possible!
          </p>
          <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
            <p className="text-gray-800 dark:text-gray-200 font-medium">
              Every lesson you complete helps you learn new words, improve your
              English, and discover fascinating facts about our planet!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Choose Your Adventure",
      description: "Start your journey in South America!",
      icon: MapPin,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🦜🌴🦎</div>
            <p className="text-gray-600 dark:text-gray-300">
              Your first stop is the{" "}
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                Amazon Rainforest
              </span>{" "}
              in South America!
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500 to-emerald-500 p-6 rounded-xl text-white">
            <h3 className="text-xl font-bold mb-3">
              Amazon Rainforest Adventure
            </h3>
            <p className="mb-4">
              Discover amazing creatures like giant otters, jaguars, and poison
              dart frogs. Learn about the world&apos;s largest rainforest while
              practicing your English!
            </p>
            <div className="flex items-center gap-2 text-sm bg-white/20 rounded-lg p-3">
              <Sparkles className="w-5 h-5" />
              <span>Multiple fun lessons waiting for you!</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            You&apos;ll move through different adventures with your classmates,
            exploring new places each week!
          </p>
        </div>
      ),
    },
    {
      title: "Complete Fun Lessons",
      description: "Learn through games, stories, and activities!",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Each lesson is packed with exciting activities:
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">📖</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                Read Stories
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                About amazing animals
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">🎮</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                Play Games
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Word games and puzzles
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">🎤</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                Practice Speaking
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Improve pronunciation
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl text-center">
              <div className="text-3xl mb-2">✍️</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                Write Answers
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Express your ideas
              </div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              <strong>Every activity is designed to be fun</strong> while
              helping you learn English naturally!
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Track Your Progress",
      description: "Watch your progress grow as you complete lessons!",
      icon: Award,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-4">🏆✨📈</div>
            <p className="text-gray-600 dark:text-gray-300">
              As you complete lessons, you&apos;ll see your achievements:
            </p>
          </div>
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <div className="font-semibold text-green-700 dark:text-green-300">
                    Checkmarks
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    See which lessons you&apos;ve finished
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🗺️</div>
                <div>
                  <div className="font-semibold text-blue-700 dark:text-blue-300">
                    Eco-Map
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Light up regions you&apos;ve explored
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-3xl">⭐</div>
                <div>
                  <div className="font-semibold text-purple-700 dark:text-purple-300">
                    XP Points
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Earn points for every lesson
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Let's Start Your Adventure!",
      description: "Time to explore the Amazon Rainforest!",
      icon: Globe,
      content: (
        <div className="space-y-4 text-center">
          <div className="text-6xl mb-4">🚀🌟</div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You&apos;re all set to begin your English learning journey!
          </p>
          <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 p-6 rounded-xl text-white">
            <h3 className="text-2xl font-bold mb-3">Your First Mission:</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <span>Go to the Worlds page</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <span>Click on South America</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <span>Choose the Amazon Rainforest adventure</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <span>Start your first lesson!</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Have fun learning and exploring! 🌍💚
          </p>
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
      onComplete();
      router.push("/worlds");
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    router.push("/worlds");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-emerald-500">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStepData.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentStepData.description}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index <= currentStep
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500"
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
              transition={{ duration: 0.3 }}
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? "Start Adventure!" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
