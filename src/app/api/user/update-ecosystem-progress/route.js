// app/api/user/update-ecosystem-progress/route.js - Enhanced with challenge integration
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

    // Get the unit's ecosystem and location data
    const { data: unitData, error: unitError } = await supabase
      .from("units")
      .select("primary_ecosystem, region_code, marine_zone, title")
      .eq("id", unitId)
      .single();

    if (unitError) {
      console.error("Error fetching unit ecosystem:", unitError);
      return new NextResponse("Unit not found", { status: 404 });
    }

    const userId = userData.id;
    const ecosystem = unitData.primary_ecosystem;
    const today = new Date().toISOString().split("T")[0];

    let ecosystemResult = null;
    let challengeResults = [];

    // 1. Update ecosystem progress (existing logic)
    if (ecosystem) {
      const { data: existingProgress, error: selectError } = await supabase
        .from("user_ecosystem_progress")
        .select("id, units_completed")
        .eq("user_id", userId)
        .eq("ecosystem", ecosystem)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Error checking existing progress:", selectError);
        return new NextResponse("Database error", { status: 500 });
      }

      if (existingProgress) {
        const newCount = existingProgress.units_completed + 1;

        const { data: updateData, error: updateError } = await supabase
          .from("user_ecosystem_progress")
          .update({
            units_completed: newCount,
            last_activity_date: today,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("ecosystem", ecosystem)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating ecosystem progress:", updateError);
          return new NextResponse("Failed to update progress", { status: 500 });
        }

        ecosystemResult = updateData;
        console.log(
          `Updated ${ecosystem} progress for user ${userId}: ${existingProgress.units_completed} -> ${newCount}`
        );
      } else {
        const { data: insertData, error: insertError } = await supabase
          .from("user_ecosystem_progress")
          .insert({
            user_id: userId,
            ecosystem: ecosystem,
            units_completed: 1,
            current_level: 0,
            current_badge: null,
            last_activity_date: today,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating ecosystem progress:", insertError);
          return new NextResponse("Failed to create progress", { status: 500 });
        }

        ecosystemResult = insertData;
        console.log(
          `Created new ${ecosystem} progress for user ${userId}: 1 unit completed`
        );
      }
    }

    // 2. Update challenge progress (new logic)
    if (ecosystem) {
      try {
        // Find relevant active challenges
        const { data: relevantChallenges, error: challengeError } =
          await supabase
            .from("environmental_challenges")
            .select("*")
            .eq("is_active", true)
            .eq("target_ecosystem", ecosystem);

        if (challengeError) {
          console.warn("Error fetching challenges:", challengeError);
        } else if (relevantChallenges && relevantChallenges.length > 0) {
          // Process each relevant challenge
          for (const challenge of relevantChallenges) {
            try {
              const affectedRegions = challenge.affected_regions || [];
              const unitRegions = parseRegionArray(unitData.region_code);
              const unitMarineZones = parseRegionArray(unitData.marine_zone);

              // Check if this unit affects the challenge area
              const isRelevant = affectedRegions.some(
                (region) =>
                  unitRegions.includes(region) ||
                  unitMarineZones.includes(region)
              );

              if (isRelevant) {
                // Update user's progress on this challenge
                const { data: existingChallengeProgress } = await supabase
                  .from("user_challenge_progress")
                  .select("units_contributed")
                  .eq("user_id", userId)
                  .eq("challenge_id", challenge.id)
                  .single();

                if (existingChallengeProgress) {
                  // Update existing challenge progress
                  const { error: updateChallengeError } = await supabase
                    .from("user_challenge_progress")
                    .update({
                      units_contributed:
                        existingChallengeProgress.units_contributed + 1,
                      last_contribution: today,
                    })
                    .eq("user_id", userId)
                    .eq("challenge_id", challenge.id);

                  if (!updateChallengeError) {
                    challengeResults.push({
                      challengeId: challenge.id,
                      challengeName: challenge.name,
                      challengeType: challenge.type,
                      newContribution:
                        existingChallengeProgress.units_contributed + 1,
                      totalRequired: challenge.units_required,
                    });
                  }
                } else {
                  // Create new challenge progress
                  const { error: insertChallengeError } = await supabase
                    .from("user_challenge_progress")
                    .insert({
                      user_id: userId,
                      challenge_id: challenge.id,
                      units_contributed: 1,
                      last_contribution: today,
                    });

                  if (!insertChallengeError) {
                    challengeResults.push({
                      challengeId: challenge.id,
                      challengeName: challenge.name,
                      challengeType: challenge.type,
                      newContribution: 1,
                      totalRequired: challenge.units_required,
                    });
                  }
                }

                // Check for species unlock
                await checkSpeciesUnlock(
                  userId,
                  challenge.id,
                  ecosystem,
                  ecosystemResult?.units_completed || 1
                );
              }
            } catch (individualChallengeError) {
              console.warn(
                `Error processing individual challenge ${challenge.id}:`,
                individualChallengeError
              );
            }
          }
        }
      } catch (challengeProcessingError) {
        console.warn("Error processing challenges:", challengeProcessingError);
        // Don't fail the whole request if challenge processing fails
      }
    }

    // 3. Return comprehensive results
    return NextResponse.json({
      success: true,
      ecosystem: ecosystem,
      ecosystemProgress: ecosystemResult
        ? {
            ecosystem: ecosystem,
            units_completed: ecosystemResult.units_completed,
            message: `Updated ${ecosystem} progress to ${ecosystemResult.units_completed} units`,
          }
        : null,
      challengeProgress: challengeResults,
      message: buildSuccessMessage(
        ecosystemResult,
        challengeResults,
        unitData.title
      ),
    });
  } catch (error) {
    console.error("Error in ecosystem progress update:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Helper function to parse region arrays (handles both string and array formats)
function parseRegionArray(regionData) {
  if (!regionData) return [];

  if (Array.isArray(regionData)) return regionData;

  if (typeof regionData === "string") {
    // Handle JSON array format like ["BR", "PE"]
    if (regionData.startsWith("[") && regionData.endsWith("]")) {
      try {
        return JSON.parse(regionData);
      } catch (e) {
        console.warn("Failed to parse region array:", regionData);
        return [regionData]; // Treat as single region
      }
    }
    return [regionData]; // Single region
  }

  return [];
}

// Helper function to check species unlock
async function checkSpeciesUnlock(
  userId,
  challengeId,
  ecosystem,
  totalEcosystemUnits
) {
  const supabase = getSupabaseAdmin();

  try {
    // Get available species for this ecosystem that user hasn't adopted
    const { data: availableSpecies } = await supabase
      .from("adoptable_species")
      .select("*")
      .eq("ecosystem", ecosystem)
      .eq("is_active", true)
      .lte("units_required", totalEcosystemUnits);

    if (!availableSpecies || availableSpecies.length === 0) return;

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
      const { error: adoptError } = await supabase
        .from("species_adoptions")
        .insert({
          user_id: userId,
          species_name: species.name,
          species_emoji: species.emoji,
          ecosystem: species.ecosystem,
          units_required: species.units_required,
          challenge_id: challengeId,
          adopted_at: new Date().toISOString(),
        });

      if (!adoptError) {
        console.log(
          `🐾 User ${userId} adopted ${species.name} ${species.emoji}!`
        );
      }
    }
  } catch (error) {
    console.error("Error checking species unlock:", error);
  }
}

// Helper function to build success message
function buildSuccessMessage(ecosystemResult, challengeResults, unitTitle) {
  let message = `Completed "${unitTitle}"!`;

  if (ecosystemResult) {
    message += ` 🌱 ${ecosystemResult.ecosystem} progress: ${ecosystemResult.units_completed} units.`;
  }

  if (challengeResults.length > 0) {
    message += ` 🚨 Contributing to ${challengeResults.length} active environmental challenge(s):`;
    challengeResults.forEach((challenge) => {
      const progressPercentage = Math.round(
        (challenge.newContribution / challenge.totalRequired) * 100
      );
      message += ` ${challenge.challengeName} (${progressPercentage}%)`;
    });
  }

  return message;
}

// app/api/user/update-ecosystem-progress/route.js
// import { NextResponse } from "next/server";
// import { auth } from "@/lib/auth";
// import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

// export async function POST(request) {
//   try {
//     const session = await auth();

//     if (!session?.user?.email) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const { unitId } = await request.json();

//     if (!unitId) {
//       return new NextResponse("Unit ID required", { status: 400 });
//     }

//     const supabase = getSupabaseAdmin();

//     // Get user ID
//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("email", session.user.email)
//       .single();

//     if (userError || !userData) {
//       return new NextResponse("User not found", { status: 404 });
//     }

//     // Get the unit's ecosystem
//     const { data: unitData, error: unitError } = await supabase
//       .from("units")
//       .select("primary_ecosystem")
//       .eq("id", unitId)
//       .single();

//     if (unitError) {
//       console.error("Error fetching unit ecosystem:", unitError);
//       return new NextResponse("Unit not found", { status: 404 });
//     }

//     // Only proceed if the unit has an ecosystem
//     if (!unitData.primary_ecosystem) {
//       console.log(`Unit ${unitId} has no ecosystem classification`);
//       return NextResponse.json({ message: "No ecosystem to update" });
//     }

//     const ecosystem = unitData.primary_ecosystem;
//     const userId = userData.id;
//     const today = new Date().toISOString().split("T")[0];

//     // ✅ FIXED: First check if record exists
//     const { data: existingProgress, error: selectError } = await supabase
//       .from("user_ecosystem_progress")
//       .select("id, units_completed")
//       .eq("user_id", userId)
//       .eq("ecosystem", ecosystem)
//       .single();

//     if (selectError && selectError.code !== "PGRST116") {
//       // PGRST116 = no rows returned (expected for new records)
//       console.error("Error checking existing progress:", selectError);
//       return new NextResponse("Database error", { status: 500 });
//     }

//     let result;

//     if (existingProgress) {
//       // ✅ FIXED: Record exists, increment the count
//       const newCount = existingProgress.units_completed + 1;

//       const { data: updateData, error: updateError } = await supabase
//         .from("user_ecosystem_progress")
//         .update({
//           units_completed: newCount,
//           last_activity_date: today,
//           updated_at: new Date().toISOString(),
//         })
//         .eq("user_id", userId)
//         .eq("ecosystem", ecosystem)
//         .select()
//         .single();

//       if (updateError) {
//         console.error("Error updating ecosystem progress:", updateError);
//         return new NextResponse("Failed to update progress", { status: 500 });
//       }

//       result = updateData;
//       console.log(
//         `Updated ${ecosystem} progress for user ${userId}: ${existingProgress.units_completed} -> ${newCount}`
//       );
//     } else {
//       // ✅ FIXED: Record doesn't exist, create new with count = 1
//       const { data: insertData, error: insertError } = await supabase
//         .from("user_ecosystem_progress")
//         .insert({
//           user_id: userId,
//           ecosystem: ecosystem,
//           units_completed: 1,
//           current_level: 0,
//           current_badge: null,
//           last_activity_date: today,
//         })
//         .select()
//         .single();

//       if (insertError) {
//         console.error("Error creating ecosystem progress:", insertError);
//         return new NextResponse("Failed to create progress", { status: 500 });
//       }

//       result = insertData;
//       console.log(
//         `Created new ${ecosystem} progress for user ${userId}: 1 unit completed`
//       );
//     }

//     return NextResponse.json({
//       success: true,
//       ecosystem: ecosystem,
//       units_completed: result.units_completed,
//       message: `Updated ${ecosystem} progress to ${result.units_completed} units`,
//     });
//   } catch (error) {
//     console.error("Error in ecosystem progress update:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }
