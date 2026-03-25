"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Create client for fetching challenge options
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ChallengeReferenceStepForm({ step, onChange }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available challenges on mount
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all challenge entries to get unique challenge_ids with counts
        const { data, error: fetchError } = await supabase
          .from("single_gap_challenge")
          .select("id, challenge_id, challenge_title")
          .not("challenge_id", "is", null)
          .order("challenge_id", { ascending: true });

        if (fetchError) {
          console.error("Error fetching challenges:", fetchError);
          setError("Failed to load challenges");
          return;
        }

        // Group by challenge_id to get unique challenges with exercise counts
        const challengeMap = new Map();
        data.forEach((row) => {
          if (challengeMap.has(row.challenge_id)) {
            const existing = challengeMap.get(row.challenge_id);
            existing.exerciseCount += 1;
          } else {
            challengeMap.set(row.challenge_id, {
              challenge_id: row.challenge_id,
              challenge_title: row.challenge_title || `Challenge ${row.challenge_id}`,
              exerciseCount: 1,
            });
          }
        });

        const uniqueChallenges = Array.from(challengeMap.values()).sort(
          (a, b) => a.challenge_id - b.challenge_id
        );

        setChallenges(uniqueChallenges);
      } catch (err) {
        console.error("Error in fetchChallenges:", err);
        setError("Failed to load challenges");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const updateField = (field, value) => {
    onChange({ ...step, [field]: value });
  };

  const selectedChallenge = challenges.find(
    (c) => c.challenge_id === step.challenge_id
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={step.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="e.g., Grammar Challenge"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Challenge
        </label>
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span className="text-sm">Loading challenges...</span>
          </div>
        ) : error ? (
          <div className="text-red-500 dark:text-red-400 text-sm py-2">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 text-primary-600 hover:text-primary-700 underline"
            >
              Retry
            </button>
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-yellow-600 dark:text-yellow-400 text-sm py-2">
            No challenges found in the database. Please add challenges to the
            single_gap_challenge table first.
          </div>
        ) : (
          <select
            value={step.challenge_id || ""}
            onChange={(e) => updateField("challenge_id", parseInt(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a challenge...</option>
            {challenges.map((challenge) => (
              <option key={challenge.challenge_id} value={challenge.challenge_id}>
                {challenge.challenge_title} (ID: {challenge.challenge_id}, {challenge.exerciseCount} exercise{challenge.exerciseCount !== 1 ? "s" : ""})
              </option>
            ))}
          </select>
        )}
        {selectedChallenge && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              <span className="font-semibold">Selected:</span>{" "}
              {selectedChallenge.challenge_title}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              This challenge has {selectedChallenge.exerciseCount} gap-fill exercise
              {selectedChallenge.exerciseCount !== 1 ? "s" : ""} that will be shown in sequence.
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description (optional)
        </label>
        <textarea
          value={step.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Brief description of the challenge"
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          How Challenge References Work
        </h4>
        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
          <li>• All exercises with the same Challenge ID are shown in sequence</li>
          <li>• Exercises are ordered by their row ID (ascending)</li>
          <li>• Students progress through each gap-fill one at a time</li>
          <li>• A completion screen shows their score at the end</li>
        </ul>
      </div>
    </div>
  );
}
