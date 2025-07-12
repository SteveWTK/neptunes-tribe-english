// / app/api/challenges/contribute/route.js - Contribute to environmental challenge?
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { unitId, challengeId } = await request.json();

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

    // Get unit ecosystem to find matching challenges
    const { data: unitData, error: unitError } = await supabase
      .from("units")
      .select("primary_ecosystem, region_code, marine_zone")
      .eq("id", unitId)
      .single();

    if (unitError) {
      console.error("Error fetching unit data:", unitError);
      return new NextResponse("Unit not found", { status: 404 });
    }

    const userId = userData.id;
    let affectedChallenges = [];

    if (challengeId) {
      // Specific challenge contribution
      const { data: challenge } = await supabase
        .from("environmental_challenges")
        .select("*")
        .eq("id", challengeId)
        .eq("is_active", true)
        .single();

      if (challenge) {
        affectedChallenges = [challenge];
      }
    } else {
      // Auto-detect relevant challenges based on unit data
      const { data: relevantChallenges } = await supabase
        .from("environmental_challenges")
        .select("*")
        .eq("is_active", true)
        .eq("target_ecosystem", unitData.primary_ecosystem);

      if (relevantChallenges) {
        // Filter challenges that affect the unit's regions
        affectedChallenges = relevantChallenges.filter((challenge) => {
          const affectedRegions = challenge.affected_regions || [];
          const unitRegions = unitData.region_code
            ? Array.isArray(unitData.region_code)
              ? unitData.region_code
              : [unitData.region_code]
            : [];
          const unitMarineZones = unitData.marine_zone
            ? Array.isArray(unitData.marine_zone)
              ? unitData.marine_zone
              : [unitData.marine_zone]
            : [];

          return affectedRegions.some(
            (region) =>
              unitRegions.includes(region) || unitMarineZones.includes(region)
          );
        });
      }
    }

    const results = [];

    // Process each affected challenge
    for (const challenge of affectedChallenges) {
      try {
        // Update or create user challenge progress
        const { data: existingProgress } = await supabase
          .from("user_challenge_progress")
          .select("units_contributed")
          .eq("user_id", userId)
          .eq("challenge_id", challenge.id)
          .single();

        if (existingProgress) {
          // Update existing progress
          const { error: updateError } = await supabase
            .from("user_challenge_progress")
            .update({
              units_contributed: existingProgress.units_contributed + 1,
              last_contribution: new Date().toISOString().split("T")[0],
            })
            .eq("user_id", userId)
            .eq("challenge_id", challenge.id);

          if (!updateError) {
            results.push({
              challengeId: challenge.id,
              challengeName: challenge.name,
              newContribution: existingProgress.units_contributed + 1,
            });
          }
        } else {
          // Create new progress record
          const { error: insertError } = await supabase
            .from("user_challenge_progress")
            .insert({
              user_id: userId,
              challenge_id: challenge.id,
              units_contributed: 1,
              last_contribution: new Date().toISOString().split("T")[0],
            });

          if (!insertError) {
            results.push({
              challengeId: challenge.id,
              challengeName: challenge.name,
              newContribution: 1,
            });
          }
        }

        // Check if species can be unlocked
        await checkSpeciesUnlock(
          userId,
          challenge.id,
          unitData.primary_ecosystem
        );
      } catch (challengeError) {
        console.error(
          `Error processing challenge ${challenge.id}:`,
          challengeError
        );
      }
    }

    return NextResponse.json({
      success: true,
      affectedChallenges: results,
      message: `Contributed to ${results.length} environmental challenge(s)!`,
    });
  } catch (error) {
    console.error("Error in challenge contribution:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper function to check species unlock
async function checkSpeciesUnlock(userId, challengeId, ecosystem) {
  const supabase = getSupabaseAdmin();

  try {
    // Get user's total progress in this ecosystem
    const { data: ecosystemProgress } = await supabase
      .from("user_ecosystem_progress")
      .select("units_completed")
      .eq("user_id", userId)
      .eq("ecosystem", ecosystem)
      .single();

    if (!ecosystemProgress) return;

    // Get available species for this ecosystem that user hasn't adopted
    const { data: availableSpecies } = await supabase
      .from("adoptable_species")
      .select("*")
      .eq("ecosystem", ecosystem)
      .eq("is_active", true)
      .lte("units_required", ecosystemProgress.units_completed);

    if (!availableSpecies) return;

    // Check which species user hasn't adopted yet
    const { data: adoptedSpecies } = await supabase
      .from("species_adoptions")
      .select("species_name")
      .eq("user_id", userId);

    const adoptedNames = adoptedSpecies?.map((s) => s.species_name) || [];
    const newSpecies = availableSpecies.filter(
      (species) => !adoptedNames.includes(species.name)
    );

    // Auto-adopt eligible species
    for (const species of newSpecies) {
      await supabase.from("species_adoptions").insert({
        user_id: userId,
        species_name: species.name,
        species_emoji: species.emoji,
        ecosystem: species.ecosystem,
        units_required: species.units_required,
        challenge_id: challengeId,
        adopted_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error checking species unlock:", error);
  }
}
