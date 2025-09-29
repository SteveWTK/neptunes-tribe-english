"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/data-service";

export default function UnitReferenceStepForm({ step, onChange }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnits();
  }, []);

  async function loadUnits() {
    try {
      const { data, error } = await supabase
        .from("units")
        .select("id, title, description, theme, difficulty_level, region_name")
        .order("id");

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error("Error loading units:", error);
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    onChange({ ...step, [field]: value });
  }

  const selectedUnit = units.find((u) => u.id === step.unit_id);

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
          placeholder="e.g., Amazon Rainforest: Lungs of the Earth"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Unit *
        </label>
        {loading ? (
          <div className="text-sm text-gray-500">Loading units...</div>
        ) : (
          <select
            value={step.unit_id || ""}
            onChange={(e) => updateField("unit_id", parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Choose a unit...</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                Unit {unit.id}: {unit.title} ({unit.region_name || "Global"})
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedUnit && (
        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
          <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">
            Selected Unit Preview
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            <strong>Theme:</strong> {selectedUnit.theme}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
            <strong>Difficulty:</strong> {selectedUnit.difficulty_level}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {selectedUnit.description}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Instructions (optional)
        </label>
        <textarea
          value={step.instructions || ""}
          onChange={(e) => updateField("instructions", e.target.value)}
          rows={3}
          placeholder="Additional instructions for this unit exercise (optional)"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <strong>Note:</strong> This step will display the selected unit's multi-gap-fill
          exercise. Students will complete the exercise as they normally would in the Units section.
        </p>
      </div>
    </div>
  );
}