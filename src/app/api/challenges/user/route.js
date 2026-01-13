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

    // First, expire any challenges that have passed their expires_at time
    const now = new Date().toISOString();
    const { data: expiredChallenges } = await supabase
      .from("user_active_challenges")
      .update({ status: "expired" })
      .eq("user_id", userData.id)
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", now)
      .select("id");

    if (expiredChallenges?.length > 0) {
      console.log(`⏰ Auto-expired ${expiredChallenges.length} challenges for user ${userData.id}`);
    }

    // Auto-assign any globally active unpredictable challenges that user doesn't have yet
    await autoAssignGlobalChallenges(supabase, userData.id);

    // Get active challenges with details (now excludes expired ones)
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

    // Filter out any challenges that might still be expired (double-check)
    const validActiveChallenges = activeChallenges.filter((c) => {
      if (!c.expires_at) return true; // NGO challenges without expiry are always valid
      return new Date(c.expires_at) > new Date();
    });

    // Check for new notifications (red dot)
    const hasNewNotification = validActiveChallenges.some(
      (c) => !c.notification_shown
    );

    // Get completed challenges count
    const { count: completedCount } = await supabase
      .from("user_active_challenges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.id)
      .eq("status", "completed");

    // Get expired challenges count
    const { count: expiredCount } = await supabase
      .from("user_active_challenges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userData.id)
      .eq("status", "expired");

    return NextResponse.json({
      success: true,
      activeChallenges: validActiveChallenges,
      hasNewNotification,
      completedChallengesCount: completedCount || 0,
      expiredChallengesCount: expiredCount || 0,
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

/**
 * Auto-assign globally active unpredictable challenges to a user
 * This ensures all users see the same active challenges
 */
async function autoAssignGlobalChallenges(supabase, userId) {
  try {
    // Get all globally active unpredictable challenges
    const { data: globalChallenges, error: globalError } = await supabase
      .from("unpredictable_challenges")
      .select("*")
      .eq("is_active", true);

    if (globalError || !globalChallenges?.length) {
      return; // No active global challenges
    }

    // Get user's existing challenge assignments (active or completed for these challenges)
    const challengeIds = globalChallenges.map((c) => c.id);
    const { data: existingAssignments } = await supabase
      .from("user_active_challenges")
      .select("unpredictable_challenge_id, status")
      .eq("user_id", userId)
      .in("unpredictable_challenge_id", challengeIds)
      .in("status", ["active", "completed"]); // Don't re-assign if already active or completed

    const assignedChallengeIds = new Set(
      existingAssignments?.map((a) => a.unpredictable_challenge_id) || []
    );

    // Assign challenges that user doesn't have yet
    for (const challenge of globalChallenges) {
      if (assignedChallengeIds.has(challenge.id)) {
        continue; // User already has this challenge
      }

      // Calculate expiry time based on challenge duration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (challenge.duration_hours || 24));

      // Get target count from requirements
      const requirements = challenge.requirements || {};
      const targetCount = requirements.min_observations || 1;

      // Create assignment for this user
      const { error: assignError } = await supabase
        .from("user_active_challenges")
        .insert({
          user_id: userId,
          unpredictable_challenge_id: challenge.id,
          status: "active",
          progress_count: 0,
          target_count: targetCount,
          expires_at: expiresAt.toISOString(),
          notification_shown: false,
          notification_clicked: false,
        });

      if (assignError) {
        console.error(`Error assigning challenge ${challenge.id} to user ${userId}:`, assignError);
      } else {
        console.log(`✅ Auto-assigned challenge "${challenge.title}" to user ${userId}`);
      }
    }
  } catch (error) {
    console.error("Error in autoAssignGlobalChallenges:", error);
  }
}
