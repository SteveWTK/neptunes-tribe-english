import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/user/points-history
 * Fetches user's points earning history
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await getSupabaseAdmin();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch points history
    const { data: history, error: historyError, count } = await supabase
      .from("points_history")
      .select("*", { count: "exact" })
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (historyError) {
      console.error("Error fetching points history:", historyError);
      return NextResponse.json(
        { error: "Failed to fetch history", details: historyError.message },
        { status: 500 }
      );
    }

    // Calculate summary stats
    const totalEarned =
      history?.reduce((sum, h) => sum + (h.points_change > 0 ? h.points_change : 0), 0) || 0;

    return NextResponse.json({
      success: true,
      history: history || [],
      total: count || 0,
      limit,
      offset,
      summary: {
        totalEarned,
        entryCount: count || 0,
      },
    });
  } catch (error) {
    console.error("Error in points-history GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
