import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchData(unitId) {
  const { data: textData, error: textError } = await supabase
    .from("texts")
    .select("id, full_text, full_text_pt, full_text_es, text_with_gaps")
    .eq("unit_id", unitId)
    .single();

  if (textError) console.error("Error fetching text:", textError);

  const { data: gapData, error: gapError } = await supabase
    .from("gap_fill_questions")
    .select(
      "gap_number, correct_answer, options, part_before, part_after, text_id"
    )
    .eq("text_id", textData?.id);

  if (gapError) console.error("Error fetching gaps:", gapError);

  const formattedQuestions =
    gapData?.map((q) => ({
      ...q,
      options: typeof q.options === "string" ? q.options.split(",") : q.options,
    })) || [];

  return {
    textId: textData?.id, // Store text ID
    fullText: textData?.full_text || "No text available",
    gapText: textData?.text_with_gaps || "No text available",
    portugueseTranslation: textData?.full_text_pt || "",
    spanishTranslation: textData?.full_text_es || "",
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
