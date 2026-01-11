import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/observations/[id]
 * Fetches a single observation with user and engagement data
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();
    const supabase = await getSupabaseAdmin();

    // Get observation with user info
    const { data: observation, error } = await supabase
      .from("user_observations")
      .select(
        `
        *,
        user:user_id (
          id,
          name,
          email,
          image
        )
      `
      )
      .eq("id", id)
      .single();

    if (error || !observation) {
      return NextResponse.json(
        { error: "Observation not found" },
        { status: 404 }
      );
    }

    // Get likes count
    const { count: likesCount } = await supabase
      .from("observation_likes")
      .select("*", { count: "exact", head: true })
      .eq("observation_id", id);

    // Get comments count
    const { count: commentsCount } = await supabase
      .from("observation_comments")
      .select("*", { count: "exact", head: true })
      .eq("observation_id", id);

    // Check if current user has liked this observation
    let userHasLiked = false;
    if (session?.user?.email) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (userData) {
        const { data: like } = await supabase
          .from("observation_likes")
          .select("id")
          .eq("observation_id", id)
          .eq("user_id", userData.id)
          .single();

        userHasLiked = !!like;
      }
    }

    // Get comments with user info
    const { data: comments } = await supabase
      .from("observation_comments")
      .select(
        `
        *,
        user:user_id (
          id,
          name,
          image
        )
      `
      )
      .eq("observation_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      observation: {
        ...observation,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
        user_has_liked: userHasLiked,
      },
      comments: comments || [],
    });
  } catch (error) {
    console.error("Error fetching observation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/observations/[id]
 * Deletes an observation (owner only)
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseAdmin();

    // Get user ID
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check ownership
    const { data: observation } = await supabase
      .from("user_observations")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!observation) {
      return NextResponse.json(
        { error: "Observation not found" },
        { status: 404 }
      );
    }

    if (observation.user_id !== userData.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this observation" },
        { status: 403 }
      );
    }

    // Delete observation (cascade will handle likes/comments)
    const { error: deleteError } = await supabase
      .from("user_observations")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting observation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
