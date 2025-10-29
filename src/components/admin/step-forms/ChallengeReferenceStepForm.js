"use client";

import React from "react";

export default function ChallengeReferenceStepForm({ step, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...step, [field]: value });
  };

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
          Challenge ID
        </label>
        <input
          type="number"
          value={step.challenge_id || ""}
          onChange={(e) => updateField("challenge_id", parseInt(e.target.value) || "")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Enter challenge ID (e.g., 4)"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          The ID of the challenge from the gap_fill_questions table in Supabase
        </p>
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
          <li>• References a SingleGapFillSeries challenge by ID</li>
          <li>• Embeds the full gap-fill exercise inline within the lesson</li>
          <li>• Uses the same scoring and progress tracking as standalone challenges</li>
          <li>• Perfect for adding grammar or vocabulary exercises to lesson flows</li>
        </ul>
      </div>
    </div>
  );
}
