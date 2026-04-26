import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/schools/by-slug/[slug]
 * Public endpoint to get school info for signup page.
 * Returns only public-safe information.
 */
export async function GET(request, { params }) {
  try {
    const supabase = await getSupabaseAdmin();

    const { slug } = await params;

    // Fetch school by slug
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select(`
        id,
        name,
        slug,
        group_name,
        branch_name,
        city,
        state,
        country,
        logo_url,
        primary_color,
        welcome_message,
        welcome_message_pt,
        welcome_message_th,
        is_active
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      );
    }

    // Fetch active levels for this school
    const { data: levels } = await supabase
      .from("school_levels")
      .select("id, name, habitat_level, display_order")
      .eq("school_id", school.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    // Fetch active teachers for this school
    const { data: teachers } = await supabase
      .from("school_teachers")
      .select("id, name")
      .eq("school_id", school.id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    return NextResponse.json({
      school: {
        ...school,
        levels: levels || [],
        teachers: teachers || [],
      },
    });
  } catch (error) {
    console.error("Error fetching school by slug:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
