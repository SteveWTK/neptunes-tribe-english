// // lib/supabase-admin-lazy.js
// import { createClient } from "@supabase/supabase-js";

// let supabaseAdmin = null;

// function getSupabaseAdmin() {
//   if (!supabaseAdmin) {
//     const supabaseUrl =
//       process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
//     const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

//     console.log("=== LAZY SUPABASE ADMIN DEBUG ===");
//     console.log("Environment variables at runtime:");
//     console.log("SUPABASE_URL:", supabaseUrl ? "✓ Present" : "✗ Missing");
//     console.log(
//       "SUPABASE_SERVICE_ROLE_KEY:",
//       supabaseServiceKey ? "✓ Present" : "✗ Missing"
//     );
//     console.log("===============================");

//     if (!supabaseUrl) {
//       throw new Error("Missing Supabase URL environment variable");
//     }

//     if (!supabaseServiceKey) {
//       throw new Error("Missing Supabase Service Role Key environment variable");
//     }

//     supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
//       auth: {
//         autoRefreshToken: false,
//         persistSession: false,
//       },
//     });
//   }

//   return supabaseAdmin;
// }

// export default getSupabaseAdmin;

// export async function createUserAdmin({ id, email, name, image, role }) {
//   const admin = getSupabaseAdmin();
//   const { data, error } = await admin
//     .from("users")
//     .insert({ id, email, name, image, role })
//     .select()
//     .single();

//   if (error) throw error;
//   return data;
// }

import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Add validation for required environment variables
if (!supabaseUrl) {
  console.error(
    "Missing Supabase URL. Make sure SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is set in your environment variables."
  );
  throw new Error("Missing Supabase URL environment variable");
}

if (!supabaseServiceKey) {
  console.error(
    "Missing Supabase Service Role Key. Make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables."
  );
  throw new Error("Missing Supabase Service Role Key environment variable");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

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
