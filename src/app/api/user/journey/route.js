import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/user/journey
 * Fetches user's species journey (avatar, IUCN status, points)
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get journey with avatar info
    const { data: journey, error: journeyError } = await supabase
      .from("user_species_journey")
      .select(
        `
        *,
        species_avatar:species_avatars(*)
      `
      )
      .eq("user_id", userData.id)
      .single();

    if (journeyError && journeyError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching journey:", journeyError);
      return NextResponse.json(
        { error: "Failed to fetch journey", details: journeyError.message },
        { status: 500 }
      );
    }

    // If no journey exists, user hasn't selected an avatar yet
    if (!journey) {
      return NextResponse.json({
        success: true,
        journey: null,
        hasSelectedAvatar: false,
      });
    }

    // Get points needed for next level
    const { data: threshold } = await supabase
      .from("iucn_thresholds")
      .select("*")
      .eq("from_status", journey.current_iucn_status)
      .single();

    // Get current narrative message
    const { data: narrative } = await supabase
      .from("narrative_messages")
      .select("*")
      .eq("trigger_type", "status_change")
      .eq("trigger_value", journey.current_iucn_status)
      .eq("is_active", true)
      .single();

    return NextResponse.json({
      success: true,
      journey: {
        ...journey,
        next_level_threshold: threshold,
        current_narrative: narrative,
      },
      hasSelectedAvatar: true,
    });
  } catch (error) {
    console.error("Error in journey GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/journey
 * Selects species avatar and starts journey
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { speciesAvatarId } = await request.json();

    if (!speciesAvatarId) {
      return NextResponse.json(
        { error: "Missing speciesAvatarId" },
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

    // Check if user already has a journey
    const { data: existingJourney } = await supabase
      .from("user_species_journey")
      .select("id")
      .eq("user_id", userData.id)
      .single();

    if (existingJourney) {
      return NextResponse.json(
        { error: "Journey already started. Cannot change avatar." },
        { status: 400 }
      );
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

    // Create journey
    const { data: journey, error: journeyError } = await supabase
      .from("user_species_journey")
      .insert({
        user_id: userData.id,
        species_avatar_id: speciesAvatarId,
        current_iucn_status: avatar.iucn_status,
        starting_iucn_status: avatar.iucn_status,
        total_points: 0,
        points_to_next_level: 1000,
        level_progress: 0,
      })
      .select(
        `
        *,
        species_avatar:species_avatars(*)
      `
      )
      .single();

    if (journeyError) {
      console.error("Error creating journey:", journeyError);
      return NextResponse.json(
        { error: "Failed to create journey", details: journeyError.message },
        { status: 500 }
      );
    }

    // Get welcome narrative
    const { data: welcomeNarrative } = await supabase
      .from("narrative_messages")
      .select("*")
      .eq("trigger_type", "welcome")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .limit(1)
      .single();

    console.log(
      `✅ User ${userData.id} started journey with ${avatar.common_name}`
    );

    return NextResponse.json({
      success: true,
      journey,
      welcomeNarrative,
      message: `You've chosen the ${avatar.common_name}! Your journey to save them begins now.`,
    });
  } catch (error) {
    console.error("Error in journey POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
