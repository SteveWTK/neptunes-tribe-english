import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * PATCH /api/schools/[id]/levels/[levelId]
 * Updates a level. Admin only.
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

    const { id, levelId } = await params;
    const updates = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = ["name", "habitat_level", "display_order", "is_active"];

    const sanitizedUpdates = {};
    for (const key of allowedFields) {
      if (key in updates) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    // Validate habitat_level if provided
    if (sanitizedUpdates.habitat_level) {
      const validHabitatLevels = ["Level 1", "Level 2", "Level 3"];
      if (!validHabitatLevels.includes(sanitizedUpdates.habitat_level)) {
        return NextResponse.json(
          { error: "Invalid habitat level. Must be Level 1, Level 2, or Level 3" },
          { status: 400 }
        );
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("school_levels")
      .update(sanitizedUpdates)
      .eq("id", levelId)
      .eq("school_id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating level:", updateError);
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "A level with this name already exists for this school" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update level" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, level: updated });
  } catch (error) {
    console.error("Error updating level:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schools/[id]/levels/[levelId]
 * Soft-deletes a level. Admin only.
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

    const { id, levelId } = await params;

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from("school_levels")
      .update({ is_active: false })
      .eq("id", levelId)
      .eq("school_id", id);

    if (deleteError) {
      console.error("Error deleting level:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete level" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting level:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
