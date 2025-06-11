// lib/supabase-admin-lazy.js
import { createClient } from "@supabase/supabase-js";

let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("=== LAZY SUPABASE ADMIN DEBUG ===");
    console.log("Environment variables at runtime:");
    console.log("SUPABASE_URL:", supabaseUrl ? "✓ Present" : "✗ Missing");
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY:",
      supabaseServiceKey ? "✓ Present" : "✗ Missing"
    );
    console.log("===============================");

    if (!supabaseUrl) {
      throw new Error("Missing Supabase URL environment variable");
    }

    if (!supabaseServiceKey) {
      throw new Error("Missing Supabase Service Role Key environment variable");
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}

export default getSupabaseAdmin;

export async function createUserAdmin({ id, email, name, image, role }) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("users")
    .insert({ id, email, name, image, role })
    .select()
    .single();

  if (error) throw error;
  return data;
}
