import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/vocabulary/practice
 * Increments practice count for a vocabulary word
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vocabularyId } = await request.json();

    if (!vocabularyId) {
      return NextResponse.json(
        { error: "Missing vocabularyId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const userId = session.user.userId || session.user.id;

    // Update practice count (RLS ensures user can only update their own)
    const { data, error } = await supabase
      .from("personal_vocabulary")
      .update({
        times_practiced: supabase.raw("times_practiced + 1"),
        last_practiced_at: new Date().toISOString(),
      })
      .eq("id", vocabularyId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating practice count:", error);
      return NextResponse.json(
        { error: "Failed to update practice count", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      timesPracticed: data.times_practiced,
    });
  } catch (error) {
    console.error("Error in vocabulary practice API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
