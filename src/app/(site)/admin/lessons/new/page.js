"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import {
  createLesson,
  getAllPillarsForCMS,
} from "@/lib/supabase/lesson-queries";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { WORLDS } from "@/data/worldsConfig";

function NewLessonContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [pillars, setPillars] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedWorldId, setSelectedWorldId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    description_pt: "",
    pillar_id: "",
    difficulty: "Beginner",
    xp_reward: 100,
    sort_order: 0,
    target_audience: "players",
    is_active: false,
    world: "",
    theme_tags: "",
    content: {
      type: "multi_step",
      steps: [],
    },
  });

  // Get worlds array for dropdown
  const worldsArray = Object.values(WORLDS);

  // Get adventures for selected world
  const selectedWorld = selectedWorldId ? WORLDS[selectedWorldId] : null;
  const adventures = selectedWorld ? selectedWorld.adventures : [];

  // Debug logging
  useEffect(() => {
    console.log("Form data:", formData);
    console.log("Selected world ID:", selectedWorldId);
    console.log("Adventures available:", adventures.length);
  }, [formData.world, selectedWorldId, adventures.length]);

  // Sync selectedWorldId when formData.world changes (e.g., when loading existing lesson)
  useEffect(() => {
    if (formData.world && formData.world !== selectedWorldId) {
      setSelectedWorldId(formData.world);
    }
  }, [formData.world, selectedWorldId]);

  useEffect(() => {
    loadPillars();
  }, []);

  async function loadPillars() {
    try {
      const pillarsData = await getAllPillarsForCMS();
      setPillars(pillarsData);
    } catch (error) {
      console.error("Error loading pillars:", error);
    }
  }

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreate() {
    if (!formData.title) {
      alert("Please enter a lesson title");
      return;
    }

    if (!formData.pillar_id) {
      alert("Please select a pillar");
      return;
    }

    try {
      setSaving(true);

      // Prepare data for Supabase - theme_tags must be an array
      const lessonData = {
        ...formData,
        theme_tags: formData.theme_tags ? [formData.theme_tags] : null,
        world: formData.world || null,
      };

      console.log("Creating lesson with data:", lessonData);

      const newLesson = await createLesson(lessonData);
      alert("Lesson created successfully!");
      router.push(`/admin/lessons/${newLesson.id}/edit`);
    } catch (error) {
      console.error("Error creating lesson:", error);
      alert("Failed to create lesson. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-900">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/lessons")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Lesson
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up basic information, then add steps
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Creating..." : "Create Lesson"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., Welcome to the Academy"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pillar *
                </label>
                <select
                  value={formData.pillar_id}
                  onChange={(e) => updateField("pillar_id", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a pillar</option>
                  {pillars.map((pillar) => (
                    <option key={pillar.id} value={pillar.id}>
                      {pillar.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => updateField("difficulty", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Survival Absolute">Survival Absolute</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {/* World and Adventure Selection */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                World & Adventure Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    World
                  </label>
                  <select
                    value={formData.world || ""}
                    onChange={(e) => {
                      const worldId = e.target.value;
                      console.log("World selected:", worldId);
                      setSelectedWorldId(worldId);
                      setFormData((prev) => ({
                        ...prev,
                        world: worldId,
                        theme_tags: "", // Reset adventure when world changes
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a world (optional)</option>
                    {worldsArray.map((world) => (
                      <option key={world.id} value={world.id}>
                        {world.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Assign to one of the 7 continents/regions
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adventure
                  </label>
                  <select
                    value={formData.theme_tags || ""}
                    onChange={(e) => {
                      const themeTag = e.target.value;
                      console.log("Adventure selected:", themeTag);
                      updateField("theme_tags", themeTag);
                    }}
                    disabled={!formData.world}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select an adventure (optional)</option>
                    {adventures.map((adventure) => (
                      <option key={adventure.themeTag} value={adventure.themeTag}>
                        Week {adventure.week}: {adventure.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.world
                      ? "Select one of the 4 weekly adventures"
                      : "Select a world first"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.target_audience}
                  onChange={(e) =>
                    updateField("target_audience", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="users">Users</option>
                  <option value="schools">Schools</option>
                  <option value="both">Both</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Who should see this lesson?
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (English)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={3}
                placeholder="Brief description of what students will learn"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Portuguese)
              </label>
              <textarea
                value={formData.description_pt}
                onChange={(e) => updateField("description_pt", e.target.value)}
                rows={3}
                placeholder="Descrição breve do que os alunos aprenderão"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  XP Reward
                </label>
                <input
                  type="number"
                  value={formData.xp_reward}
                  onChange={(e) =>
                    updateField("xp_reward", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    updateField("sort_order", parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => updateField("is_active", e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Make lesson active (visible to students)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.under_construction || false}
                  onChange={(e) =>
                    updateField("under_construction", e.target.checked)
                  }
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Under Construction (shows as unclickable)
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                <p className="text-sm text-primary-800 dark:text-primary-200">
                  <strong>Next Step:</strong> After creating the lesson,
                  you&apos;ll be able to add steps (scenarios, vocabulary,
                  exercises, etc.) in the lesson editor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewLesson() {
  return (
    <ProtectedRoute allowedRoles={["platform_admin"]}>
      <NewLessonContent />
    </ProtectedRoute>
  );
}
