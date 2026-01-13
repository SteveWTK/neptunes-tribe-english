import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/user/challenges-history
 * Fetches user's challenge history (active, completed, expired)
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

    // First, auto-expire any challenges that have passed their expiry
    const now = new Date().toISOString();
    await supabase
      .from("user_active_challenges")
      .update({ status: "expired" })
      .eq("user_id", userData.id)
      .eq("status", "active")
      .not("expires_at", "is", null)
      .lt("expires_at", now);

    // Fetch active challenges
    const { data: activeChallenges, error: activeError } = await supabase
      .from("user_active_challenges")
      .select(
        `
        *,
        ngo_challenge:ngo_challenges(*),
        unpredictable_challenge:unpredictable_challenges(*)
      `
      )
      .eq("user_id", userData.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (activeError) {
      console.error("Error fetching active challenges:", activeError);
    }

    // Fetch completed challenges
    const { data: completedChallenges, error: completedError } = await supabase
      .from("user_active_challenges")
      .select(
        `
        *,
        ngo_challenge:ngo_challenges(*),
        unpredictable_challenge:unpredictable_challenges(*)
      `
      )
      .eq("user_id", userData.id)
      .eq("status", "completed")
      .order("completed_at", { ascending: false });

    if (completedError) {
      console.error("Error fetching completed challenges:", completedError);
    }

    // Fetch expired challenges
    const { data: expiredChallenges, error: expiredError } = await supabase
      .from("user_active_challenges")
      .select(
        `
        *,
        ngo_challenge:ngo_challenges(*),
        unpredictable_challenge:unpredictable_challenges(*)
      `
      )
      .eq("user_id", userData.id)
      .eq("status", "expired")
      .order("expires_at", { ascending: false });

    if (expiredError) {
      console.error("Error fetching expired challenges:", expiredError);
    }

    return NextResponse.json({
      success: true,
      activeChallenges: activeChallenges || [],
      completedChallenges: completedChallenges || [],
      expiredChallenges: expiredChallenges || [],
      summary: {
        active: activeChallenges?.length || 0,
        completed: completedChallenges?.length || 0,
        expired: expiredChallenges?.length || 0,
        totalPointsEarned:
          completedChallenges?.reduce((sum, c) => sum + (c.points_earned || 0), 0) || 0,
      },
    });
  } catch (error) {
    console.error("Error in challenges-history GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
