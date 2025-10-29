"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";

/**
 * FloatingFacts Component
 * Displays tasteful hovering modals with key facts
 * Facts rotate/cycle automatically in a loop
 */
export default function FloatingFacts({ facts = [] }) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // If no facts, don't render anything
  if (!facts || facts.length === 0) return null;

  const currentFact = facts[currentFactIndex];

  // Cycle through facts every 6 seconds
  useEffect(() => {
    if (facts.length <= 1) return; // No need to cycle if only one fact

    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 6000); // 6 seconds per fact

    return () => clearInterval(interval);
  }, [facts.length]);

  // Parse fact to check if it has a label (e.g., "Habitat: ...")
  const parseFactLabel = (fact) => {
    const colonIndex = fact.indexOf(':');
    if (colonIndex > 0 && colonIndex < 20) { // Label should be reasonably short
      return {
        label: fact.substring(0, colonIndex).trim(),
        value: fact.substring(colonIndex + 1).trim()
      };
    }
    return { label: null, value: fact };
  };

  const { label, value } = parseFactLabel(currentFact);

  if (!isVisible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentFactIndex}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="fixed top-24 right-4 md:right-8 z-40 max-w-xs"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-primary-200 dark:border-primary-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Info className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {label || "Did You Know?"}
              </span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {value}
            </p>
          </div>

          {/* Progress indicator (if multiple facts) */}
          {facts.length > 1 && (
            <div className="px-4 pb-3 flex gap-1 justify-center">
              {facts.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentFactIndex
                      ? "bg-primary-500 w-6"
                      : "bg-gray-300 dark:bg-gray-600 w-2"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Subtle pulsing glow effect */}
        <div className="absolute inset-0 bg-primary-400/20 dark:bg-primary-600/20 rounded-xl blur-xl -z-10 animate-pulse" />
      </motion.div>
    </AnimatePresence>
  );
}
