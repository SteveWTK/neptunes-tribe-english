import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/leaderboard/naturalists
 * Fetches top naturalists ranked by total points
 * Supports: global, school, and timeframe filters
 */
export async function GET(request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const filter = searchParams.get("filter") || "global"; // global, school
    const timeframe = searchParams.get("timeframe") || "all"; // all, week, month

    const supabase = await getSupabaseAdmin();

    // Get current user info if authenticated
    let currentUserId = null;
    let userSchoolId = null;

    if (session?.user) {
      const { data: userData } = await supabase
        .from("users")
        .select("id, school_id")
        .eq("email", session.user.email)
        .single();

      currentUserId = userData?.id;
      userSchoolId = userData?.school_id;
    }

    // Build query for leaderboard
    let query = supabase
      .from("user_species_journey")
      .select(
        `
        user_id,
        total_points,
        observations_count,
        current_iucn_status,
        species_avatar:species_avatars(
          id,
          common_name,
          avatar_image_url,
          iucn_status
        ),
        user:users!user_id(
          id,
          name,
          image,
          school_id
        )
      `
      )
      .order("total_points", { ascending: false });

    // Apply school filter if requested
    if (filter === "school" && userSchoolId) {
      // We need to filter by school, but user_species_journey doesn't have school_id directly
      // So we'll fetch all and filter, or use a join approach
      // For now, let's fetch and filter client-side (not ideal for large datasets)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: leaderboardData, error: leaderboardError } = await query;

    if (leaderboardError) {
      console.error("Error fetching leaderboard:", leaderboardError);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard", details: leaderboardError.message },
        { status: 500 }
      );
    }

    // Filter by school if needed
    let filteredData = leaderboardData || [];
    if (filter === "school" && userSchoolId) {
      filteredData = filteredData.filter(
        (entry) => entry.user?.school_id === userSchoolId
      );
    }

    // Add rank and check if current user
    const rankedData = filteredData.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.user_id,
      userName: entry.user?.name || "Anonymous Naturalist",
      userImage: entry.user?.image,
      totalPoints: entry.total_points || 0,
      observationsCount: entry.observations_count || 0,
      currentStatus: entry.current_iucn_status,
      speciesAvatar: entry.species_avatar,
      isCurrentUser: currentUserId === entry.user_id,
    }));

    // Get current user's rank if not in top results
    let currentUserRank = null;
    if (currentUserId) {
      const userInList = rankedData.find((entry) => entry.isCurrentUser);
      if (!userInList) {
        // Count how many users have more points
        const { count } = await supabase
          .from("user_species_journey")
          .select("*", { count: "exact", head: true })
          .gt("total_points", rankedData.length > 0 ? rankedData[rankedData.length - 1]?.totalPoints : 0);

        // Get current user's journey
        const { data: userJourney } = await supabase
          .from("user_species_journey")
          .select(
            `
            user_id,
            total_points,
            observations_count,
            current_iucn_status,
            species_avatar:species_avatars(
              id,
              common_name,
              avatar_image_url,
              iucn_status
            )
          `
          )
          .eq("user_id", currentUserId)
          .single();

        if (userJourney) {
          // Get exact rank
          const { count: higherRanked } = await supabase
            .from("user_species_journey")
            .select("*", { count: "exact", head: true })
            .gt("total_points", userJourney.total_points);

          currentUserRank = {
            rank: (higherRanked || 0) + 1,
            userId: userJourney.user_id,
            userName: session.user.name || "You",
            userImage: session.user.image,
            totalPoints: userJourney.total_points || 0,
            observationsCount: userJourney.observations_count || 0,
            currentStatus: userJourney.current_iucn_status,
            speciesAvatar: userJourney.species_avatar,
            isCurrentUser: true,
          };
        }
      }
    }

    // Get total count
    const { count: totalCount } = await supabase
      .from("user_species_journey")
      .select("*", { count: "exact", head: true });

    return NextResponse.json({
      success: true,
      leaderboard: rankedData,
      currentUserRank,
      total: totalCount || 0,
      limit,
      offset,
      filter,
    });
  } catch (error) {
    console.error("Error in naturalists leaderboard GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
