import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/species/completed
 * Fetch all species saved by the current user
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseAdmin();

    // Get user ID
    const { data: userData, error: userError} = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch completed species with avatar details
    const { data: completedSpecies, error: speciesError } = await supabase
      .from("completed_species")
      .select(
        `
        *,
        species_avatar:species_avatars(*)
      `
      )
      .eq("user_id", userData.id)
      .order("completed_at", { ascending: false });

    if (speciesError) {
      console.error("Error fetching completed species:", speciesError);
      return NextResponse.json(
        { error: "Failed to fetch completed species", details: speciesError.message },
        { status: 500 }
      );
    }

    // Get total count and points
    const totalSpeciesSaved = completedSpecies?.length || 0;
    const totalPoints = completedSpecies?.reduce(
      (sum, sp) => sum + (sp.points_earned || 0),
      0
    );

    return NextResponse.json({
      success: true,
      completedSpecies: completedSpecies || [],
      stats: {
        totalSpeciesSaved,
        totalPoints,
      },
    });
  } catch (error) {
    console.error("Error in species/completed GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
