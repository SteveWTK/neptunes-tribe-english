import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/observations/feed
 * Fetches public observation feed with optional filters
 */
export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const species = searchParams.get("species");
    const region = searchParams.get("region");
    const schoolOnly = searchParams.get("schoolOnly") === "true";

    const supabase = await getSupabaseAdmin();

    let userId = null;
    let userSchoolId = null;

    // Get user info if authenticated
    if (session?.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("id, school_id")
        .eq("email", session.user.email)
        .single();

      userId = userData?.id;
      userSchoolId = userData?.school_id;
    }

    // Build query
    let query = supabase
      .from("user_observations")
      .select(
        `
        *,
        user:users!user_id (
          id,
          name,
          image
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Visibility filter
    if (schoolOnly && userSchoolId) {
      // School-only view: show school's observations
      query = query.eq("school_id", userSchoolId);
    } else {
      // Public view: show public observations
      query = query.eq("visibility", "public");
    }

    // Optional filters
    if (species) {
      query = query.ilike("ai_species_name", `%${species}%`);
    }

    if (region) {
      query = query.eq("region_code", region.toUpperCase());
    }

    const { data: observations, error, count } = await query;

    if (error) {
      console.error("Error fetching observations feed:", error);
      return NextResponse.json(
        { error: "Failed to fetch feed", details: error.message },
        { status: 500 }
      );
    }

    // Check if current user has liked each observation
    let observationsWithLikes = observations;
    if (userId) {
      const observationIds = observations.map((o) => o.id);
      const { data: userLikes } = await supabase
        .from("observation_likes")
        .select("observation_id")
        .eq("user_id", userId)
        .in("observation_id", observationIds);

      const likedIds = new Set(userLikes?.map((l) => l.observation_id) || []);

      observationsWithLikes = observations.map((obs) => ({
        ...obs,
        user_has_liked: likedIds.has(obs.id),
      }));
    }

    return NextResponse.json({
      success: true,
      observations: observationsWithLikes,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error in observations feed GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
