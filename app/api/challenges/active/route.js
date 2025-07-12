// / app/api/challenges/active/route.js - Get active environmental challenges
import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Get active challenges with all needed fields
    const { data: challenges, error } = await supabase
      .from("environmental_challenges")
      .select(
        `
        id,
        name,
        type,
        description,
        target_ecosystem,
        units_required,
        urgency_days,
        start_date,
        end_date,
        is_active,
        affected_regions,
        challenge_data,
        total_contributions,
        created_at,
        updated_at
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching active challenges:", error);
      return new NextResponse("Database error", { status: 500 });
    }

    // Transform to match expected format and add participant count
    const transformedChallenges = await Promise.all(
      (challenges || []).map(async (challenge) => {
        // Get participant count for this challenge
        const { data: participants } = await supabase
          .from("user_challenge_progress")
          .select("user_id")
          .eq("challenge_id", challenge.id);

        const participantCount = participants?.length || 0;
        const completionPercentage =
          challenge.units_required > 0
            ? Math.round(
                (challenge.total_contributions / challenge.units_required) * 100
              )
            : 0;

        return {
          challenge_id: challenge.id,
          challenge_name: challenge.name,
          challenge_type: challenge.type,
          description: challenge.description,
          target_ecosystem: challenge.target_ecosystem,
          units_required: challenge.units_required,
          total_contributions: challenge.total_contributions,
          participants_count: participantCount,
          completion_percentage: completionPercentage,
          end_date: challenge.end_date,
          challenge_data: challenge.challenge_data,
          affected_regions: challenge.affected_regions,
          status: completionPercentage >= 100 ? "completed" : "active",
        };
      })
    );

    console.log("✅ Active challenges API response:", transformedChallenges); // Debug log

    return NextResponse.json(transformedChallenges);
  } catch (error) {
    console.error("Unexpected error in challenges API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
