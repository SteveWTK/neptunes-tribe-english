import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/challenges/assign-random
 * Assigns a random unpredictable challenge to the user
 * This should be called periodically (e.g., by a cron job or on login)
 */
export async function POST(request) {
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

    // Check if user already has an active unpredictable challenge (after expiring old ones)
    const { data: existingChallenge } = await supabase
      .from("user_active_challenges")
      .select("id, expires_at")
      .eq("user_id", userData.id)
      .eq("status", "active")
      .not("unpredictable_challenge_id", "is", null)
      .single();

    // Double-check that existing challenge hasn't expired
    if (existingChallenge) {
      const isExpired = existingChallenge.expires_at && new Date(existingChallenge.expires_at) <= new Date();

      if (!isExpired) {
        return NextResponse.json({
          success: false,
          message: "User already has an active unpredictable challenge",
          challengeId: existingChallenge.id,
        });
      }

      // If expired but somehow still marked active, expire it now
      await supabase
        .from("user_active_challenges")
        .update({ status: "expired" })
        .eq("id", existingChallenge.id);

      console.log(`⏰ Expired stale challenge ${existingChallenge.id}`);
    }

    // Get available unpredictable challenges
    const { data: availableChallenges, error: challengesError } = await supabase
      .from("unpredictable_challenges")
      .select("*")
      .eq("is_active", true);

    if (challengesError || !availableChallenges?.length) {
      return NextResponse.json({
        success: false,
        message: "No unpredictable challenges available",
      });
    }

    // Weighted random selection
    const totalWeight = availableChallenges.reduce((sum, c) => sum + (c.weight || 1), 0);
    let random = Math.random() * totalWeight;
    let selectedChallenge = availableChallenges[0];

    for (const challenge of availableChallenges) {
      random -= challenge.weight || 1;
      if (random <= 0) {
        selectedChallenge = challenge;
        break;
      }
    }

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (selectedChallenge.duration_hours || 24));

    // Get target count from requirements
    const requirements = selectedChallenge.requirements || {};
    const targetCount = requirements.min_observations || 1;

    // Create user challenge assignment
    const { data: assignment, error: assignError } = await supabase
      .from("user_active_challenges")
      .insert({
        user_id: userData.id,
        unpredictable_challenge_id: selectedChallenge.id,
        status: "active",
        progress_count: 0,
        target_count: targetCount,
        expires_at: expiresAt.toISOString(),
        notification_shown: false,
        notification_clicked: false,
      })
      .select(
        `
        *,
        unpredictable_challenge:unpredictable_challenges(*)
      `
      )
      .single();

    if (assignError) {
      console.error("Error assigning challenge:", assignError);
      return NextResponse.json(
        { error: "Failed to assign challenge", details: assignError.message },
        { status: 500 }
      );
    }

    console.log(
      `✅ Assigned challenge "${selectedChallenge.title}" to user ${userData.id}`
    );

    return NextResponse.json({
      success: true,
      challenge: assignment,
      message: `New challenge assigned: ${selectedChallenge.title}`,
    });
  } catch (error) {
    console.error("Error in assign-random POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
