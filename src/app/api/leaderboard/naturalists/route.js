import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/leaderboard/naturalists
 * Fetches top naturalists ranked by COMBINED total points
 * (journey points from observations + XP from lessons)
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
      // Try with school_id, fall back to without if column doesn't exist
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, school_id")
        .eq("email", session.user.email)
        .single();

      if (userError?.code === "42703") {
        // Column doesn't exist, try without
        const { data: userBasic } = await supabase
          .from("users")
          .select("id")
          .eq("email", session.user.email)
          .single();
        currentUserId = userBasic?.id;
      } else {
        currentUserId = userData?.id;
        userSchoolId = userData?.school_id;
      }
    }

    // Fetch ALL journey data (we'll sort after combining with XP)
    const { data: journeyData, error: journeyError } = await supabase
      .from("user_species_journey")
      .select("*");

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

    console.log(`🔍 Looking up ${userIds.length} user IDs`);

    // Fetch users data (including email for fallback display name)
    let usersData = null;
    let usersError = null;

    const { data: usersWithSchool, error: schoolError } = await supabase
      .from("users")
      .select("id, name, email, image, school_id")
      .in("id", userIds);

    if (schoolError?.code === "42703") {
      // Column doesn't exist, try without school_id
      console.log("⚠️ school_id column not found, fetching without it");
      const { data: usersBasic, error: basicError } = await supabase
        .from("users")
        .select("id, name, email, image")
        .in("id", userIds);
      usersData = usersBasic;
      usersError = basicError;
    } else {
      usersData = usersWithSchool;
      usersError = schoolError;
    }

    if (usersError) {
      console.error("Error fetching users:", usersError);
    }

    // Fetch user_progress (XP from lessons) for all users with journeys
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select("user_id, xp")
      .in("user_id", userIds);

    if (progressError && progressError.code !== "42P01") {
      // 42P01 = table doesn't exist
      console.error("Error fetching user progress:", progressError);
    }

    console.log(`📚 Found ${progressData?.length || 0} user progress entries`);

    // Helper to get display name: name > email prefix > "Naturalist"
    const getDisplayName = (user) => {
      if (user?.name) return user.name;
      if (user?.email) {
        const emailPrefix = user.email.split("@")[0];
        return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1, 15);
      }
      return "Naturalist";
    };

    // Fetch species avatars data
    const { data: avatarsData } = await supabase
      .from("species_avatars")
      .select("id, common_name, avatar_image_url, iucn_status")
      .in("id", avatarIds);

    // Create lookup maps
    const usersMap = new Map((usersData || []).map((u) => [u.id, u]));
    const avatarsMap = new Map((avatarsData || []).map((a) => [a.id, a]));
    const progressMap = new Map((progressData || []).map((p) => [p.user_id, p.xp || 0]));

    console.log(`🗺️ UsersMap has ${usersMap.size} entries, ProgressMap has ${progressMap.size} entries`);

    // Build leaderboard data with COMBINED points
    let leaderboardData = journeyData.map((journey) => {
      const user = usersMap.get(journey.user_id);
      const lessonXp = progressMap.get(journey.user_id) || 0;
      const journeyPoints = journey.total_points || 0;
      const combinedPoints = journeyPoints + lessonXp;

      return {
        ...journey,
        user: user || null,
        species_avatar: avatarsMap.get(journey.species_avatar_id) || null,
        lesson_xp: lessonXp,
        journey_points: journeyPoints,
        combined_points: combinedPoints,
      };
    });

    // Filter by school if needed
    if (filter === "school" && userSchoolId) {
      leaderboardData = leaderboardData.filter(
        (entry) => entry.user?.school_id === userSchoolId
      );
    }

    // Sort by COMBINED points (descending)
    leaderboardData.sort((a, b) => b.combined_points - a.combined_points);

    // Apply pagination
    const paginatedData = leaderboardData.slice(offset, offset + limit);

    // Add rank and check if current user
    const rankedData = paginatedData.map((entry, index) => ({
      rank: offset + index + 1,
      userId: entry.user_id,
      userName: getDisplayName(entry.user),
      userImage: entry.user?.image,
      totalPoints: entry.combined_points, // Combined points
      journeyPoints: entry.journey_points, // Observation points
      lessonXp: entry.lesson_xp, // Lesson XP
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
        // Find user in full sorted list
        const userIndex = leaderboardData.findIndex((entry) => entry.user_id === currentUserId);

        if (userIndex !== -1) {
          const userEntry = leaderboardData[userIndex];

          // Get avatar if exists
          let userAvatar = null;
          if (userEntry.species_avatar_id) {
            userAvatar = avatarsMap.get(userEntry.species_avatar_id);
          }

          currentUserRank = {
            rank: userIndex + 1,
            userId: userEntry.user_id,
            userName: session?.user?.name || "You",
            userImage: session?.user?.image,
            totalPoints: userEntry.combined_points,
            journeyPoints: userEntry.journey_points,
            lessonXp: userEntry.lesson_xp,
            observationsCount: userEntry.observations_count || 0,
            currentStatus: userEntry.current_iucn_status,
            speciesAvatar: userAvatar,
            isCurrentUser: true,
          };
        }
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard: rankedData,
      currentUserRank,
      total: leaderboardData.length,
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
