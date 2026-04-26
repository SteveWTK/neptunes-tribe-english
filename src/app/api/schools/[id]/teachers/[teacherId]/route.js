import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * PATCH /api/schools/[id]/teachers/[teacherId]
 * Updates a teacher. Admin only.
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

    const { id, teacherId } = await params;
    const updates = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = ["name", "email", "is_active"];

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
      .from("school_teachers")
      .update(sanitizedUpdates)
      .eq("id", teacherId)
      .eq("school_id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating teacher:", updateError);
      if (updateError.code === "23505") {
        return NextResponse.json(
          { error: "A teacher with this name already exists for this school" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update teacher" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, teacher: updated });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schools/[id]/teachers/[teacherId]
 * Soft-deletes a teacher. Admin only.
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

    const { id, teacherId } = await params;

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from("school_teachers")
      .update({ is_active: false })
      .eq("id", teacherId)
      .eq("school_id", id);

    if (deleteError) {
      console.error("Error deleting teacher:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete teacher" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
