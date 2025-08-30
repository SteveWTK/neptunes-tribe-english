// lib\data-service.js

import { createClient } from "@supabase/supabase-js";
import getSupabaseAdmin from "./supabase-admin-lazy";

console.log("Environment check:");
console.log(
  "NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Present" : "✗ Missing"
);
console.log(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Present" : "✗ Missing"
);
console.log(
  "SUPABASE_URL:",
  process.env.SUPABASE_URL ? "✓ Present" : "✗ Missing"
);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Present" : "✗ Missing"
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchData(unitId) {
  const { data: textData, error: textError } = await supabase
    .from("texts")
    .select(
      "id, full_text, full_text_pt, full_text_es, full_text_fr, text_with_gaps"
    )
    .eq("unit_id", unitId)
    .single();

  if (textError || !textData) {
    console.error("Error fetching text:", textError);
    return {
      textId: null,
      fullText: "No text available",
      gapText: "No text available",
      portugueseTranslation: "",
      spanishTranslation: "",
      frenchTranslation: "",
      questions: [],
    };
  }

  const { data: gapData, error: gapError } = await supabase
    .from("gap_fill_questions")
    .select(
      "gap_number, correct_answer, options, part_before, part_after, text_id"
    )
    .eq("text_id", textData.id);

  if (gapError) {
    console.error("Error fetching gaps:", gapError);
  }

  const formattedQuestions =
    gapData?.map((q) => ({
      ...q,
      options: typeof q.options === "string" ? q.options.split(",") : q.options,
    })) || [];

  return {
    textId: textData.id,
    fullText: textData.full_text,
    gapText: textData.text_with_gaps,
    portugueseTranslation: textData.full_text_pt,
    spanishTranslation: textData.full_text_es,
    frenchTranslation: textData.full_text_fr,
    questions: formattedQuestions,
  };
}

