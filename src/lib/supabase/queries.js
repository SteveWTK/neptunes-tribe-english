// lib/supabase/queries.js
// Lesson-related queries for student-facing features
// Uses browser-safe client with RLS

import { createClient } from "./client";

const supabase = createClient();

// Get a lesson by ID (for lesson player)
export async function getLessonById(lessonId) {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching lesson:", error);
    throw error;
  }
}

// Mark a lesson as complete for a user
// Uses API route to handle authentication and RLS
export async function markLessonComplete(userId, lessonId, xpEarned = 0) {
  try {
    const response = await fetch("/api/lesson-completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lessonId,
        xpEarned,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      throw new Error(errorData.error || "Failed to mark lesson complete");
    }

    const result = await response.json();
    console.log("✅ Lesson completion result:", result);
    return result.data;
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    throw error;
  }
}

// Check if a lesson is completed
export async function isLessonCompleted(lessonId) {
  try {
    const response = await fetch(
      `/api/lesson-completion?lessonId=${lessonId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API error:", errorData);
      return false;
    }

    const result = await response.json();
    return result.completed;
  } catch (error) {
    console.error("Error checking lesson completion:", error);
    return false;
  }
}

// Get user's preferred language for lessons
export async function getPlayerPreferredLanguage(userId) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("preferred_language")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data?.preferred_language || "en";
  } catch (error) {
    console.error("Error fetching preferred language:", error);
    return "en"; // Default to English
  }
}

// Get all lessons completed by user
export async function getUserCompletedLessons(userId) {
  try {
    const { data, error } = await supabase
      .from("lesson_completions")
      .select("lesson_id, completed_at, xp_earned")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching completed lessons:", error);
    return [];
  }
}

// Ensure user has a progress record (legacy from FieldTalk, may not be needed)
export async function ensurePlayerProgress(userId) {
  // This function exists for compatibility with FieldTalk's AuthProvider
  // In Neptune's Tribe, user records are created via NextAuth callbacks
  // You can leave this as a no-op or use it to initialize any progress tables
  console.log("ensurePlayerProgress called for user:", userId);
  return true;
}