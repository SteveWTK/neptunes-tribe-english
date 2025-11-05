"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EducatorOnboarding({ onComplete }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Habitat!",
      description:
        "We're excited to show you how Habitat transforms English learning through environmental education.",
      icon: Globe,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Habitat is a comprehensive English learning platform designed
            specifically for schools. Your students will embark on a journey
            through 8 unique worlds, exploring ecosystems and endangered species
            while building language skills.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              This quick tour will show you exactly what your students will
              experience and how you can track their progress.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "8 Worlds to Explore",
      description:
        "Students progress through diverse ecosystems, from South American rainforests to the depths of the ocean.",
      icon: MapPin,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            The curriculum is organized into 8 worlds, each containing 4 weekly
            adventures:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
              <div className="font-semibold text-cyan-700 dark:text-cyan-300">
                1. South America
              </div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400">
                Amazon, Andes, Galápagos, Pantanal
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
              <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                2. Africa
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                Serengeti, Congo, Sahara, Madagascar
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <div className="font-semibold text-amber-700 dark:text-amber-300">
                3. Eurasia
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400">
                Taiga, Himalayas, Borneo, Mediterranean
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="font-semibold text-blue-700 dark:text-blue-300">
                4. Oceania
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                Great Barrier Reef, Outback & more
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="font-semibold text-purple-700 dark:text-purple-300">
                5. Polar Regions
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Arctic, Antarctica, Greenland
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="font-semibold text-red-700 dark:text-red-300">
                6. North America
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                Yellowstone, Caribbean & more
              </div>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/20 p-3 rounded-lg">
              <div className="font-semibold text-sky-700 dark:text-sky-300">
                7. The Oceans
              </div>
              <div className="text-xs text-sky-600 dark:text-sky-400">
                Kelp Forests, Deep Sea, Migrations
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="font-semibold text-purple-700 dark:text-purple-300">
                8. Lost Worlds
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Dinosaurs, Ice Age, Extinctions
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Structured Weekly Flow",
      description:
        "Students move together through adventures in sequence, creating a shared learning experience.",
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            The curriculum follows a structured progression:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
              <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Start in South America
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Week 1-4: Amazon Rainforest → Andes → Galápagos → Pantanal
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 p-4 rounded-lg">
              <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Progress to Africa
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Week 5-8: Serengeti → Congo Basin → Sahara → Madagascar
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-gray-400 font-semibold text-sm">
                And so on through all 8 worlds...
              </div>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Your whole class learns together</strong>, creating
              opportunities for discussion and collaborative learning around
              each adventure.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Rich Lesson Content",
      description:
        "Each adventure contains multiple interactive lessons with varied activities.",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Students engage with diverse lesson types:
          </p>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl">📖</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Reading & Gap-Fill
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Interactive texts about species and ecosystems
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl">🎮</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Word Games
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Memory match, word snake, vocabulary builders
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl">🎤</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  AI Speech Practice
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Pronunciation feedback with AI
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <div className="text-2xl">✍️</div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Writing Practice
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  AI-powered feedback on written responses
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Track Student Progress",
      description:
        "Monitor which lessons students have completed and how they're progressing through the curriculum.",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            The platform automatically tracks completion for each student:
          </p>
          <div className="space-y-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Lesson Completion
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                See checkmarks next to completed lessons on the Worlds page
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  Eco-Map Dashboard
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Students can view their personal progress dashboard showing
                which regions they&apos;ve explored
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-700 dark:text-purple-300">
                  XP & Achievements
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Points and rewards keep students motivated throughout their
                journey
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Start!",
      description:
        "Let's explore the Worlds page where students begin their journey.",
      icon: Globe,
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            You&apos;re all set! Here&apos;s what happens next:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1">
                1
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Students see the Worlds page
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  They&apos;ll select South America to begin their journey
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1">
                2
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Choose the Amazon Adventure
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  The first adventure in the sequence
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 mt-1">
                3
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  Complete lessons
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Interactive activities make learning engaging and fun
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 p-4 rounded-lg border-2 border-cyan-200 dark:border-cyan-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Click &quot;Explore Habitat&quot; below to see the Worlds page
              where your students will start their adventure!
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
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
            Previous
          </button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? "Explore Habitat" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
