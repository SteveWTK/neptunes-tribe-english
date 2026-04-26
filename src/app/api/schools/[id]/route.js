import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/schools/[id]
 * Returns detailed school info with levels, teachers, and student stats. Admin only.
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

    // Fetch school
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("*")
      .eq("id", id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      );
    }

    // Fetch levels for this school
    const { data: levels } = await supabase
      .from("school_levels")
      .select("*")
      .eq("school_id", id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    // Fetch teachers for this school
    const { data: teachers } = await supabase
      .from("school_teachers")
      .select("*")
      .eq("school_id", id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    // Fetch students for this school
    const { data: students } = await supabase
      .from("users")
      .select("id, email, full_name, current_level, school_level_id, teacher_id, enrolled_at, created_at")
      .eq("school_id", id)
      .order("enrolled_at", { ascending: false });

    // Calculate stats
    const levelStats = {};
    const teacherStats = {};
    (students || []).forEach((s) => {
      if (s.school_level_id) {
        levelStats[s.school_level_id] = (levelStats[s.school_level_id] || 0) + 1;
      }
      if (s.teacher_id) {
        teacherStats[s.teacher_id] = (teacherStats[s.teacher_id] || 0) + 1;
      }
    });

    // Add student counts to levels and teachers
    const levelsWithStats = (levels || []).map((l) => ({
      ...l,
      student_count: levelStats[l.id] || 0,
    }));

    const teachersWithStats = (teachers || []).map((t) => ({
      ...t,
      student_count: teacherStats[t.id] || 0,
    }));

    return NextResponse.json({
      school,
      levels: levelsWithStats,
      teachers: teachersWithStats,
      students: students || [],
      stats: {
        total_students: (students || []).length,
        total_levels: (levels || []).length,
        total_teachers: (teachers || []).length,
      },
    });
  } catch (error) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/schools/[id]
 * Updates a school. Admin only.
 */
export async function PATCH(request, { params }) {
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
    const updates = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      "name",
      "slug",
      "group_name",
      "branch_name",
      "contact_name",
      "contact_email",
      "contact_phone",
      "city",
      "state",
      "country",
      "timezone",
      "partnership_tier",
      "partnership_start",
      "partnership_end",
      "logo_url",
      "primary_color",
      "welcome_message",
      "welcome_message_pt",
      "welcome_message_th",
      "features_config",
      "auto_premium",
      "premium_duration_days",
      "is_active",
    ];

    const sanitizedUpdates = {};
    for (const key of allowedFields) {
      if (key in updates) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("schools")
      .update(sanitizedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating school:", updateError);
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "A school with this slug already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update school" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, school: updated });
  } catch (error) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schools/[id]
 * Soft-deletes a school by setting is_active to false. Admin only.
 */
export async function DELETE(request, { params }) {
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

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from("schools")
      .update({ is_active: false })
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting school:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete school" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
