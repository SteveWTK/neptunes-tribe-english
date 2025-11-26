import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/vocabulary/word-snake
 * Converts personal vocabulary into Word Snake clues
 * Returns clues with English words to spell and Portuguese as hints
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Fetch personal vocabulary
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

    // Convert vocabulary to Word Snake clues format
    const clues = data
      .filter((word) => word.english && word.portuguese) // Ensure both fields exist
      .filter((word) => word.english.length >= 3) // Only words 3+ letters (reasonable for game)
      .map((word, index) => ({
        id: word.id,
        clue: word.portuguese, // Portuguese as the clue
        answer: word.english.toUpperCase(), // English word to spell
        hint: `Palavra em inglês: ${word.portuguese}`,
        fact: `Practice word: "${word.english}" means "${word.portuguese}" in Portuguese`,
        targetImage: word.english_image || word.portuguese_image || null, // Use image if available
        practiced: word.times_practiced || 0,
      }));

    console.log(`✅ Generated ${clues.length} Word Snake clues from personal vocabulary for user ${userId}`);

    return NextResponse.json({
      success: true,
      clues,
      count: clues.length,
    });
  } catch (error) {
    console.error("Error in Word Snake vocabulary API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
