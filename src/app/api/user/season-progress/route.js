import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import { addPointsToJourney } from "@/lib/points-helper";

// World order and season mapping
const WORLDS_ORDER = [
  { id: "south_america", name: "South America", name_pt: "América do Sul" },
  { id: "africa", name: "Africa", name_pt: "África" },
  { id: "the_oceans", name: "The Oceans", name_pt: "Os Oceanos" },
  { id: "eurasia", name: "Eurasia", name_pt: "Eurásia" },
  { id: "oceania", name: "Oceania", name_pt: "Oceania" },
  { id: "polar_regions", name: "Polar Regions", name_pt: "Regiões Polares" },
  { id: "north_america", name: "North America", name_pt: "América do Norte" },
  { id: "lost_worlds", name: "Lost Worlds", name_pt: "Mundos Perdidos" },
];

const SEASONS_ORDER = ["spring", "summer", "autumn", "winter"];
const SEASON_DURATION_DAYS = 28;

// Get season for a given world index
function getSeasonForWorldIndex(index) {
  const seasonIndex = index % 4;
  const cycle = Math.floor(index / 4) + 1;
  return {
    season: SEASONS_ORDER[seasonIndex],
    cycle,
  };
}

/**
 * GET /api/user/season-progress
 * Fetches user's current season and world progress
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

    // Get or create season progress
    let { data: progress, error: progressError } = await supabase
      .from("user_season_progress")
      .select("*")
      .eq("user_id", userData.id)
      .single();

    // If no progress exists, create initial progress
    if (progressError?.code === "PGRST116" || !progress) {
      const now = new Date();
      const deadline = new Date(now);
      deadline.setDate(deadline.getDate() + SEASON_DURATION_DAYS);

      const { data: newProgress, error: createError } = await supabase
        .from("user_season_progress")
        .insert({
          user_id: userData.id,
          current_world_index: 0,
          current_season: "spring",
          season_cycle: 1,
          journey_started_at: now.toISOString(),
          current_world_started_at: now.toISOString(),
          current_world_deadline: deadline.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating season progress:", createError);
        return NextResponse.json(
          { error: "Failed to create progress", details: createError.message },
          { status: 500 }
        );
      }

      progress = newProgress;

      // Also create initial world completion record
      await supabase.from("user_world_completions").insert({
        user_id: userData.id,
        world_id: WORLDS_ORDER[0].id,
        world_index: 0,
        world_name: WORLDS_ORDER[0].name,
        season: "spring",
        season_cycle: 1,
        started_at: now.toISOString(),
        deadline_at: deadline.toISOString(),
        status: "active",
      });
    }

    // Check if current season has expired and needs to advance
    const now = new Date();
    const deadline = new Date(progress.current_world_deadline);

    if (now > deadline && progress.current_world_index < 7) {
      // Season expired - advance to next world
      progress = await advanceToNextWorld(
        supabase,
        userData.id,
        progress,
        false
      );
    }

    // Get current world info
    const currentWorld = WORLDS_ORDER[progress.current_world_index];

    // Get world completion records
    const { data: completions } = await supabase
      .from("user_world_completions")
      .select("*")
      .eq("user_id", userData.id)
      .order("world_index", { ascending: true });

    // Calculate time info
    const timeElapsed = Math.floor(
      (now - new Date(progress.current_world_started_at)) /
        (1000 * 60 * 60 * 24)
    );
    const timeRemaining = Math.max(
      0,
      Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
    );
    const progressPercent = Math.min(
      100,
      (timeElapsed / SEASON_DURATION_DAYS) * 100
    );

    return NextResponse.json({
      success: true,
      progress: {
        currentWorldIndex: progress.current_world_index,
        currentWorld: currentWorld,
        currentSeason: progress.current_season,
        seasonCycle: progress.season_cycle,
        journeyStartedAt: progress.journey_started_at,
        worldStartedAt: progress.current_world_started_at,
        worldDeadline: progress.current_world_deadline,
        daysElapsed: timeElapsed,
        daysRemaining: timeRemaining,
        progressPercent: progressPercent,
        totalWorlds: WORLDS_ORDER.length,
        isLastWorld: progress.current_world_index === 7,
      },
      completions: completions || [],
      worldsOrder: WORLDS_ORDER,
    });
  } catch (error) {
    console.error("Error in season-progress GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/season-progress
 * Handle actions: complete_world, advance_world
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();
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

    // Get current progress
    const { data: progress, error: progressError } = await supabase
      .from("user_season_progress")
      .select("*")
      .eq("user_id", userData.id)
      .single();

    if (progressError || !progress) {
      return NextResponse.json(
        { error: "No progress found. Please start your journey first." },
        { status: 404 }
      );
    }

    if (action === "complete_world") {
      // User completed all activities in current world
      const now = new Date();
      const deadline = new Date(progress.current_world_deadline);
      const completedOnTime = now <= deadline;

      // Calculate bonus points for on-time completion
      const bonusPoints = completedOnTime ? 500 : 0;

      // Update world completion record
      await supabase
        .from("user_world_completions")
        .update({
          completed_at: now.toISOString(),
          status: "completed",
          completed_on_time: completedOnTime,
          bonus_points_earned: bonusPoints,
        })
        .eq("user_id", userData.id)
        .eq("world_index", progress.current_world_index);

      // If on-time, award bonus points to user's journey
      if (bonusPoints > 0) {
        await addPointsToJourney(
          supabase,
          userData.id,
          bonusPoints,
          "season_bonus",
          `Season completion bonus for ${WORLDS_ORDER[progress.current_world_index].name}`,
          { world_index: progress.current_world_index, world_name: WORLDS_ORDER[progress.current_world_index].name }
        );
      }

      // Advance to next world if not the last
      let newProgress = progress;
      if (progress.current_world_index < 7) {
        newProgress = await advanceToNextWorld(
          supabase,
          userData.id,
          progress,
          true
        );
      }

      return NextResponse.json({
        success: true,
        message: completedOnTime
          ? `Congratulations! You completed ${
              WORLDS_ORDER[progress.current_world_index].name
            } on time and earned ${bonusPoints} bonus points!`
          : `You completed ${
              WORLDS_ORDER[progress.current_world_index].name
            }. Keep going!`,
        bonusPoints,
        completedOnTime,
        newProgress,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in season-progress POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Advance user to the next world/season
 */
