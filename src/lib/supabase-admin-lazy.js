// lib/supabase-admin-lazy.js

import { createClient } from "@supabase/supabase-js";

let supabaseAdmin = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const supabaseUrl =
      process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("=== LAZY SUPABASE ADMIN DEBUG ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("SUPABASE_URL:", supabaseUrl ? "✓ Present" : "✗ Missing");
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY:",
      supabaseServiceKey ? "✓ Present" : "✗ Missing"
    );
    console.log(
      "GOOGLE_CLIENT_ID:",
      process.env.GOOGLE_CLIENT_ID ? "✓ Present" : "✗ Missing"
    );
    console.log(
      "GOOGLE_CLIENT_SECRET:",
      process.env.GOOGLE_CLIENT_SECRET ? "✓ Present" : "✗ Missing"
    );
    console.log(
      "NEXTAUTH_SECRET:",
      process.env.NEXTAUTH_SECRET ? "✓ Present" : "✗ Missing"
    );
    console.log(
      "NEXTAUTH_URL:",
      process.env.NEXTAUTH_URL || "Not set (using auto-detection)"
    );

    // Additional debugging for production
    if (process.env.NODE_ENV === "production") {
      console.log("Production environment detected");
      console.log("Vercel URL:", process.env.VERCEL_URL);
      console.log("Vercel Environment:", process.env.VERCEL_ENV);
    }
    console.log("===============================");

    if (!supabaseUrl) {
      console.error("❌ SUPABASE URL MISSING!");
      throw new Error("Missing Supabase URL environment variable");
    }

    if (!supabaseServiceKey) {
      console.error("❌ SUPABASE SERVICE KEY MISSING!");
      throw new Error("Missing Supabase Service Role Key environment variable");
    }

    try {
      supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      console.log("✅ Supabase admin client created successfully");
    } catch (error) {
      console.error("❌ Failed to create Supabase admin client:", error);
      throw error;
    }
  }

  return supabaseAdmin;
}

export default getSupabaseAdmin;
