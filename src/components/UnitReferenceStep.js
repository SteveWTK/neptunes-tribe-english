"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { BookOpen, Play } from "lucide-react";

/**
 * UnitReferenceStep - Displays unit preview before opening modal
 * Fetches unit data from Supabase and shows title, description, and image
 */
export default function UnitReferenceStep({
  unitId,
  instructions,
  onStartExercise,
}) {
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUnit() {
      if (!unitId) {
        setError("No unit ID provided");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("units")
          .select("id, title, description, image, theme, difficulty_level")
          .eq("id", unitId)
          .single();

        if (fetchError) throw fetchError;
        setUnit(data);
      } catch (err) {
        console.error("Error fetching unit:", err);
        setError("Failed to load unit data");
      } finally {
        setLoading(false);
      }
    }

    fetchUnit();
  }, [unitId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading exercise...</p>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
          {error || "Unit not found"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Unit ID: {unitId}</p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {instructions && (
        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300 text-center">
            {instructions}
          </p>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Unit Image */}
          {unit.image && (
            <div className="relative w-full h-64 md:h-80 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20">
              <Image
                src={unit.image}
                alt={unit.title}
                fill
                className="object-cover absolute bottom-36"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Difficulty badge */}
              {unit.difficulty_level && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-900 dark:text-white">
                    {unit.difficulty_level}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Unit Content */}
          <div className="p-6 md:p-8">
            {/* Theme badge */}
            {unit.theme && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  {unit.theme}
                </span>
              </div>
            )}

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {unit.title}
            </h2>

            {/* Description */}
            {unit.description && (
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {unit.description}
              </p>
            )}

            {/* Start button */}
            <button
              onClick={onStartExercise}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Exercise
            </button>

            {/* Helper text */}
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Listen to the audio and complete this gap-fill exercise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
