import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

// GET - Fetch all feedback (admin only)
export async function GET(request) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // 'new', 'reviewed', 'addressed', 'archived'
    const userRole = searchParams.get("userRole"); // 'user', 'premium', 'beta_tester'
    const feedbackType = searchParams.get("feedbackType"); // 'quick', 'detailed'
    const limit = parseInt(searchParams.get("limit") || "100");

    // Build query
    let query = supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }
    if (userRole) {
      query = query.eq("user_role", userRole);
    }
    if (feedbackType) {
      query = query.eq("feedback_type", feedbackType);
    }

    const { data: feedback, error: fetchError } = await query;

    if (fetchError) {
      console.error("Error fetching feedback:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch feedback" },
        { status: 500 }
      );
    }

    // Get analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from("feedback_analytics")
      .select("*");

    return NextResponse.json({
      feedback,
      analytics: analytics || [],
      total: feedback.length,
    });
  } catch (error) {
    console.error("Error in admin feedback fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update feedback status/notes (admin only)
export async function PATCH(request) {
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

    const body = await request.json();
    const { feedbackId, status, adminNotes } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { error: "Feedback ID required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === "reviewed" && !updateData.reviewed_at) {
        updateData.reviewed_by = userData.id;
        updateData.reviewed_at = new Date().toISOString();
      }
    }
    if (adminNotes !== undefined) {
      updateData.admin_notes = adminNotes;
    }

    const { data: updated, error: updateError } = await supabase
      .from("feedback")
      .update(updateData)
      .eq("id", feedbackId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating feedback:", updateError);
      return NextResponse.json(
        { error: "Failed to update feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback: updated,
    });
  } catch (error) {
    console.error("Error in admin feedback update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
