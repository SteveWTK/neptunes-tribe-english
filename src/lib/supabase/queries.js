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
export async function markLessonComplete(userId, lessonId, xpEarned = 0) {
  try {
    // Check if already completed
    const { data: existing } = await supabase
      .from("lesson_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single();

    if (existing) {
      console.log("Lesson already completed");
      return existing;
    }

    // Insert completion record
    const { data, error } = await supabase
      .from("lesson_completions")
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // TODO: Update user's total XP in users table if needed
    // You can add this logic here or in a database trigger

    return data;
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    throw error;
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

// Check if lesson is completed by user
export async function isLessonCompleted(userId, lessonId) {
  try {
    const { data, error } = await supabase
      .from("lesson_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = not found
    return !!data;
  } catch (error) {
    console.error("Error checking lesson completion:", error);
    return false;
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