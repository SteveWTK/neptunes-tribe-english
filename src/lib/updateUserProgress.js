// lib/updateUserProgress.js
import { supabase } from "./supabase-browser";
import { getTodayString } from "./dateUtils"; // format as YYYY-MM-DD

export async function updateUserProgress(userId, unitId, xpEarned) {
  const { data: existingProgress, error: fetchError } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Fetch error:", fetchError);
    return;
  }

  const today = getTodayString();
  const currentXp = existingProgress?.xp || 0;
  const newXp = currentXp + xpEarned;

  // Optional: Basic level calc logic
  const calculateLevel = (xp) => Math.floor(xp / 100); // e.g. 100 XP per level

  const newLevel = calculateLevel(newXp);
  const lastActive = existingProgress?.last_active;
  const isNewDay = lastActive !== today;
  const newStreak = isNewDay
    ? (existingProgress?.streak || 0) + 1
    : existingProgress?.streak || 0;

  const updatePayload = {
    user_id: userId,
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    last_active: today,
    ...(existingProgress ? {} : { created_at: new Date().toISOString() }),
  };

  const upsertRes = await supabase
    .from("user_progress")
    .upsert(updatePayload, { onConflict: "user_id" });

  // Also log the completed unit
  const { error: unitError } = await supabase
    .from("user_unit_completions")
    .insert({ user_id: userId, unit_id: unitId });

  // Also add XP to user's species journey (for unified leaderboard)
  await addXpToJourney(userId, xpEarned, unitId);

  if (upsertRes.error) console.error("Progress update error:", upsertRes.error);
  if (unitError && unitError.code !== "23505")
    console.error("Unit insert error:", unitError);
}

/**
 * Add XP earned from lessons to user's species journey
 * This ensures the journey total reflects ALL points (lessons + observations)
 */
async function addXpToJourney(userId, xpEarned, unitId) {
  try {
    // Get user's current journey
    const { data: journey, error: journeyError } = await supabase
      .from("user_species_journey")
      .select("id, total_points")
      .eq("user_id", userId)
      .single();

    if (journeyError) {
      // User hasn't started journey yet - that's fine, they'll get points later
      if (journeyError.code === "PGRST116") {
        console.log("User has no species journey yet, skipping XP addition");
        return;
      }
      console.error("Error fetching journey for XP update:", journeyError);
      return;
    }

    // Update journey with additional points
    const newTotalPoints = (journey.total_points || 0) + xpEarned;

    const { error: updateError } = await supabase
      .from("user_species_journey")
      .update({
        total_points: newTotalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error adding XP to journey:", updateError);
    } else {
      console.log(`✅ Added ${xpEarned} lesson XP to journey. New total: ${newTotalPoints}`);
    }

    // Optionally record in points_history for audit trail
    try {
      await supabase.from("points_history").insert({
        user_id: userId,
        points_change: xpEarned,
        points_before: journey.total_points || 0,
        points_after: newTotalPoints,
        source_type: "lesson",
        source_id: unitId,
        description: `Lesson completion XP`,
      });
    } catch (historyError) {
      // Points history is optional, don't fail if it errors
      console.log("Could not record points history (optional):", historyError.message);
    }
  } catch (error) {
    console.error("Error in addXpToJourney:", error);
  }
}
