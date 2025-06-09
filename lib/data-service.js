import { createClient } from "@supabase/supabase-js";
import supabaseAdmin from "./supabase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchData(unitId) {
  const { data: textData, error: textError } = await supabase
    .from("texts")
    .select("id, full_text, full_text_pt, full_text_es, text_with_gaps")
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
    questions: formattedQuestions,
  };
}

export async function fetchUnitDetails(unitId) {
  const { data, error } = await supabase
    .from("units")
    .select("theme, difficulty_level, title, description, image")
    .eq("id", unitId)
    .single();

  if (error) {
    console.error("Error fetching unit details:", error);
    return null;
  }

  return data;
}

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
  const { data, error } = await supabase
    .from("units")
    .select("id, unit, title")
    .order("unit", { ascending: true });

  if (error) {
    console.error("Error fetching units:", error);
    return [];
  }

  return data;
}

export async function fetchFeaturedUnits() {
  const { data, error } = await supabase
    .from("units")
    .select("id, unit, title, theme, featured, rank")
    .eq("featured", true)
    .order("rank", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch featured units");
  }

  return data;
}

export async function fetchSingleGapChallenges(challengeId) {
  const { data, error } = await supabase
    .from("single_gap_challenge")
    .select("id, title, text, options, correct_answer, image_url")
    .eq("challenge_id", challengeId)
    .order("id", { ascending: true });

  if (error) {
    // console.error("Error fetching single-gap challenges:", error);
    return [];
  }

  const formattedExercises = data.map((item) => ({
    id: item.id,
    title: item.title,
    text: item.text,
    options:
      typeof item.options === "string" ? item.options.split(",") : item.options,
    correctAnswer: item.correct_answer,
    imageUrl: item.image_url,
  }));

  return formattedExercises;
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

export async function fetchUser(email) {
  try {
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error updating user:", error);
    throw error;
  }
}

export async function getUserById(userId) {
  try {
    const { data, error } = await supabaseAdmin
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
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
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
