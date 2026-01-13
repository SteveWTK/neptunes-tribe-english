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

    // Build query for leaderboard - fetch journeys first
    const { data: journeyData, error: journeyError } = await supabase
      .from("user_species_journey")
      .select("*")
      .order("total_points", { ascending: false })
      .range(offset, offset + limit - 1);

    if (journeyError) {
      console.error("Error fetching journeys:", journeyError);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard", details: journeyError.message },
        { status: 500 }
      );
    }

    console.log(`📊 Found ${journeyData?.length || 0} journey entries`);

    if (!journeyData || journeyData.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: [],
        currentUserRank: null,
        total: 0,
        limit,
        offset,
        filter,
      });
    }

    // Get user IDs and species avatar IDs
    const userIds = journeyData.map((j) => j.user_id).filter(Boolean);
    const avatarIds = journeyData.map((j) => j.species_avatar_id).filter(Boolean);

    // Fetch users data
    const { data: usersData } = await supabase
      .from("users")
      .select("id, name, image, school_id")
      .in("id", userIds);

    // Fetch species avatars data
    const { data: avatarsData } = await supabase
      .from("species_avatars")
      .select("id, common_name, avatar_image_url, iucn_status")
      .in("id", avatarIds);

    // Create lookup maps
    const usersMap = new Map((usersData || []).map((u) => [u.id, u]));
    const avatarsMap = new Map((avatarsData || []).map((a) => [a.id, a]));

    // Build leaderboard data
    let leaderboardData = journeyData.map((journey) => ({
      ...journey,
      user: usersMap.get(journey.user_id) || null,
      species_avatar: avatarsMap.get(journey.species_avatar_id) || null,
    }));

    // Filter by school if needed
    if (filter === "school" && userSchoolId) {
      leaderboardData = leaderboardData.filter(
        (entry) => entry.user?.school_id === userSchoolId
      );
    }

    // Add rank and check if current user
    const rankedData = leaderboardData.map((entry, index) => ({
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
          .select("*")
          .eq("user_id", currentUserId)
          .single();

        if (userJourney) {
          // Get avatar if exists
          let userAvatar = null;
          if (userJourney.species_avatar_id) {
            const { data: avatarData } = await supabase
              .from("species_avatars")
              .select("id, common_name, avatar_image_url, iucn_status")
              .eq("id", userJourney.species_avatar_id)
              .single();
            userAvatar = avatarData;
          }

          // Get exact rank
          const { count: higherRanked } = await supabase
            .from("user_species_journey")
            .select("*", { count: "exact", head: true })
            .gt("total_points", userJourney.total_points);

          currentUserRank = {
            rank: (higherRanked || 0) + 1,
            userId: userJourney.user_id,
            userName: session?.user?.name || "You",
            userImage: session?.user?.image,
            totalPoints: userJourney.total_points || 0,
            observationsCount: userJourney.observations_count || 0,
            currentStatus: userJourney.current_iucn_status,
            speciesAvatar: userAvatar,
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
