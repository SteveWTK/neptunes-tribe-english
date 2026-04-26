import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/schools/[id]/teachers
 * Lists all teachers for a school. Admin only.
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

    // Fetch teachers
    const { data: teachers, error: teachersError } = await supabase
      .from("school_teachers")
      .select("*")
      .eq("school_id", id)
      .order("name", { ascending: true });

    if (teachersError) {
      console.error("Error fetching teachers:", teachersError);
      return NextResponse.json(
        { error: "Failed to fetch teachers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ teachers: teachers || [] });
  } catch (error) {
    console.error("Error listing teachers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schools/[id]/teachers
 * Creates a new teacher for a school. Admin only.
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
        { error: "Teacher name is required" },
        { status: 400 }
      );
    }

    // Create teacher
    const { data: teacher, error: createError } = await supabase
      .from("school_teachers")
      .insert({
        school_id: id,
        name: body.name.trim(),
        email: body.email?.trim() || null,
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating teacher:", createError);
      if (createError.code === "23505") {
        return NextResponse.json(
          { error: "A teacher with this name already exists for this school" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create teacher" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, teacher }, { status: 201 });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
