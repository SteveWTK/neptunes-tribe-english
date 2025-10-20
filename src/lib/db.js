const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVER_ROLE_KEY
);

export async function incrementSupportProgress() {
  const { data, error } = await supabase
    .from("support_stats")
    .update({ current_supporters: supabase.raw("current_supporters +1") })
    .eq("id", 1);

  if (error) throw new Error(error.message);
  return data;
}
