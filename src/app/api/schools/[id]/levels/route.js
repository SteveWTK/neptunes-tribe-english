import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/schools/[id]/levels
 * Lists all levels for a school. Admin only.
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Verify admin role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData || userData.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Fetch levels
    const { data: levels, error: levelsError } = await supabase
      .from("school_levels")
      .select("*")
      .eq("school_id", id)
      .order("display_order", { ascending: true });

    if (levelsError) {
      console.error("Error fetching levels:", levelsError);
      return NextResponse.json(
        { error: "Failed to fetch levels" },
        { status: 500 }
      );
    }

    return NextResponse.json({ levels: levels || [] });
  } catch (error) {
    console.error("Error listing levels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schools/[id]/levels
 * Creates a new level for a school. Admin only.
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Verify admin role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData || userData.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "Level name is required" },
        { status: 400 }
      );
    }

    // Validate habitat_level
    const validHabitatLevels = ["Level 1", "Level 2", "Level 3"];
    const habitatLevel = body.habitat_level || "Level 1";
    if (!validHabitatLevels.includes(habitatLevel)) {
      return NextResponse.json(
        { error: "Invalid habitat level. Must be Level 1, Level 2, or Level 3" },
        { status: 400 }
      );
    }

    // Create level
    const { data: level, error: createError } = await supabase
      .from("school_levels")
      .insert({
        school_id: id,
        name: body.name.trim(),
        habitat_level: habitatLevel,
        display_order: body.display_order || 0,
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating level:", createError);
      if (createError.code === "23505") {
        return NextResponse.json(
          { error: "A level with this name already exists for this school" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create level" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, level }, { status: 201 });
  } catch (error) {
    console.error("Error creating level:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
