import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL, // not NEXT_PUBLIC_
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabaseAdmin;

export async function createUserAdmin({ id, email, name, image, role }) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ id, email, name, image, role })
    .select()
    .single();

  if (error) throw error;
  return data;
}
