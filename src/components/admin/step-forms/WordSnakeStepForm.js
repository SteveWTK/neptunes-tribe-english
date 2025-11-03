"use client";

import React from "react";
import { Plus, Trash2, HelpCircle } from "lucide-react";

export default function WordSnakeStepForm({ step, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...step, [field]: value });
  };

  const addClue = () => {
    const newClue = {
      clue: "",
      answer: "",
      hint: "",
      fact: "",
    };
    updateField("clues", [...(step.clues || []), newClue]);
  };

  const updateClue = (index, field, value) => {
    const updated = [...(step.clues || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField("clues", updated);
  };

  const removeClue = (index) => {
    const updated = (step.clues || []).filter((_, i) => i !== index);
    updateField("clues", updated);
  };

  const moveClue = (index, direction) => {
    const updated = [...(step.clues || [])];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < updated.length) {
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      updateField("clues", updated);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Step Title
        </label>
        <input
          type="text"
          value={step.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g., Word Snake: Amazon Vocabulary Challenge"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Instructions (optional)
        </label>
        <textarea
          value={step.instructions || ""}
          onChange={(e) => updateField("instructions", e.target.value)}
          rows={2}
          placeholder="E.g., Collect letters to spell environmental vocabulary words!"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Difficulty Level
        </label>
        <select
          value={step.difficulty || "easy"}
          onChange={(e) => updateField("difficulty", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="easy">
            Easy - Only correct letters appear (recommended for beginners)
          </option>
          <option value="hard">
            Hard - Includes distractor letters and erasers
          </option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          <strong>Easy:</strong> Perfect for first-time players. Only shows
          correct letters, wrong letters make a sound but aren&apos;t picked up.
          <br />
          <strong>Hard:</strong> For experienced players. Includes random
          letters and eraser tiles for extra challenge.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">How Word Snake Works:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Students move a snake to collect letters in order</li>
              <li>They must spell the answer word based on the clue</li>
              <li>
                The snake speeds up slightly after each word (progressive
                difficulty)
              </li>
              <li>Recommended: 3-5 words per mini-game</li>
              <li>Words should relate to the lesson topic</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Word Clues ({(step.clues || []).length} words)
          </h4>
          <button
            type="button"
            onClick={addClue}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Clue
          </button>
        </div>

        {(step.clues || []).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p>
              No clues added yet. Click &quot;Add Clue&quot; to get started!
            </p>
          </div>
        )}

        <div className="space-y-4">
          {(step.clues || []).map((clue, index) => (
            <div
              key={index}
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded font-semibold text-sm">
                    Word {index + 1}
                  </span>
                  {clue.answer && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded font-mono text-sm font-bold">
                      {clue.answer.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveClue(index, -1)}
                    disabled={index === 0}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveClue(index, 1)}
                    disabled={index === (step.clues || []).length - 1}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeClue(index)}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                    title="Remove clue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Answer Word/Phrase *
                  </label>
                  <input
                    type="text"
                    value={clue.answer || ""}
                    onChange={(e) =>
                      updateClue(index, "answer", e.target.value.toUpperCase())
                    }
                    placeholder="e.g., WHALE or CORAL REEF"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono font-bold"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use spaces for multi-word answers. Only letters and spaces
                    allowed.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Clue *
                  </label>
                  <input
                    type="text"
                    value={clue.clue || ""}
                    onChange={(e) => updateClue(index, "clue", e.target.value)}
                    placeholder="e.g., Largest animal on Earth"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hint (shown after 30s)
                  </label>
                  <input
                    type="text"
                    value={clue.hint || ""}
                    onChange={(e) => updateClue(index, "hint", e.target.value)}
                    placeholder="e.g., Found in the ocean"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Educational Fact
                  </label>
                  <textarea
                    value={clue.fact || ""}
                    onChange={(e) => updateClue(index, "fact", e.target.value)}
                    placeholder="Interesting fact shown after completing the word"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(step.clues || []).length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            <strong>✓ Ready!</strong> This mini-game will have{" "}
            <strong>{(step.clues || []).length} words</strong> for students to
            spell. Recommended: 3-5 words.
          </p>
        </div>
      )}
    </div>
  );
}
