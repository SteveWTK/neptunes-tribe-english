import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/observations/map
 * Fetches observations for map display (public, lightweight)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const region = searchParams.get("region");

    const supabase = await getSupabaseAdmin();

    let query = supabase
      .from("user_observations")
      .select(
        `
        id,
        latitude,
        longitude,
        location_name,
        region_code,
        ai_species_name,
        ai_confidence,
        photo_url,
        created_at
      `
      )
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(limit);

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
    const mapData = observations.map((obs) => ({
      id: obs.id,
      coordinates: [obs.longitude, obs.latitude], // [lng, lat] for react-simple-maps
      species: obs.ai_species_name || "Unknown",
      confidence: obs.ai_confidence,
      location: obs.location_name,
      regionCode: obs.region_code,
      photoUrl: obs.photo_url,
      date: obs.created_at,
    }));

    return NextResponse.json({
      success: true,
      observations: mapData,
      count: mapData.length,
    });
  } catch (error) {
    console.error("Error in map observations GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
