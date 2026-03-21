import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, xpEarned, adventureId, worldId } = await request.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: "Missing lessonId" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS policies (same as /api/lessons/complete)
    const supabase = await getSupabaseAdmin();

    // Look up the user by email to get the database UUID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userData.id;
    console.log(`📝 Recording lesson completion for user ${userId}, lesson ${lessonId}`);

    // Check if already completed (check for any completion of this lesson)
    const { data: existing } = await supabase
      .from("lesson_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (existing) {
      console.log("Lesson already completed for user:", userId);
      return NextResponse.json({
        success: true,
        message: "Lesson already completed",
        data: existing,
      });
    }

    // Insert completion record
    const { data, error } = await supabase
      .from("lesson_completions")
      .insert({
        user_id: userId,
        lesson_id: lessonId,
        xp_earned: xpEarned || 0,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Supabase error inserting lesson completion:", error);
      return NextResponse.json(
        { error: "Failed to save lesson completion", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Lesson completion saved:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Error in lesson completion API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a lesson is completed
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");

    if (!lessonId) {
      return NextResponse.json(
        { error: "Missing lessonId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const userId = session.user.userId || session.user.id;

    const { data, error } = await supabase
      .from("lesson_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" which is okay
      console.error("Error checking lesson completion:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ completed: !!data, data });
  } catch (error) {
    console.error("Error in lesson completion check:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
