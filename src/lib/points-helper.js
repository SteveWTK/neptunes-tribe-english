// lib/points-helper.js
// Unified helper for adding points to user journeys

/**
 * Add points to a user's species journey and record in history
 * This is the single source of truth for all point-earning activities
 *
 * @param {Object} supabase - Supabase admin client
 * @param {string} userId - User's UUID
 * @param {number} points - Points to add (can be negative for deductions)
 * @param {string} sourceType - Type of point source (e.g., 'observation', 'challenge', 'season_bonus')
 * @param {string} description - Human-readable description of why points were earned
 * @param {Object} metadata - Optional additional metadata to store
 * @returns {Object} - Result with success status and updated journey data
 */
export async function addPointsToJourney(
  supabase,
  userId,
  points,
  sourceType,
  description,
  metadata = {}
) {
  try {
    // Get current journey
    const { data: journey, error: journeyError } = await supabase
      .from("user_species_journey")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (journeyError && journeyError.code !== "PGRST116") {
      console.error("Error fetching journey:", journeyError);
      return { success: false, error: journeyError.message };
    }

    const currentPoints = journey?.total_points || 0;
    const newTotalPoints = currentPoints + points;

    if (journey) {
      // Update existing journey
      const { data: updatedJourney, error: updateError } = await supabase
        .from("user_species_journey")
        .update({
          total_points: newTotalPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating journey points:", updateError);
        return { success: false, error: updateError.message };
      }

      // Record in points history
      await supabase.from("points_history").insert({
        user_id: userId,
        points_change: points,
        source_type: sourceType,
        description: description,
        metadata: metadata,
      });

      console.log(
        `💰 Added ${points} points to user ${userId} (${sourceType}): ${newTotalPoints} total`
      );

      return {
        success: true,
        previousPoints: currentPoints,
        pointsAdded: points,
        newTotalPoints: newTotalPoints,
        journey: updatedJourney,
      };
    } else {
      // Create new journey with initial points
      const { data: newJourney, error: createError } = await supabase
        .from("user_species_journey")
        .insert({
          user_id: userId,
          total_points: points,
          observations_count: 0,
          current_iucn_status: "DD",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating journey:", createError);
        return { success: false, error: createError.message };
      }

      // Record in points history
      await supabase.from("points_history").insert({
        user_id: userId,
        points_change: points,
        source_type: sourceType,
        description: description,
        metadata: metadata,
      });

      console.log(
        `💰 Created journey for user ${userId} with ${points} points (${sourceType})`
      );

      return {
        success: true,
        previousPoints: 0,
        pointsAdded: points,
        newTotalPoints: points,
        journey: newJourney,
      };
    }
  } catch (error) {
    console.error("Error in addPointsToJourney:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a user's current points total
 */
export async function getUserPoints(supabase, userId) {
  try {
    const { data: journey, error } = await supabase
      .from("user_species_journey")
      .select("total_points")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      totalPoints: journey?.total_points || 0,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Point values for different activities
 * Centralized configuration for easy adjustment
 */
export const POINT_VALUES = {
  // Observations
  OBSERVATION_SUBMITTED: 10,
  OBSERVATION_VERIFIED: 25,
  OBSERVATION_WITH_PHOTO: 5,
  OBSERVATION_FIRST_OF_SPECIES: 50,

  // Challenges
  CHALLENGE_COMPLETED: 100,
  BONUS_CHALLENGE_COMPLETED: 150,

  // Season/World progress
  SEASON_COMPLETION_BONUS: 500,
  WORLD_COMPLETED_ON_TIME: 500,

  // Streaks
  DAILY_STREAK_BONUS: 10, // Per day in streak
  WEEKLY_STREAK_BONUS: 50,

  // Social
  HELPED_IDENTIFY_SPECIES: 15,
};
