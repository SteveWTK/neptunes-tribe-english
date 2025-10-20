// app/(site)/lesson/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Play,
  Lock,
  CheckCircle,
  Calendar,
  Globe,
  TreePine,
  Waves,
  Mountain,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createClient } from "@/lib/supabase/client";

function LessonListContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [currentTheme, setCurrentTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLessons();
      loadCompletedLessons();
      loadCurrentTheme();
    }
  }, [user]);

  async function loadLessons() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error loading lessons:", error);
    }
  }

  async function loadCompletedLessons() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lesson_completions")
        .select("lesson_id")
        .eq("user_id", user.userId);

      if (error) throw error;
      const completedIds = (data || []).map((c) => c.lesson_id);
      setCompletedLessons(completedIds);
    } catch (error) {
      console.error("Error loading completed lessons:", error);
    }
  }

  async function loadCurrentTheme() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_current_weekly_theme");

      if (!error && data) {
        setCurrentTheme(data);
      }
    } catch (error) {
      console.error("Error loading weekly theme:", error);
    } finally {
      setLoading(false);
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "advanced":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "expert":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getEcosystemIcon = (ecosystem) => {
    switch (ecosystem?.toLowerCase()) {
      case "forest":
      case "rainforest":
        return <TreePine className="w-5 h-5" />;
      case "ocean":
      case "marine":
        return <Waves className="w-5 h-5" />;
      case "mountain":
      case "alpine":
        return <Mountain className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lessons
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore lessons about ecosystems and environmental topics
          </p>
        </div>

        {/* Current Weekly Theme */}
        {currentTheme && (
          <div className="mb-8 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                This Week&apos;s Theme
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {currentTheme.theme_name}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {currentTheme.description}
            </p>
            <button
              onClick={() => router.push("/eco-map")}
              className="mt-4 inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Globe className="w-4 h-4" />
              View on Eco Map
            </button>
          </div>
        )}

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No lessons available yet. Check back soon!
              </p>
            </div>
          ) : (
            lessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.id);
              const isUnderConstruction = lesson.under_construction;

              return (
                <div
                  key={lesson.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
                    isUnderConstruction ? "opacity-75" : ""
                  }`}
                >
                  {/* Lesson Image */}
                  {lesson.image_url && (
                    <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700">
                      <img
                        src={lesson.image_url}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
                          lesson.difficulty
                        )}`}
                      >
                        {lesson.difficulty || "All Levels"}
                      </span>
                      {isCompleted && (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                      {isUnderConstruction && (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {lesson.description ||
                        "Complete this lesson to earn XP and unlock achievements!"}
                    </p>

                    {/* Lesson Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {lesson.content?.steps?.length || 0} steps
                      </span>
                      <span className="font-medium text-accent-600 dark:text-accent-400">
                        +{lesson.xp_reward || 100} XP
                      </span>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        if (!isUnderConstruction) {
                          router.push(`/lesson/${lesson.id}`);
                        }
                      }}
                      disabled={isUnderConstruction}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        isUnderConstruction
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500"
                          : isCompleted
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                          : "bg-primary-600 text-white hover:bg-primary-700"
                      }`}
                    >
                      {isUnderConstruction ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Coming Soon
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Review Lesson
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Lesson
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Navigation Links */}
        <div className="mt-12 flex justify-center gap-6">
          <Link
            href="/units"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Browse Units
          </Link>
          <Link
            href="/eco-map"
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Explore Eco Map
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LessonsPage() {
  return (
    <ProtectedRoute>
      <LessonListContent />
    </ProtectedRoute>
  );
}
