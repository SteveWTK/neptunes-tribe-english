import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/species-avatars
 * Fetches available species avatars for selection
 */
export async function GET(request) {
  try {
    const supabase = await getSupabaseAdmin();

    const { data: avatars, error } = await supabase
      .from("species_avatars")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching species avatars:", error);
      return NextResponse.json(
        { error: "Failed to fetch avatars", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      avatars,
    });
  } catch (error) {
    console.error("Error in species avatars GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
