import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/lessons/complete
 * Mark a lesson as complete and increment IUCN progress
 *
 * Request body:
 * {
 *   lessonId: string,
 *   adventureId: string,
 *   worldId: string,
 *   xpEarned: number (optional, defaults to 0)
 * }
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.log("❌ Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, adventureId, worldId, xpEarned = 0 } = await request.json();
    console.log("📝 Lesson completion request:", { lessonId, adventureId, worldId, xpEarned, userEmail: session.user.email });

    if (!lessonId || !adventureId || !worldId) {
      console.log("❌ Missing required fields:", { lessonId, adventureId, worldId });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.log("❌ User not found:", { email: session.user.email, error: userError });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("✅ User found:", userData.id);

    // Get user's current journey
    const { data: journey, error: journeyError } = await supabase
      .from("user_species_journey")
      .select("*, species_avatar:species_avatars(*)")
      .eq("user_id", userData.id)
      .single();

    if (journeyError || !journey) {
      console.log("❌ No journey found:", { userId: userData.id, error: journeyError });
      return NextResponse.json(
        { error: "No active journey found. Please start an adventure first." },
        { status: 404 }
      );
    }
    console.log("✅ Journey found:", {
      journeyAdventureId: journey.current_adventure_id,
      requestAdventureId: adventureId,
      match: journey.current_adventure_id === adventureId
    });

    // Check if journey matches the adventure
    if (journey.current_adventure_id !== adventureId) {
      console.log("❌ Adventure mismatch:", {
        journeyAdventureId: journey.current_adventure_id,
        requestAdventureId: adventureId
      });
      return NextResponse.json(
        { error: "This lesson is not part of your current adventure" },
        { status: 400 }
      );
    }

    // Check if this specific lesson has already been completed for this adventure
    const { data: existingCompletion, error: completionCheckError } = await supabase
      .from("lesson_completions")
      .select("id, xp_earned")
      .eq("user_id", userData.id)
      .eq("lesson_id", lessonId)
      .eq("adventure_id", adventureId)
      .maybeSingle();

    if (completionCheckError) {
      console.error("Error checking lesson completion:", completionCheckError);
    }

    const isFirstCompletion = !existingCompletion;
    const meetsXPThreshold = xpEarned >= 200;

    // IUCN progression: CR -> EN -> VU -> NT -> LC (5 levels, 5 lessons)
    const iucnProgression = ["CR", "EN", "VU", "NT", "LC"];
    const currentIndex = iucnProgression.indexOf(journey.current_iucn_status);

    let updates = {
      total_points: journey.total_points + xpEarned,
    };

    // Only advance IUCN level and increment lesson count if:
    // 1. This is the first time completing this lesson in this adventure
    // 2. User earned at least 200 XP (met the threshold)
    let shouldAdvanceIUCN = isFirstCompletion && meetsXPThreshold;

    if (shouldAdvanceIUCN) {
      const lessonsCompleted = journey.lessons_completed_in_adventure + 1;
      updates.lessons_completed_in_adventure = lessonsCompleted;

      // Move to next IUCN level
      if (currentIndex < iucnProgression.length - 1) {
        updates.current_iucn_status = iucnProgression[currentIndex + 1];
      }
    }

    // Record or update lesson completion
    const completionData = {
      user_id: userData.id,
      lesson_id: lessonId,
      adventure_id: adventureId,
      world_id: worldId,
      xp_earned: xpEarned,
      completed_at: new Date().toISOString(),
    };
    console.log("📝 Upserting lesson completion:", completionData);

    const { data: upsertResult, error: lessonCompletionError } = await supabase
      .from("lesson_completions")
      .upsert(completionData, {
        onConflict: "user_id,lesson_id,adventure_id",
        ignoreDuplicates: false, // Update if exists
      })
      .select();

    if (lessonCompletionError) {
      console.error("❌ Error recording lesson completion:", lessonCompletionError);
    } else {
      console.log("✅ Lesson completion saved:", upsertResult);
    }

    // Check if adventure is complete (5 unique lessons completed with XP threshold)
    const { data: completedLessonsInAdventure, error: countError } = await supabase
      .from("lesson_completions")
      .select("lesson_id")
      .eq("user_id", userData.id)
      .eq("adventure_id", adventureId)
      .gte("xp_earned", 200);

    if (countError) {
      console.error("Error counting completed lessons:", countError);
    }

    const uniqueLessonsCompleted = new Set(
      completedLessonsInAdventure?.map((l) => l.lesson_id) || []
    ).size;

    const isAdventureComplete = uniqueLessonsCompleted >= 5;

    if (isAdventureComplete && shouldAdvanceIUCN && updates.current_iucn_status === "LC") {
      // Save the species to completed_species (only when reaching LC status)
      const totalXPForAdventure = completedLessonsInAdventure?.reduce(
        (sum, l) => sum + (l.xp_earned || 0),
        0
      ) || 0;

      const { error: saveError } = await supabase
        .from("completed_species")
        .insert({
          user_id: userData.id,
          species_avatar_id: journey.species_avatar_id,
          adventure_id: adventureId,
          world_id: worldId,
          final_iucn_status: "LC",
          lessons_completed: uniqueLessonsCompleted,
          points_earned: totalXPForAdventure,
        });

      if (saveError && saveError.code !== "23505") {
        // 23505 = unique constraint violation (already saved)
        console.error("Error saving completed species:", saveError);
      }
    }

    // Update journey
    const { data: updatedJourney, error: updateError } = await supabase
      .from("user_species_journey")
      .update(updates)
      .eq("user_id", userData.id)
      .select("*, species_avatar:species_avatars(*)")
      .single();

    if (updateError) {
      console.error("Error updating journey:", updateError);
      return NextResponse.json(
        { error: "Failed to update progress", details: updateError.message },
        { status: 500 }
      );
    }

    // Build response
    const response = {
      success: true,
      journey: updatedJourney,
      progressUpdate: {
        previousStatus: journey.current_iucn_status,
        newStatus: updates.current_iucn_status || journey.current_iucn_status,
        lessonsCompleted: updatedJourney.lessons_completed_in_adventure,
        totalLessons: 5,
        isAdventureComplete,
        xpEarned,
        meetsXPThreshold,
        isFirstCompletion,
        shouldAdvanceIUCN,
      },
    };

    if (isAdventureComplete) {
      response.message = `🎉 Congratulations! You've saved the ${journey.species_avatar.common_name}!`;
      response.speciesSaved = {
        id: journey.species_avatar_id,
        name: journey.species_avatar.common_name,
        scientificName: journey.species_avatar.scientific_name,
        imageUrl: journey.species_avatar.avatar_image_url,
      };
    } else if (!meetsXPThreshold) {
      response.message = `You need at least 200 XP to advance. You earned ${xpEarned} XP. Keep practicing to reach the threshold!`;
    } else if (!isFirstCompletion) {
      response.message = `Great practice! You earned ${xpEarned} XP, but you've already completed this lesson for this adventure.`;
    } else {
      const statusLabels = {
        CR: "Critically Endangered",
        EN: "Endangered",
        VU: "Vulnerable",
        NT: "Near Threatened",
        LC: "Least Concern",
      };
      response.message = `Great job! The ${journey.species_avatar.common_name} is now ${statusLabels[updates.current_iucn_status || journey.current_iucn_status]}! (+${xpEarned} XP)`;
    }

    console.log(
      `✅ User ${userData.id} completed lesson ${lessonId} - IUCN advanced: ${shouldAdvanceIUCN}, XP: ${xpEarned}, Progress: ${updatedJourney.lessons_completed_in_adventure}/5`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in lessons/complete POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
