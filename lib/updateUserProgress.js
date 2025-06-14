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

  if (upsertRes.error) console.error("Progress update error:", upsertRes.error);
  if (unitError && unitError.code !== "23505")
    console.error("Unit insert error:", unitError);
}
