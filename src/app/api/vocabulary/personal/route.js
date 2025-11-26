import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/vocabulary/personal
 * Fetches user's personal vocabulary list
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS (we're already authenticated via NextAuth)
    const supabase = await getSupabaseAdmin();

    // Get user ID from the users table by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    const userId = userData.id;

    const { data, error } = await supabase
      .from("personal_vocabulary")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching personal vocabulary:", error);
      return NextResponse.json(
        { error: "Failed to fetch vocabulary", details: error.message },
        { status: 500 }
      );
    }

    // Transform to match expected format
    const vocabulary = data.map((item) => ({
      id: item.id,
      en: item.english,
      pt: item.portuguese,
      enImage: item.english_image,
      ptImage: item.portuguese_image,
      timesPracticed: item.times_practiced,
      lastPracticedAt: item.last_practiced_at,
      createdAt: item.created_at,
    }));

    return NextResponse.json({
      success: true,
      vocabulary,
      count: vocabulary.length,
    });
  } catch (error) {
    console.error("Error in personal vocabulary GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vocabulary/personal
 * Adds a word to user's personal vocabulary
 */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { english, portuguese, englishImage, portugueseImage, lessonId, stepType } = body;

    if (!english || !portuguese) {
      return NextResponse.json(
        { error: "Missing required fields: english and portuguese" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS (we're already authenticated via NextAuth)
    const supabase = await getSupabaseAdmin();

    // Get user ID from the users table by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    const userId = userData.id;
    console.log("✅ Found user ID:", userId, "for email:", session.user.email);

    // Check if word already exists (case-insensitive)
    const { data: existing } = await supabase
      .from("personal_vocabulary")
      .select("id")
      .eq("user_id", userId)
      .ilike("english", english)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Word already in your personal vocabulary",
          alreadyExists: true,
        },
        { status: 200 }
      );
    }

    // Insert new word
    const { data, error } = await supabase
      .from("personal_vocabulary")
      .insert({
        user_id: userId,
        english,
        portuguese,
        english_image: englishImage || null,
        portuguese_image: portugueseImage || null,
        lesson_id: lessonId || null,
        step_type: stepType || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding to personal vocabulary:", error);
      return NextResponse.json(
        { error: "Failed to add vocabulary", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Added "${english}" to personal vocabulary for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Word added to your personal vocabulary",
      vocabulary: {
        id: data.id,
        en: data.english,
        pt: data.portuguese,
        enImage: data.english_image,
        ptImage: data.portuguese_image,
      },
    });
  } catch (error) {
    console.error("Error in personal vocabulary POST:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vocabulary/personal
 * Removes a word from user's personal vocabulary
 */
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vocabularyId = searchParams.get("id");

    if (!vocabularyId) {
      return NextResponse.json(
        { error: "Missing vocabulary ID" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS (we're already authenticated via NextAuth)
    const supabase = await getSupabaseAdmin();

    // Get user ID from the users table by email
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    const userId = userData.id;

    // Delete the word (RLS ensures user can only delete their own)
    const { error } = await supabase
      .from("personal_vocabulary")
      .delete()
      .eq("id", vocabularyId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting from personal vocabulary:", error);
      return NextResponse.json(
        { error: "Failed to delete vocabulary", details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Removed vocabulary ID ${vocabularyId} for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Word removed from your personal vocabulary",
    });
  } catch (error) {
    console.error("Error in personal vocabulary DELETE:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
