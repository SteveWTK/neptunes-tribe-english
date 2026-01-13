import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/observations/map
 * Fetches observations for map display with filters
 * Supports: global (public), school (same school), mine (user's own)
 */
export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "100");
    const region = searchParams.get("region");
    const filter = searchParams.get("filter") || "global"; // global, school, mine

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

    // Build base query
    let query = supabase
      .from("user_observations")
      .select(
        `
        id,
        user_id,
        latitude,
        longitude,
        location_name,
        region_code,
        ai_species_name,
        ai_confidence,
        photo_url,
        created_at,
        user:users!user_id (
          name,
          image
        )
      `
      )
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply filter
    if (filter === "mine" && userId) {
      // User's own observations (all visibility levels)
      query = query.eq("user_id", userId);
    } else if (filter === "school" && userSchoolId) {
      // School observations (from same school)
      query = query.eq("school_id", userSchoolId);
    } else {
      // Global feed (public only)
      query = query.eq("visibility", "public");
    }

    // Optional region filter
    if (region) {
      query = query.eq("region_code", region.toUpperCase());
    }

    const { data: observations, error } = await query;

    if (error) {
      console.error("Error fetching map observations:", error);
      return NextResponse.json(
        { error: "Failed to fetch observations", details: error.message },
        { status: 500 }
      );
    }

    // Transform for map display
    const mapData = observations
      .filter((obs) => obs.latitude && obs.longitude)
      .map((obs) => ({
        id: obs.id,
        coordinates: [obs.longitude, obs.latitude], // [lng, lat] for Mapbox
        species: obs.ai_species_name || "Unknown species",
        confidence: obs.ai_confidence,
        location: obs.location_name,
        regionCode: obs.region_code,
        photoUrl: obs.photo_url,
        date: obs.created_at,
        userName: obs.user?.name || "Anonymous",
        userImage: obs.user?.image,
        isOwn: userId ? obs.user_id === userId : false,
      }));

    return NextResponse.json({
      success: true,
      observations: mapData,
      count: mapData.length,
      filter,
    });
  } catch (error) {
    console.error("Error in map observations GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
