import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/stats/community
 * Fetches community-wide statistics
 */
export async function GET(request) {
  try {
    const supabase = await getSupabaseAdmin();

    // Fetch counts in parallel
    const [
      observationsResult,
      speciesResult,
      naturalistsResult,
      challengesResult,
    ] = await Promise.all([
      // Total observations count
      supabase
        .from("user_observations")
        .select("*", { count: "exact", head: true }),

      // Unique species identified
      supabase
        .from("user_observations")
        .select("ai_species_name")
        .not("ai_species_name", "is", null),

      // Active naturalists (users with journeys)
      supabase
        .from("user_species_journey")
        .select("*", { count: "exact", head: true }),

      // Completed challenges
      supabase
        .from("user_active_challenges")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed"),
    ]);

    // Count unique species
    const uniqueSpecies = new Set(
      speciesResult.data?.map((o) => o.ai_species_name?.toLowerCase().trim()) || []
    );

    // Get total points earned by all users
    const { data: pointsData } = await supabase
      .from("user_species_journey")
      .select("total_points");

    const totalPointsEarned =
      pointsData?.reduce((sum, j) => sum + (j.total_points || 0), 0) || 0;

    // Get observations this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: weeklyObservations } = await supabase
      .from("user_observations")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo.toISOString());

    // Get new naturalists this week
    const { count: weeklyNaturalists } = await supabase
      .from("user_species_journey")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneWeekAgo.toISOString());

    return NextResponse.json({
      success: true,
      stats: {
        totalObservations: observationsResult.count || 0,
        speciesIdentified: uniqueSpecies.size,
        activeNaturalists: naturalistsResult.count || 0,
        completedChallenges: challengesResult.count || 0,
        totalPointsEarned,
        thisWeek: {
          observations: weeklyObservations || 0,
          newNaturalists: weeklyNaturalists || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error in community stats GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
