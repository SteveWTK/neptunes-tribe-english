// app\(site)\challenges\[challengeId]\ChallengePageClient.js
"use client";

import { useState } from "react";
import SingleGapFillSeries from "@/app/components/gapfill/SingleGapFillSeries";
import Link from "next/link";

export default function ChallengePageClient({ exercises, challengeId }) {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro && exercises.length > 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-primary-900 flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Back to Challenges Link */}
          <Link
            href="/challenges"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-6 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Challenges
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {exercises[0]?.challengeTitle || `Challenge ${challengeId}`}
          </h1>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
              Ready for the Challenge?
            </h2>
            <p className="text-blue-700 dark:text-blue-200 mb-6 text-lg">
              This series contains <strong>{exercises.length} exercises</strong>{" "}
              designed to test and improve your English skills. Each correct
              answer earns you 10 XP!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {exercises.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Exercises
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {exercises.length * 10}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Max XP
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ~{Math.ceil(exercises.length * 0.5)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Minutes
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            Start Challenge
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-8 bg-white dark:bg-primary-900">
      {/* Header with back link */}
      <div className="w-full max-w-4xl px-4 mb-4">
        <Link
          href="/challenges"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Challenges
        </Link>
      </div>

      <SingleGapFillSeries exercises={exercises} />
    </div>
  );
}
