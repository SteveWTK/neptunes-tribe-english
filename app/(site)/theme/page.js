// app/(site)/theme/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Calendar,
  BookOpen,
  Play,
  CheckCircle,
  Lock,
  Target,
  Award,
  Users,
  TreePine,
  Waves,
  Mountain,
  Sparkles,
  ChevronRight,
  MapPin,
  Clock,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { createClient } from "@/lib/supabase/client";

function ThemeHubContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(null);
  const [units, setUnits] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [completedUnits, setCompletedUnits] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState({
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadThemeContent();
    }
  }, [user]);

  async function loadThemeContent() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get current weekly theme
      const { data: themeData, error: themeError } = await supabase.rpc(
        "get_current_weekly_theme"
      );

      if (themeError || !themeData || themeData.length === 0) {
        console.error("Error loading theme:", themeError);
        setLoading(false);
        return;
      }

      const currentThemeData = themeData[0]; // RPC returns an array
      setCurrentTheme(currentThemeData);

      // Load units related to this theme using theme_tags
      const themeTag = currentThemeData.theme_tag || "amazon"; // Fallback for testing

      const { data: unitsData, error: unitsError } = await supabase
        .from("units")
        .select("*")
        .contains("theme_tags", [themeTag])
        .limit(6);

      if (!unitsError) {
        setUnits(unitsData || []);
      } else {
        console.error("Error loading units:", unitsError);
        // Fallback: load some units anyway for testing
        const { data: fallbackUnits } = await supabase
          .from("units")
          .select("*")
          .limit(6);
        setUnits(fallbackUnits || []);
      }

      // Load lessons related to this theme using theme_tags
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("*")
        .eq("is_active", true)
        .contains("theme_tags", [themeTag])
        .order("sort_order");

      if (!lessonsError) {
        setLessons(lessonsData || []);
      } else {
        console.error("Error loading lessons:", lessonsError);
        // Fallback: load some lessons anyway for testing
        const { data: fallbackLessons } = await supabase
          .from("lessons")
          .select("*")
          .eq("is_active", true)
          .order("sort_order")
          .limit(5);
        setLessons(fallbackLessons || []);
      }

      // Load user's completions
      if (user?.userId) {
        // Check completed units (simplified - you may need to adjust based on your tracking)
        const completedUnitIds = []; // You'll need to implement unit completion tracking
        setCompletedUnits(completedUnitIds);

        // Check completed lessons
        const { data: completions } = await supabase
          .from("lesson_completions")
          .select("lesson_id")
          .eq("user_id", user.userId);

        if (completions) {
          setCompletedLessons(completions.map((c) => c.lesson_id));
        }
      }

      // Calculate weekly progress
      const totalActivities =
        (unitsData?.length || 0) + (lessonsData?.length || 0);
      const completedActivities =
        completedUnits.length + completedLessons.length;
      setWeeklyProgress({
        completed: completedActivities,
        total: totalActivities,
      });
    } catch (error) {
      console.error("Error loading theme content:", error);
    } finally {
      setLoading(false);
    }
  }

  const getEcosystemIcon = (ecosystem) => {
    switch (ecosystem?.toLowerCase()) {
      case "forest":
      case "rainforest":
      case "amazon":
        return <TreePine className="w-6 h-6" />;
      case "ocean":
      case "marine":
        return <Waves className="w-6 h-6" />;
      case "mountain":
      case "alpine":
        return <Mountain className="w-6 h-6" />;
      default:
        return <Globe className="w-6 h-6" />;
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      beginner:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      intermediate:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      advanced:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      expert: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[difficulty?.toLowerCase()] || colors.beginner;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentTheme) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-primary-900 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Active Theme
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Check back soon for this week&apos;s environmental theme!
          </p>
          <button
            onClick={() => router.push("/eco-map")}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700"
          >
            Return to Eco-Map
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage =
    weeklyProgress.total > 0
      ? Math.round((weeklyProgress.completed / weeklyProgress.total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-primary-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 dark:from-primary-800 dark:via-primary-900 dark:to-accent-700 rounded-b-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              {getEcosystemIcon(currentTheme.ecosystem_type)}
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Calendar className="w-4 h-4" />
                <span>This Week&apos;s Theme</span>
              </div>
              <h1 className="text-3xl font-bold">{currentTheme.theme_title}</h1>
            </div>
          </div>

          <p className="text-lg text-white/90 mb-6 max-w-3xl">
            {currentTheme.description}
          </p>

          {/* Progress Bar */}
          <div className="bg-white/20 rounded-full h-3 backdrop-blur-sm">
            <div
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-white/80">
              {weeklyProgress.completed} of {weeklyProgress.total} activities
              completed
            </span>
            <span className="text-sm font-medium">
              {progressPercentage}% Complete
            </span>
          </div>

          {/* Quick Stats */}
          {/* <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80">Weekly Goal</span>
              </div>
              <p className="text-2xl font-bold">5 Activities</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80">XP Available</span>
              </div>
              <p className="text-2xl font-bold">
                {units.length * 50 + lessons.length * 100} XP
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80">Active Learners</span>
              </div>
              <p className="text-2xl font-bold">247</p>
            </div>
          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Unit Images Carousel - Emphasizing Units as Foundation */}
        {units.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Start Your Journey with these Units
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                The weekly lesson builds upon vocabulary and concepts from our{" "}
                {currentTheme.theme_title} units. Begin with them to prepare for
                the practice activities in the lesson.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {units.slice(0, 6).map((unit, index) => {
                const isCompleted = completedUnits.includes(unit.id);
                const isPremium = unit.is_premium;

                return (
                  <div
                    key={unit.id}
                    className={`group relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                      index >= 3 ? "hidden lg:block" : ""
                    } ${index >= 2 ? "hidden md:block" : ""}`}
                    onClick={() => {
                      if (!isPremium || user?.is_premium) {
                        router.push(`/units/${unit.id}`);
                      }
                    }}
                  >
                    {/* Image Container */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden relative">
                      {unit.image ? (
                        <img
                          src={unit.image}
                          alt={unit.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = `/api/placeholder/200/200?text=Unit+${unit.id}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-800 dark:to-accent-800">
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {unit.id}
                          </span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                      {/* Status Indicators */}
                      <div className="absolute top-2 right-2">
                        {isCompleted && (
                          <div className="bg-green-600 text-white rounded-full p-1">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                        )}
                        {isPremium && !user?.is_premium && (
                          <div className="bg-gray-900/80 text-white rounded-full p-1">
                            <Lock className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 text-primary-600 rounded-full p-3 shadow-lg">
                          <Play className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Unit Info */}
                    <div className="mt-3 text-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                        {unit.title}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Unit {unit.id}
                        </span>
                        <span className="text-xs font-medium text-accent-600 dark:text-accent-400">
                          +50 XP
                        </span>
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getDifficultyBadge(
                          unit.difficulty_level
                        )}`}
                      >
                        {unit.length_text} gaps
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Call to Action */}
            {/* <div className="text-center mt-8">
              <button
                onClick={() => router.push("/units")}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Explore All Units
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Master vocabulary first, then dive into comprehensive lessons
                below
              </p>
            </div> */}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Units Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Foundation Units
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your starting point
                </p>
              </div>
              <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>

            <div className="space-y-4">
              {units.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    No units available for this theme yet.
                  </p>
                </div>
              ) : (
                units.map((unit) => {
                  const isCompleted = completedUnits.includes(unit.id);
                  const isPremium = unit.is_premium;

                  return (
                    <div
                      key={unit.id}
                      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => {
                        if (!isPremium || user?.is_premium) {
                          router.push(`/units/${unit.id}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Unit {unit.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDifficultyBadge(
                                unit.difficulty_level
                              )}`}
                            >
                              {unit.length_text} gaps
                            </span>
                            {isPremium && !user?.is_premium && (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {unit.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {unit.description}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              {unit.length || 5} min
                            </span>
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              {unit.region_name}
                            </span>
                            <span className="font-medium text-accent-600 dark:text-accent-400">
                              +50 XP
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {units.length > 0 && (
              <button
                onClick={() => router.push("/units")}
                className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium"
              >
                View all units →
              </button>
            )}
          </div>

          {/* Lessons Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Practice and Revision
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Multi-step journeys that build on what you learnt in the units
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>

            <div className="space-y-4">
              {lessons.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    Lessons coming soon!
                  </p>
                </div>
              ) : (
                lessons.slice(0, 5).map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.id);
                  const isLocked = lesson.under_construction;

                  return (
                    <div
                      key={lesson.id}
                      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                      {lesson.image_url && (
                        <div className="h-32 bg-gray-100 dark:bg-gray-700">
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
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {/* <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDifficultyBadge(
                                  lesson.difficulty
                                )}`}
                              >
                                {lesson.difficulty || "All Levels"}
                              </span> */}
                              {isLocked && (
                                <Lock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                              {lesson.description ||
                                "Multi-step learning experience"}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                  {lesson.content?.steps?.length || 0} steps
                                </span>
                                <span className="font-medium text-accent-600 dark:text-accent-400">
                                  +{lesson.xp_reward || 100} XP
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isLocked) {
                                    router.push(`/lesson/${lesson.id}`);
                                  }
                                }}
                                disabled={isLocked}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                  isLocked
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                                    : isCompleted
                                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-primary-600 text-white hover:bg-primary-700"
                                }`}
                              >
                                {isLocked ? (
                                  "Coming Soon"
                                ) : isCompleted ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" />
                                    Review
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3" />
                                    Start
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {lessons.length > 0 && (
              <button
                onClick={() => router.push("/lesson")}
                className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 text-sm font-medium"
              >
                View all lessons →
              </button>
            )}
          </div>
        </div>

        {/* Weekly Challenge */}
        <div className="mt-12 bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-xl p-6 border border-accent-200 dark:border-accent-800">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                🏆 Weekly Challenge
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Complete 5 activities this week to earn the{" "}
                <span className="font-semibold">
                  {currentTheme.theme_title} Explorer
                </span>{" "}
                badge!
              </p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800"
                    />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
                    +243
                  </div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  247 learners participating
                </span>
              </div>
            </div>
            <Award className="w-12 h-12 text-accent-600 dark:text-accent-400" />
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-center gap-6">
          <button
            onClick={() => router.push("/eco-map")}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Back to Eco-Map
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ThemeHubPage() {
  return (
    <ProtectedRoute>
      <ThemeHubContent />
    </ProtectedRoute>
  );
}
