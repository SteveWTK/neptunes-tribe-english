// app/api/leaderboard/route.js - Global and user leaderboards
import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "global"; // 'global' or 'user'
    const challengeId = searchParams.get("challengeId");

    const supabase = getSupabaseAdmin();

    if (type === "global") {
      // Global challenge leaderboard
      const { data: globalStats, error } = await supabase
        .from("challenge_leaderboard")
        .select("*")
        .order("completion_percentage", { ascending: false });

      if (error) {
        console.error("Error fetching global leaderboard:", error);
        return new NextResponse("Database error", { status: 500 });
      }

      return NextResponse.json(globalStats || []);
    } else if (type === "user") {
      // User leaderboard for specific challenge or all challenges
      let query = supabase.from("user_challenge_leaderboard").select("*");

      if (challengeId) {
        query = query.eq("challenge_id", parseInt(challengeId));
      }

      const { data: userStats, error } = await query
        .order("rank", { ascending: true })
        .limit(100); // Top 100 users

      if (error) {
        console.error("Error fetching user leaderboard:", error);
        return new NextResponse("Database error", { status: 500 });
      }

      return NextResponse.json(userStats || []);
    }

    return new NextResponse("Invalid type parameter", { status: 400 });
  } catch (error) {
    console.error("Unexpected error in leaderboard API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
