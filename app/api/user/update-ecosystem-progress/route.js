// app/api/user/update-ecosystem-progress/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { unitId } = await request.json();

    if (!unitId) {
      return new NextResponse("Unit ID required", { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user ID
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get the unit's ecosystem
    const { data: unitData, error: unitError } = await supabase
      .from("units")
      .select("primary_ecosystem")
      .eq("id", unitId)
      .single();

    if (unitError) {
      console.error("Error fetching unit ecosystem:", unitError);
      return new NextResponse("Unit not found", { status: 404 });
    }

    // Only proceed if the unit has an ecosystem
    if (!unitData.primary_ecosystem) {
      console.log(`Unit ${unitId} has no ecosystem classification`);
      return NextResponse.json({ message: "No ecosystem to update" });
    }

    const ecosystem = unitData.primary_ecosystem;
    const userId = userData.id;

    // Insert or update the user's ecosystem progress
    const { data: progressData, error: progressError } = await supabase
      .from("user_ecosystem_progress")
      .upsert(
        {
          user_id: userId,
          ecosystem: ecosystem,
          units_completed: 1,
          last_activity_date: new Date().toISOString().split("T")[0], // Today's date
        },
        {
          onConflict: "user_id,ecosystem",
          ignoreDuplicates: false,
        }
      )
      .select();

    // If upsert didn't work (existing record), we need to increment manually
    if (!progressData || progressData.length === 0) {
      // Get current progress
      const { data: currentProgress } = await supabase
        .from("user_ecosystem_progress")
        .select("units_completed")
        .eq("user_id", userId)
        .eq("ecosystem", ecosystem)
        .single();

      if (currentProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("user_ecosystem_progress")
          .update({
            units_completed: currentProgress.units_completed + 1,
            last_activity_date: new Date().toISOString().split("T")[0],
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("ecosystem", ecosystem);

        if (updateError) {
          console.error("Error updating ecosystem progress:", updateError);
          return new NextResponse("Failed to update progress", { status: 500 });
        }
      }
    }

    console.log(`Updated ${ecosystem} ecosystem progress for user ${userId}`);

    return NextResponse.json({
      success: true,
      ecosystem: ecosystem,
      message: `Updated ${ecosystem} progress`,
    });
  } catch (error) {
    console.error("Error in ecosystem progress update:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
