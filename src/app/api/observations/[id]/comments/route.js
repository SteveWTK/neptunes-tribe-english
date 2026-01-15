import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/observations/[id]/comments
 * Fetches comments for an observation
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const supabase = await getSupabaseAdmin();

    const { data: comments, error, count } = await supabase
      .from("observation_comments")
      .select(
        `
        *,
        user:user_id (
          id,
          name,
          image
        )
      `,
        { count: "exact" }
      )
      .eq("observation_id", id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      comments: comments || [],
      total: count,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/observations/[id]/comments
 * Creates a new comment
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
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

    // Check observation exists
    const { data: observation } = await supabase
      .from("user_observations")
      .select("id")
      .eq("id", id)
      .single();

    if (!observation) {
      return NextResponse.json(
        { error: "Observation not found" },
        { status: 404 }
      );
    }

    // Create comment
    const { data: comment, error: insertError } = await supabase
      .from("observation_comments")
      .insert({
        observation_id: id,
        user_id: userData.id,
        comment: content.trim(),
      })
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
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
