import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/observations/[id]/like
 * Toggle like on an observation
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const observationId = params.id;

    if (!observationId) {
      return NextResponse.json(
        { error: "Missing observation ID" },
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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from("observation_likes")
      .select("*")
      .eq("observation_id", observationId)
      .eq("user_id", userData.id)
      .single();

    let liked = false;
    let newLikesCount = 0;

    if (existingLike) {
      // Unlike
      await supabase
        .from("observation_likes")
        .delete()
        .eq("observation_id", observationId)
        .eq("user_id", userData.id);

      // Decrement count
      const { data: obs } = await supabase
        .from("user_observations")
        .select("likes_count")
        .eq("id", observationId)
        .single();

      newLikesCount = Math.max(0, (obs?.likes_count || 1) - 1);

      await supabase
        .from("user_observations")
        .update({ likes_count: newLikesCount })
        .eq("id", observationId);

      liked = false;
    } else {
      // Like
      await supabase.from("observation_likes").insert({
        observation_id: observationId,
        user_id: userData.id,
      });

      // Increment count
      const { data: obs } = await supabase
        .from("user_observations")
        .select("likes_count")
        .eq("id", observationId)
        .single();

      newLikesCount = (obs?.likes_count || 0) + 1;

      await supabase
        .from("user_observations")
        .update({ likes_count: newLikesCount })
        .eq("id", observationId);

      liked = true;
    }

    return NextResponse.json({
      success: true,
      liked,
      likes_count: newLikesCount,
    });
  } catch (error) {
    console.error("Error in like POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
