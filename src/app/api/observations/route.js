import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/observations
 * Fetches user's own observations
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await getSupabaseAdmin();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch user's observations
    const { data: observations, error, count } = await supabase
      .from("user_observations")
      .select("*", { count: "exact" })
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching observations:", error);
      return NextResponse.json(
        { error: "Failed to fetch observations", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      observations,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error in observations GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/observations
 * Creates a new observation
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      photoUrl,
      latitude,
      longitude,
      locationName,
      regionCode,
      observationDate,
      // AI identification data
      aiSpeciesName,
      aiScientificName,
      aiConfidence,
      aiAlternatives,
      aiEducationalNote,
      aiFamily,
      aiHabitat,
      aiConservationStatus,
      // Optional challenge association
      challengeId,
      // Visibility
      visibility = "public",
    } = body;

    // Validate required fields
    if (!title || !photoUrl || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required fields: title, photoUrl, latitude, longitude" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Get user ID (school_id is optional - may not exist in users table)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("❌ User lookup error:", userError);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Try to get school_id if the column exists (optional)
    let schoolId = null;
    try {
      const { data: schoolData } = await supabase
        .from("users")
        .select("school_id")
        .eq("id", userData.id)
        .single();
      schoolId = schoolData?.school_id || null;
    } catch {
      // school_id column doesn't exist yet - that's fine
    }

    // Calculate points for this observation
    const basePoints = 50; // Base points for any observation
    const aiConfidenceBonus = aiConfidence === "high" ? 25 : aiConfidence === "medium" ? 10 : 0;
    const pointsEarned = basePoints + aiConfidenceBonus;

    // Create observation
    const observationData = {
      user_id: userData.id,
      title,
      description: description || null,
      photo_url: photoUrl,
      latitude,
      longitude,
      location_name: locationName || null,
      region_code: regionCode || null,
      observation_date: observationDate || new Date().toISOString().split("T")[0],
      ai_species_name: aiSpeciesName || null,
      ai_scientific_name: aiScientificName || null,
      ai_confidence: aiConfidence || null,
      ai_alternatives: aiAlternatives || null,
      ai_educational_note: aiEducationalNote || null,
      ai_family: aiFamily || null,
      ai_habitat: aiHabitat || null,
      ai_conservation_status: aiConservationStatus || null,
      visibility,
      points_earned: pointsEarned,
      school_id: schoolId,
    };

    // If associated with a challenge, add the challenge reference
    if (challengeId) {
      // Find user's active challenge
      const { data: activeChallenge } = await supabase
        .from("user_active_challenges")
        .select("id")
        .eq("user_id", userData.id)
        .or(`ngo_challenge_id.eq.${challengeId},unpredictable_challenge_id.eq.${challengeId}`)
        .eq("status", "active")
        .single();

      if (activeChallenge) {
        observationData.user_challenge_id = activeChallenge.id;
      }
    }

    const { data: observation, error: insertError } = await supabase
      .from("user_observations")
      .insert(observationData)
      .select()
      .single();

    if (insertError) {
      console.error("Error creating observation:", insertError);
      return NextResponse.json(
        { error: "Failed to create observation", details: insertError.message },
        { status: 500 }
      );
    }

    // Update user's species journey (add points and increment observation count)
    await updateUserJourney(supabase, userData.id, pointsEarned);

    // If part of a challenge, update challenge progress
    if (observationData.user_challenge_id) {
      await updateChallengeProgress(supabase, observationData.user_challenge_id);
    }

    // Record points in history
    await recordPointsHistory(supabase, userData.id, pointsEarned, "observation", observation.id, `Observation: ${title}`);

    console.log(`✅ Created observation "${title}" for user ${userData.id}, earned ${pointsEarned} points`);

    return NextResponse.json({
      success: true,
      observation,
      pointsEarned,
      message: `Observation created! You earned ${pointsEarned} points.`,
    });
  } catch (error) {
    console.error("Error in observations POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Update user's species journey with new points
 */
async function updateUserJourney(supabase, userId, points) {
  try {
    // Get current journey
    const { data: journey, error: journeyError } = await supabase
      .from("user_species_journey")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (journeyError || !journey) {
      console.log("User has no species journey yet");
      return;
    }

    // Calculate new totals
    const newTotalPoints = (journey.total_points || 0) + points;
    const newObservationsCount = (journey.observations_count || 0) + 1;

    // Check if user should level up (improve IUCN status)
    const { data: threshold } = await supabase
      .from("iucn_thresholds")
      .select("*")
      .eq("from_status", journey.current_iucn_status)
      .single();

    let newStatus = journey.current_iucn_status;
    let levelProgress = journey.level_progress || 0;
    let statusChanged = false;

    if (threshold && newTotalPoints >= threshold.points_required) {
      // Level up!
      newStatus = threshold.to_status;
      statusChanged = true;
      // Reset progress for new level
      levelProgress = 0;
    } else if (threshold) {
      // Calculate progress percentage within current level
      const pointsInLevel = newTotalPoints - (journey.total_points - journey.level_progress * threshold.points_required / 100);
      levelProgress = Math.min(100, Math.floor((pointsInLevel / threshold.points_required) * 100));
    }

    // Update journey
    const { error: updateError } = await supabase
      .from("user_species_journey")
      .update({
        total_points: newTotalPoints,
        observations_count: newObservationsCount,
        current_iucn_status: newStatus,
        level_progress: levelProgress,
        last_status_change: statusChanged ? new Date().toISOString() : journey.last_status_change,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating user journey:", updateError);
    } else {
      console.log(`✅ Updated journey: ${newTotalPoints} points, ${newObservationsCount} observations, status: ${newStatus}`);
    }
  } catch (error) {
    console.error("Error in updateUserJourney:", error);
  }
}

/**
 * Update challenge progress when observation is submitted
 */
async function updateChallengeProgress(supabase, userChallengeId) {
  try {
    const { data: challenge, error: fetchError } = await supabase
      .from("user_active_challenges")
      .select("*")
      .eq("id", userChallengeId)
      .single();

    if (fetchError || !challenge) return;

    const newProgress = (challenge.progress_count || 0) + 1;
    const isComplete = newProgress >= challenge.target_count;

    const updateData = {
      progress_count: newProgress,
    };

    if (isComplete) {
      updateData.status = "completed";
      updateData.completed_at = new Date().toISOString();

      // Get points reward from the challenge
      let pointsReward = 0;
      if (challenge.ngo_challenge_id) {
        const { data: ngoChallenge } = await supabase
          .from("ngo_challenges")
          .select("points_reward")
          .eq("id", challenge.ngo_challenge_id)
          .single();
        pointsReward = ngoChallenge?.points_reward || 0;
      } else if (challenge.unpredictable_challenge_id) {
        const { data: unpredChallenge } = await supabase
          .from("unpredictable_challenges")
          .select("points_reward")
          .eq("id", challenge.unpredictable_challenge_id)
          .single();
        pointsReward = unpredChallenge?.points_reward || 0;
      }

      updateData.points_earned = pointsReward;
    }

    await supabase
      .from("user_active_challenges")
      .update(updateData)
      .eq("id", userChallengeId);

    console.log(`✅ Challenge progress: ${newProgress}/${challenge.target_count}${isComplete ? " - COMPLETED!" : ""}`);
  } catch (error) {
    console.error("Error updating challenge progress:", error);
  }
}

/**
 * Record points change in history
 */
async function recordPointsHistory(supabase, userId, points, sourceType, sourceId, description) {
  try {
    // Get current total (approximate, for audit trail)
    const { data: journey } = await supabase
      .from("user_species_journey")
      .select("total_points")
      .eq("user_id", userId)
      .single();

    const pointsBefore = (journey?.total_points || 0) - points;

    await supabase.from("points_history").insert({
      user_id: userId,
      points_change: points,
      points_before: Math.max(0, pointsBefore),
      points_after: journey?.total_points || points,
      source_type: sourceType,
      source_id: sourceId,
      description,
    });
  } catch (error) {
    console.error("Error recording points history:", error);
  }
}
