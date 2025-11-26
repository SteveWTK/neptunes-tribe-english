import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/vocabulary/memory-match
 * Fetches all vocabulary from Memory Match steps in active lessons
 * Returns deduplicated vocabulary with images (when available)
 */
export async function GET(request) {
  try {
    const supabase = await createClient();

    // Fetch all active lessons
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("id, content")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching lessons:", error);
      return NextResponse.json(
        { error: "Failed to fetch lessons", details: error.message },
        { status: 500 }
      );
    }

    // Extract all Memory Match vocabulary from lesson steps
    const vocabularyMap = new Map(); // Use Map to deduplicate by English word

    lessons.forEach((lesson) => {
      if (!lesson.content || !lesson.content.steps) return;

      lesson.content.steps.forEach((step) => {
        // Check if this is a Memory Match step
        if (step.type === "memory_match" && step.vocabulary) {
          step.vocabulary.forEach((word) => {
            // Use English word as the key for deduplication
            const key = (word.english || word.en || "").toLowerCase().trim();

            if (key) {
              // Only add if we don't have it yet, or if the new one has images
              const existing = vocabularyMap.get(key);
              const hasImages = !!(word.enImage || word.ptImage);

              if (!existing || (hasImages && !existing.hasImages)) {
                vocabularyMap.set(key, {
                  id: word.id || key,
                  en: word.english || word.en,
                  pt: word.translation || word.portuguese || word.pt,
                  enImage: word.enImage || null,
                  ptImage: word.ptImage || null,
                  hasImages: hasImages,
                });
              }
            }
          });
        }
      });
    });

    // Convert Map to array and ensure unique IDs
    const vocabulary = Array.from(vocabularyMap.values()).map((word, index) => ({
      ...word,
      id: `vocab-${index}-${word.en.toLowerCase().replace(/\s+/g, '-')}`, // Generate unique ID
    }));

    console.log(`✅ Fetched ${vocabulary.length} unique vocabulary words from ${lessons.length} lessons`);

    return NextResponse.json({
      success: true,
      vocabulary,
      count: vocabulary.length,
      lessonsScanned: lessons.length,
    });
  } catch (error) {
    console.error("Error in vocabulary API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
