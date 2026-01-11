import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/challenges/ngo
 * Fetches active NGO challenges
 */
export async function GET(request) {
  try {
    const session = await auth();
    const supabase = await getSupabaseAdmin();

    const today = new Date().toISOString().split("T")[0];

    // Get active NGO challenges
    const { data: challenges, error } = await supabase
      .from("ngo_challenges")
      .select(
        `
        *,
        ngo:ngos(*)
      `
      )
      .eq("is_active", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .order("featured", { ascending: false })
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching NGO challenges:", error);
      return NextResponse.json(
        { error: "Failed to fetch challenges", details: error.message },
        { status: 500 }
      );
    }

    // If user is logged in, get their progress on each challenge
    let userProgress = {};
    if (session?.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (userData) {
        const { data: progress } = await supabase
          .from("user_active_challenges")
          .select("*")
          .eq("user_id", userData.id)
          .not("ngo_challenge_id", "is", null);

        if (progress) {
          progress.forEach((p) => {
            userProgress[p.ngo_challenge_id] = p;
          });
        }
      }
    }

    // Attach user progress to challenges
    const challengesWithProgress = challenges.map((challenge) => ({
      ...challenge,
      user_progress: userProgress[challenge.id] || null,
    }));

    return NextResponse.json({
      success: true,
      challenges: challengesWithProgress,
    });
  } catch (error) {
    console.error("Error in NGO challenges GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/challenges/ngo
 * Join an NGO challenge
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { challengeId } = await request.json();

    if (!challengeId) {
      return NextResponse.json(
        { error: "Missing challengeId" },
        { status: 400 }
      );
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

    // Check if already joined
    const { data: existing } = await supabase
      .from("user_active_challenges")
      .select("id")
      .eq("user_id", userData.id)
      .eq("ngo_challenge_id", challengeId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: false,
        message: "Already joined this challenge",
        challengeId: existing.id,
      });
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from("ngo_challenges")
      .select("*")
      .eq("id", challengeId)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Create assignment
    const { data: assignment, error: assignError } = await supabase
      .from("user_active_challenges")
      .insert({
        user_id: userData.id,
        ngo_challenge_id: challengeId,
        status: "active",
        progress_count: 0,
        target_count: challenge.target_count || 1,
        expires_at: challenge.end_date ? `${challenge.end_date}T23:59:59Z` : null,
        notification_shown: true, // NGO challenges don't need red dot
        notification_clicked: true,
      })
      .select(
        `
        *,
        ngo_challenge:ngo_challenges(*)
      `
      )
      .single();

    if (assignError) {
      console.error("Error joining challenge:", assignError);
      return NextResponse.json(
        { error: "Failed to join challenge", details: assignError.message },
        { status: 500 }
      );
    }

    console.log(`✅ User ${userData.id} joined NGO challenge "${challenge.title}"`);

    return NextResponse.json({
      success: true,
      challenge: assignment,
      message: `You've joined "${challenge.title}"!`,
    });
  } catch (error) {
    console.error("Error in NGO challenges POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
