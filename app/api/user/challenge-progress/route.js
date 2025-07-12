// / app/api/user/challenge-progress/route.js - Get user's challenge progress
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get user's challenge progress
    const { data: challengeProgress, error: progressError } = await supabase
      .from("user_challenge_progress")
      .select(
        `
        challenge_id,
        units_contributed,
        last_contribution,
        completed_at,
        environmental_challenges (
          name,
          type,
          description,
          units_required,
          end_date
        )
      `
      )
      .eq("user_id", userData.id);

    if (progressError) {
      console.error("Error fetching user challenge progress:", progressError);
      return new NextResponse("Database error", { status: 500 });
    }

    // Get user's adopted species
    const { data: adoptedSpecies, error: speciesError } = await supabase
      .from("species_adoptions")
      .select("*")
      .eq("user_id", userData.id)
      .order("adopted_at", { ascending: false });

    // Format the response
    const formattedProgress = {};
    challengeProgress?.forEach((progress) => {
      formattedProgress[progress.challenge_id] = {
        units_contributed: progress.units_contributed,
        last_contribution: progress.last_contribution,
        completed_at: progress.completed_at,
        challenge: progress.environmental_challenges,
      };
    });

    return NextResponse.json({
      challengeProgress: formattedProgress,
      adoptedSpecies: adoptedSpecies || [],
      totalSpecies: adoptedSpecies?.length || 0,
    });
  } catch (error) {
    console.error("Unexpected error in user challenge progress API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
