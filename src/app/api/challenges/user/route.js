import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/challenges/user
 * Fetches user's active challenges and checks for pending notifications
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Get active challenges with details
    const { data: activeChallenges, error: challengesError } = await supabase
      .from("user_active_challenges")
      .select(
        `
        *,
        ngo_challenge:ngo_challenges(*),
        unpredictable_challenge:unpredictable_challenges(*)
      `
      )
      .eq("user_id", userData.id)
      .eq("status", "active");

    if (challengesError) {
      console.error("Error fetching challenges:", challengesError);
      return NextResponse.json(
        { error: "Failed to fetch challenges", details: challengesError.message },
        { status: 500 }
      );
    }

    // Check for new notifications (red dot)
    const hasNewNotification = activeChallenges.some(
      (c) => !c.notification_shown
    );

    // Get completed challenges count
    const { count: completedCount } = await supabase
      .from("user_active_challenges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.id)
      .eq("status", "completed");

    return NextResponse.json({
      success: true,
      activeChallenges,
      hasNewNotification,
      completedChallengesCount: completedCount || 0,
    });
  } catch (error) {
    console.error("Error in user challenges GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenges/user
 * Mark notification as shown or assign a new challenge
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, challengeId } = await request.json();

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

    if (action === "mark_notification_shown") {
      // Mark all notifications as shown
      await supabase
        .from("user_active_challenges")
        .update({ notification_shown: true })
        .eq("user_id", userData.id)
        .eq("notification_shown", false);

      return NextResponse.json({ success: true, message: "Notifications marked as shown" });
    }

    if (action === "mark_notification_clicked" && challengeId) {
      await supabase
        .from("user_active_challenges")
        .update({ notification_clicked: true })
        .eq("id", challengeId)
        .eq("user_id", userData.id);

      return NextResponse.json({ success: true, message: "Challenge viewed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in user challenges POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
