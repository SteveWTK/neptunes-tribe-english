import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Syncs theme_tags from lesson to units referenced in unit_reference steps
 * This ensures units automatically inherit the lesson's theme_tags
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, themeTags } = await request.json();

    if (!lessonId || !themeTags || !Array.isArray(themeTags)) {
      return NextResponse.json(
        { error: "Missing lessonId or themeTags" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the lesson content to find unit_reference steps
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("content")
      .eq("id", lessonId)
      .single();

    if (lessonError) {
      console.error("Error fetching lesson:", lessonError);
      return NextResponse.json(
        { error: "Failed to fetch lesson" },
        { status: 500 }
      );
    }

    // Find all unit_reference steps
    const unitReferenceSteps =
      lesson.content?.steps?.filter((step) => step.type === "unit_reference") ||
      [];

    if (unitReferenceSteps.length === 0) {
      return NextResponse.json({
        message: "No unit_reference steps found in lesson",
        unitsUpdated: 0,
      });
    }

    // Extract unique unit IDs
    const unitIds = [
      ...new Set(unitReferenceSteps.map((step) => step.unit_id).filter(Boolean)),
    ];

    if (unitIds.length === 0) {
      return NextResponse.json({
        message: "No valid unit IDs found",
        unitsUpdated: 0,
      });
    }

    console.log(
      `Syncing theme tags ${JSON.stringify(themeTags)} to units:`,
      unitIds
    );

    // For each unit, merge the lesson's theme_tags with existing theme_tags
    const updates = [];
    for (const unitId of unitIds) {
      // Get current unit theme_tags
      const { data: unit } = await supabase
        .from("units")
        .select("theme_tags")
        .eq("id", unitId)
        .single();

      if (!unit) {
        console.warn(`Unit ${unitId} not found, skipping`);
        continue;
      }

      // Merge existing and new theme tags (deduplicate)
      const existingTags = unit.theme_tags || [];
      const mergedTags = [...new Set([...existingTags, ...themeTags])];

      // Only update if there are new tags to add
      if (mergedTags.length > existingTags.length) {
        const { error: updateError } = await supabase
          .from("units")
          .update({ theme_tags: mergedTags })
          .eq("id", unitId);

        if (updateError) {
          console.error(`Error updating unit ${unitId}:`, updateError);
        } else {
          updates.push({
            unitId,
            addedTags: themeTags.filter((tag) => !existingTags.includes(tag)),
          });
          console.log(`✅ Updated unit ${unitId} with tags:`, mergedTags);
        }
      } else {
        console.log(`Unit ${unitId} already has all theme tags`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced theme tags to ${updates.length} units`,
      unitsUpdated: updates.length,
      updates,
    });
  } catch (error) {
    console.error("Error syncing unit theme tags:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
