import { createClient } from "@supabase/supabase-js";

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

export async function fetchUser(email) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle(); // allows 0 or 1 result

  if (error) {
    console.error("Error fetching user:", error);
    throw error;
  }

  return data; // will be null if not found
}

export async function createUser({ id, email, name, image, role }) {
  const { data, error } = await supabase
    .from("users")
    .insert({ id, email, name, image, role })
    .select()
    .single(); // ensures the new row is returned immediately

  if (error) {
    throw error;
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