async function advanceToNextWorld(
  supabase,
  userId,
  currentProgress,
  wasCompleted
) {
  const nextIndex = currentProgress.current_world_index + 1;

  if (nextIndex > 7) {
    // Journey complete!
    return currentProgress;
  }

  const { season, cycle } = getSeasonForWorldIndex(nextIndex);
  const now = new Date();
  const newDeadline = new Date(now);
  newDeadline.setDate(newDeadline.getDate() + SEASON_DURATION_DAYS);

  // Mark previous world as incomplete if it wasn't completed
  if (!wasCompleted) {
    await supabase
      .from("user_world_completions")
      .update({
        status: "incomplete",
        completed_on_time: false,
      })
      .eq("user_id", userId)
      .eq("world_index", currentProgress.current_world_index);
  }

  // Update season progress
  const { data: updatedProgress, error: updateError } = await supabase
    .from("user_season_progress")
    .update({
      current_world_index: nextIndex,
      current_season: season,
      season_cycle: cycle,
      current_world_started_at: now.toISOString(),
      current_world_deadline: newDeadline.toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    console.error("Error advancing world:", updateError);
    return currentProgress;
  }

  // Create completion record for new world
  await supabase.from("user_world_completions").upsert(
    {
      user_id: userId,
      world_id: WORLDS_ORDER[nextIndex].id,
      world_index: nextIndex,
      world_name: WORLDS_ORDER[nextIndex].name,
      season: season,
      season_cycle: cycle,
      started_at: now.toISOString(),
      deadline_at: newDeadline.toISOString(),
      status: "active",
    },
    {
      onConflict: "user_id,world_id",
    }
  );

  console.log(
    `🌍 User ${userId} advanced to World ${nextIndex + 1}: ${
      WORLDS_ORDER[nextIndex].name
    } (${season}, cycle ${cycle})`
  );

  return updatedProgress;
}
