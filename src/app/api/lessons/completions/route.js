import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/lessons/completions
 * Fetches lesson completions for the current user.
 * Query params:
 *   - lessonIds: comma-separated list of lesson IDs to check
 *   - adventureId: optional filter by adventure
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonIdsParam = searchParams.get("lessonIds");
    const adventureId = searchParams.get("adventureId");

    if (!lessonIdsParam) {
      return NextResponse.json(
        { error: "lessonIds parameter required" },
        { status: 400 }
      );
    }

    const lessonIds = lessonIdsParam.split(",").filter(Boolean);
    if (lessonIds.length === 0) {
      return NextResponse.json({ completions: [] });
    }

    const supabase = await getSupabaseAdmin();

    // Get user ID from email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from("lesson_completions")
      .select("lesson_id, adventure_id, xp_earned, completed_at")
      .eq("user_id", userData.id)
      .in("lesson_id", lessonIds);

    // Optionally filter by adventure
    if (adventureId) {
      query = query.eq("adventure_id", adventureId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching completions:", error);
      return NextResponse.json(
        { error: "Failed to fetch completions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      completions: data || [],
      completedLessonIds: data?.map((c) => c.lesson_id) || [],
    });
  } catch (error) {
    console.error("Error in completions GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
