import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/adventures/start
 * Start a new adventure by selecting a species to save
 *
 * Request body:
 * {
 *   speciesAvatarId: UUID,
 *   adventureId: string (e.g., 'rainforests'),
 *   worldId: string (e.g., 'forests')
 * }
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { speciesAvatarId, adventureId, worldId } = await request.json();

    if (!speciesAvatarId || !adventureId || !worldId) {
      return NextResponse.json(
        { error: "Missing required fields: speciesAvatarId, adventureId, worldId" },
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the species avatar
    const { data: avatar, error: avatarError } = await supabase
      .from("species_avatars")
      .select("*")
      .eq("id", speciesAvatarId)
      .single();

    if (avatarError || !avatar) {
      return NextResponse.json(
        { error: "Species avatar not found" },
        { status: 404 }
      );
    }

    // Check if user already has an active journey
    const { data: existingJourney } = await supabase
      .from("user_species_journey")
      .select("*")
      .eq("user_id", userData.id)
      .single();

    if (existingJourney) {
      console.log("🎯 Adventure start - Updating existing journey:", {
        userId: userData.id,
        existingJourneyId: existingJourney.id,
        speciesAvatarId,
        adventureId,
        worldId,
      });

      // User already has a journey - update it for the new adventure
      const { data: journey, error: updateError } = await supabase
        .from("user_species_journey")
        .update({
          species_avatar_id: speciesAvatarId,
          current_iucn_status: "CR", // Always start at CR
          current_adventure_id: adventureId,
          current_world_id: worldId,
          lessons_completed_in_adventure: 0,
          adventure_started_at: new Date().toISOString(),
        })
        .eq("user_id", userData.id)
        .select(
          `
          *,
          species_avatar:species_avatars(*)
        `
        )
        .single();

      if (updateError) {
        console.error("❌ Error updating journey:", updateError);
        return NextResponse.json(
          { error: "Failed to start adventure", details: updateError.message },
          { status: 500 }
        );
      }

      console.log("✅ Adventure start - Journey updated successfully:", {
        journeyId: journey.id,
        userId: userData.id,
        adventureId: journey.current_adventure_id,
        worldId: journey.current_world_id,
        speciesName: avatar.common_name,
      });

      return NextResponse.json({
        success: true,
        journey,
        message: `Adventure started! You're now saving the ${avatar.common_name}.`,
      });
    } else {
      console.log("🎯 Adventure start - Creating new journey:", {
        userId: userData.id,
        speciesAvatarId,
        adventureId,
        worldId,
      });

      // Create initial journey
      const { data: journey, error: journeyError } = await supabase
        .from("user_species_journey")
        .insert({
          user_id: userData.id,
          species_avatar_id: speciesAvatarId,
          current_iucn_status: "CR",
          starting_iucn_status: "CR",
          current_adventure_id: adventureId,
          current_world_id: worldId,
          total_points: 0,
          points_to_next_level: 1,
          level_progress: 0,
          lessons_completed_in_adventure: 0,
          adventure_started_at: new Date().toISOString(),
        })
        .select(
          `
          *,
          species_avatar:species_avatars(*)
        `
        )
        .single();

      if (journeyError) {
        console.error("❌ Error creating journey:", journeyError);
        return NextResponse.json(
          { error: "Failed to create journey", details: journeyError.message },
          { status: 500 }
        );
      }

      console.log("✅ Adventure start - New journey created:", {
        journeyId: journey.id,
        userId: userData.id,
        adventureId: journey.current_adventure_id,
        worldId: journey.current_world_id,
        speciesName: avatar.common_name,
      });

      return NextResponse.json({
        success: true,
        journey,
        message: `Your journey begins! You're now saving the ${avatar.common_name}.`,
      });
    }
  } catch (error) {
    console.error("Error in adventures/start POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