// Enhanced fetchUnitDetails to include premium status
export async function fetchUnitDetails(unitId) {
  try {
    const { data, error } = await supabase
      .from("units")
      .select(
        "theme, difficulty_level, title, description, length, image, audio, region_name, is_premium"
      )
      .eq("id", unitId)
      .single();

    if (error) {
      console.error("Error fetching unit details:", error);
      throw new Error(`Failed to fetch unit details: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in fetchUnitDetails:", error);
    throw error;
  }
}

// export async function fetchUnitDetails(unitId) {
//   try {
//     const { data, error } = await supabase
//       .from("units")
//       .select(
//         "theme, difficulty_level, title, description, length, image, audio, region_name"
//       )
//       .eq("id", unitId)
//       .single();

//     if (error) {
//       console.error("Error fetching unit details:", error);
//       throw new Error(`Failed to fetch unit details: ${error.message}`);
//     }

//     return data;
//   } catch (error) {
//     console.error("Error in fetchUnitDetails:", error);
//     throw error;
//   }
// }

export async function fetchUnitThemes() {
  const { data, error } = await supabase.from("units").select("theme");

  if (error) {
    console.error("Error fetching themes:", error);
    return [];
  }

  const themes = Array.from(new Set(data.map((unit) => unit.theme))).filter(
    Boolean
  );
  return themes;
}

export async function fetchAllUnits() {
  try {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error fetching all units:", error);
      throw new Error(`Failed to fetch all units: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchAllUnits:", error);
    throw error;
  }
}

// Updated fetchFeaturedUnits - now shows all units regardless of premium status
export async function fetchFeaturedUnits(options = {}) {
  const {
    sortBy = "rank", // 'rank', 'length', 'newest', 'id'
    sortOrder = "asc", // 'asc', 'desc'
    showCompletedOnly = false,
    userCompletedIds = [],
  } = options;

  try {
    let query = supabase
      .from("units")
      .select("id, unit, title, theme, featured, rank, length, is_premium")
      .eq("featured", true);

    // Completion filtering
    if (showCompletedOnly && userCompletedIds.length > 0) {
      query = query.in("id", userCompletedIds);
    }

    // Apply sorting
    switch (sortBy) {
      case "length":
        // Convert length to numeric for proper sorting
        query = query.order("length", { ascending: sortOrder === "asc" });
        break;
      case "newest":
      case "id":
        query = query.order("id", { descending: sortOrder === "desc" });
        break;
      default:
        query = query.order("rank", { ascending: sortOrder === "asc" });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching featured units:", error);
      throw new Error(`Failed to fetch featured units: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error("Error in fetchFeaturedUnits:", error);
    throw error;
  }
}

// export async function fetchFeaturedUnits() {
//   try {
//     const { data, error } = await supabase
//       .from("units")
//       .select("id, unit, title, theme, featured, rank")
//       .eq("featured", true)
//       .order("rank", { ascending: true });

//     if (error) {
//       console.error("Error fetching featured units:", error);
//       throw new Error(`Failed to fetch featured units: ${error.message}`);
//     }

//     return data;
//   } catch (error) {
//     console.error("Error in fetchFeaturedUnits:", error);
//     throw error;
//   }
// }

// Updated fetchSingleGapChallenges - now shows all exercises but with premium info
export async function fetchSingleGapChallenges(
  challengeId,
  isPremiumUser = false
) {
  const { data, error } = await supabase
    .from("single_gap_challenge")
    .select(
      "id, challenge_title, title, text, options, correct_answer, image_url, is_premium"
    )
    .eq("challenge_id", challengeId)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching single-gap challenges:", error);
    return [];
  }

  const formattedExercises = data.map((item) => ({
    id: item.id,
    challengeTitle: item.challenge_title,
    title: item.title,
    text: item.text,
    options:
      typeof item.options === "string" ? item.options.split(",") : item.options,
    correctAnswer: item.correct_answer,
    imageUrl: item.image_url,
    isPremium: item.is_premium,
  }));

  return formattedExercises;
}

// Updated fetchFeaturedChallenges - now shows all challenges regardless of premium status
export async function fetchFeaturedChallenges() {
  try {
    const { data, error } = await supabase
      .from("single_gap_challenge")
      .select("challenge_id, challenge_title, image_url, is_premium")
      .not("challenge_id", "is", null)
      .order("challenge_id", { ascending: true });

    if (error) {
      console.error("Error fetching featured challenges:", error);
      return [];
    }

    const uniqueChallenges = data.reduce((acc, current) => {
      const existing = acc.find(
        (item) => item.challenge_id === current.challenge_id
      );
      if (!existing) {
        acc.push({
          challenge_id: current.challenge_id,
          challenge_title: current.challenge_title,
          image_url: current.image_url,
          is_premium: current.is_premium,
        });
      }
      return acc;
    }, []);

    return uniqueChallenges;
  } catch (error) {
    console.error("Error in fetchFeaturedChallenges:", error);
    return [];
  }
}

// New function to check if specific content is accessible
export async function checkContentAccess(contentType, contentId, userSession) {
  try {
    const tableName = contentType === "unit" ? "units" : "single_gap_challenge";
    const idColumn = contentType === "unit" ? "id" : "challenge_id";

    const { data, error } = await supabase
      .from(tableName)
      .select("is_premium")
      .eq(idColumn, contentId)
      .single();

    if (error) {
      console.error(`Error checking ${contentType} access:`, error);
      return { hasAccess: false, isPremium: false, requiresUpgrade: false };
    }

    const isPremiumContent = data?.is_premium || false;
    const isPremiumUser = userSession?.user?.is_premium || false;

    if (!isPremiumContent) {
      // Free content - everyone can access
      return { hasAccess: true, isPremium: false, requiresUpgrade: false };
    }

    if (isPremiumContent && isPremiumUser) {
      // Premium content, premium user
      return { hasAccess: true, isPremium: true, requiresUpgrade: false };
    }

    // Premium content, non-premium user
    return { hasAccess: false, isPremium: true, requiresUpgrade: true };
  } catch (error) {
    console.error("Error in checkContentAccess:", error);
    return { hasAccess: false, isPremium: false, requiresUpgrade: false };
  }
}

export async function fetchChallengeDetails(challengeId) {
  const { data, error } = await supabase
    .from("single_gap_challenge")
    .select("id, challenge_title, title, text, image_url")
    .eq("challenge_id", challengeId)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching challenge details:", error);
    return {
      exerciseCount: 0,
      description: "Challenge details unavailable",
    };
  }

  // Create a description from the first exercise or provide a default
  const description =
    data.length > 0
      ? `Complete ${data.length} gap-fill exercises focusing on ${
          data[0].challenge_title?.toLowerCase() || "English skills"
        }.`
      : "Interactive English learning challenge";

  return {
    exerciseCount: data.length,
    description: description,
    firstExerciseTitle: data[0]?.title || "",
  };
}

export async function getPendingManualDonations() {
  const { data, error } = await supabase
    .from("manual_donations")
    .select("id, amount, created_at, user_id, public.users(email")
    .eq("confirmed", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSupportProgress() {
  const { data, error } = await supabase
    .from("support_progress")
    .select("*")
    .eq("id", "main")
    .single();

  if (error) throw error;
  return data;
}

export async function getProgressData() {
  const { data, error } = await supabase
    .from("user_progress")
    .select("total_points, current_level")
    .eq("user_id", userData.id);

  if (error) throw error;
}

export async function fetchUser(email) {
  try {
    const { data, error } = await getSupabaseAdmin() // ✅ Fixed: Added parentheses
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching user:", error);
    return null;
  }
}

export async function createUser(userData) {
  try {
    const { data, error } = await getSupabaseAdmin() // ✅ Fixed: Added parentheses
      .from("users")
      .insert([
        {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          image: userData.image,
          role: userData.role || "User",
          is_premium: false,
          is_supporter: false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error creating user:", error);
    throw error;
  }
}

export async function updateUser(userId, updates) {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    const { data, error } = await getSupabaseAdmin() // ✅ Fixed: Added parentheses
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user by ID:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching user by ID:", error);
    return null;
  }
}

// Helper function to check if an email domain is Gmail
export function isGmailAddress(email) {
  return email.toLowerCase().includes("@gmail.com");
}

// Function to find potential duplicate accounts (same email, different providers)
export async function findDuplicateAccounts(email) {
  try {
    // Check public.users
    const publicUser = await fetchUser(email);

    // Check Supabase Auth - Using the correct method
    let authUser = null;
    try {
      const { data, error } = await getSupabaseAdmin().auth.admin.listUsers({
        // ✅ Fixed: Added parentheses
        filter: `email.eq.${email}`,
        limit: 1,
      });

      if (!error && data.users && data.users.length > 0) {
        authUser = data.users[0];
      }
    } catch (error) {
      console.error(
        "Error checking Supabase Auth in findDuplicateAccounts:",
        error
      );
    }

    return {
      publicUser: publicUser,
      authUser: authUser,
      hasDuplicates: !!(publicUser && authUser),
    };
  } catch (error) {
    console.error("Error checking for duplicate accounts:", error);
    return {
      publicUser: null,
      authUser: null,
      hasDuplicates: false,
    };
  }
}

// Assessment functions

export async function createAssessment(assessmentData) {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .insert(assessmentData)
      .select()
      .single();

    if (error) {
      console.error("Error creating assessment:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createAssessment:", error);
    throw error;
  }
}

export async function getAssessmentByEmail(email) {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("email", email)
      .order("created_at", { descending: true })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching assessment:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getAssessmentByEmail:", error);
    return null;
  }
}

export async function getAllAssessments(limit = 50) {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("created_at", { descending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching all assessments:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllAssessments:", error);
    throw error;
  }
}

export async function updateAssessmentProcessed(
  assessmentId,
  processed = true
) {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .update({ processed })
      .eq("id", assessmentId)
      .select()
      .single();

    if (error) {
      console.error("Error updating assessment:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateAssessmentProcessed:", error);
    throw error;
  }
}

// eco-map weekly-theme functions

export async function getCurrentWeeklyTheme() {
  try {
    const { data, error } = await supabase.rpc("get_current_weekly_theme");

    if (error) {
      console.error("Error fetching current weekly theme:", error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error("Error in getCurrentWeeklyTheme:", error);
    return null;
  }
}

export async function getWeeklyThemeUnits(themeId) {
  try {
    // First get the theme details
    const { data: theme, error: themeError } = await supabase
      .from("weekly_themes")
      .select("*")
      .eq("id", themeId)
      .single();

    if (themeError || !theme) {
      console.error("Error fetching theme:", themeError);
      return { theme: null, units: [] };
    }

    // Build query for units that match the theme's regions and marine zones
    let query = supabase
      .from("units")
      .select(
        "id, title, description, image, region_code, marine_zone, ecosystem_type"
      );

    // Create filters for regions and marine zones
    const regionFilters = [];
    const marineFilters = [];

    // Handle featured regions
    if (theme.featured_regions && theme.featured_regions.length > 0) {
      theme.featured_regions.forEach((region) => {
        // Handle both single region codes and arrays in the units table
        regionFilters.push(`region_code.cs.{${region}}`); // contains (for arrays)
        regionFilters.push(`region_code.eq.${region}`); // equals (for single values)
      });
    }

    // Handle featured marine zones
    if (theme.featured_marine_zones && theme.featured_marine_zones.length > 0) {
      theme.featured_marine_zones.forEach((zone) => {
        marineFilters.push(`marine_zone.cs.{${zone}}`); // contains (for arrays)
        marineFilters.push(`marine_zone.eq.${zone}`); // equals (for single values)
      });
    }

    // Apply filters using OR logic
    if (regionFilters.length > 0 || marineFilters.length > 0) {
      const allFilters = [...regionFilters, ...marineFilters];
      query = query.or(allFilters.join(","));
    }

    const { data: units, error: unitsError } = await query;

    if (unitsError) {
      console.error("Error fetching theme units:", unitsError);
      return { theme, units: [] };
    }

    return { theme, units: units || [] };
  } catch (error) {
    console.error("Error in getWeeklyThemeUnits:", error);
    return { theme: null, units: [] };
  }
}

export async function getThemeImages(themeId, limit = 6) {
  try {
    const { theme, units } = await getWeeklyThemeUnits(themeId);

    if (!units || units.length === 0) {
      return [];
    }

    // Get images from units, filter out nulls, and limit
    const images = units
      .map((unit) => ({
        url: unit.image,
        title: unit.title,
        description: unit.description,
      }))
      .filter((img) => img.url)
      .slice(0, limit);

    return images;
  } catch (error) {
    console.error("Error in getThemeImages:", error);
    return [];
  }
}

export async function createWeeklyTheme(themeData) {
  try {
    const { data, error } = await supabase
      .from("weekly_themes")
      .insert([
        {
          week_start_date: themeData.week_start_date,
          week_end_date: themeData.week_end_date,
          theme_title: themeData.theme_title,
          theme_title_pt: themeData.theme_title_pt,
          theme_description: themeData.theme_description,
          theme_description_pt: themeData.theme_description_pt,
          ecosystem_type: themeData.ecosystem_type,
          featured_regions: themeData.featured_regions,
          featured_marine_zones: themeData.featured_marine_zones,
          featured_image_url: themeData.featured_image_url,
          is_active: themeData.is_active || false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating weekly theme:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createWeeklyTheme:", error);
    throw error;
  }
}

export async function setActiveWeeklyTheme(themeId) {
  try {
    // First deactivate all themes
    await supabase
      .from("weekly_themes")
      .update({ is_active: false })
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Update all

    // Then activate the selected theme
    const { data, error } = await supabase
      .from("weekly_themes")
      .update({ is_active: true })
      .eq("id", themeId)
      .select()
      .single();

    if (error) {
      console.error("Error setting active theme:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in setActiveWeeklyTheme:", error);
    throw error;
  }
}

export async function getAllWeeklyThemes() {
  try {
    const { data, error } = await supabase
      .from("weekly_themes")
      .select("*")
      .order("week_start_date", { descending: true });

    if (error) {
      console.error("Error fetching all weekly themes:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllWeeklyThemes:", error);
    return [];
  }
}

// export async function fetchUser(email) {
//   const { data, error } = await supabase
//     .from("users")
//     .select("*")
//     .eq("email", email)
//     .maybeSingle(); // allows 0 or 1 result

//   if (error) {
//     console.error("Error fetching user:", error);
//     throw error;
//   }

//   return data; // will be null if not found
// }

// export async function createUser({ id, email, name, image, role }) {
//   const { data, error } = await supabase
//     .from("users")
//     .insert({ id, email, name, image, role })
//     .select()
//     .single(); // ensures you get the new row immediately

//   if (error) {
//     throw error;
//   }

//   console.log("User created:", data);
//   return data;
// }

// export async function updateUser(userId, updates) {
//   try {
//     const { data, error } = await supabaseAdmin
//       .from("users")
//       .update(updates)
//       .eq("id", userId)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error updating user:", error);
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     console.error("Unexpected error updating user:", error);
//     throw error;
//   }
// }

// export async function fetchSingleGapChallenges(challengeId) {
//   const { data, error } = await supabase
//     .from("single_gap_challenge")
//     .select(
//       "id, challenge_title, title, text, options, correct_answer, image_url"
//     )
//     .eq("challenge_id", challengeId)
//     .order("id", { ascending: true });

//   if (error) {
//     // console.error("Error fetching single-gap challenges:", error);
//     return [];
//   }

//   const formattedExercises = data.map((item) => ({
//     id: item.id,
//     challengeTitle: item.challenge_title,
//     title: item.title,
//     text: item.text,
//     options:
//       typeof item.options === "string" ? item.options.split(",") : item.options,
//     correctAnswer: item.correct_answer,
//     imageUrl: item.image_url,
//   }));

//   return formattedExercises;
// }
