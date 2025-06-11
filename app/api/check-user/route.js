import { fetchUser } from "@/lib/data-service";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("=== CHECK USER API DEBUG ===");

    const { email } = await request.json();
    console.log("Received email:", email);

    if (!email) {
      console.log("❌ No email provided");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    console.log("📋 Checking public.users table...");

    // Check public.users table
    let publicUser;
    try {
      publicUser = await fetchUser(email);
      console.log(
        "✅ fetchUser result:",
        publicUser ? "Found user" : "No user found"
      );
      console.log("Public user data:", publicUser);
    } catch (error) {
      console.error("❌ Error in fetchUser:", error);
      throw error;
    }

    console.log("🔐 Checking Supabase Auth...");

    // Check Supabase Auth - Using the correct method
    let authUser = null;
    let authError = null;

    try {
      // Use listUsers with email filter instead of getUserByEmail
      const { data, error } = await getSupabaseAdmin.auth.admin.listUsers({
        filter: `email.eq.${email}`,
        limit: 1,
      });

      if (error) {
        authError = error;
        console.log("Auth error:", authError.message);
      } else {
        authUser = data.users && data.users.length > 0 ? data.users[0] : null;
        console.log(
          "Auth user result:",
          authUser ? "Found auth user" : "No auth user"
        );
      }
    } catch (error) {
      console.error("❌ Error checking Supabase Auth:", error);
      authError = error;
    }

    // Determine user status
    const exists = !!publicUser;
    const hasAuthUser = !!authUser;

    // A Google OAuth user exists in public.users but not in Supabase Auth
    const isGoogleUser = exists && !hasAuthUser;

    // An email/password user exists in both public.users and Supabase Auth
    const isEmailPasswordUser = exists && hasAuthUser;

    const hasPassword = hasAuthUser;

    const result = {
      exists,
      isGoogleUser,
      hasPassword,
      isEmailPasswordUser,
      userId: publicUser?.id || null,
      authUserId: authUser?.id || null,
    };

    console.log("📊 Final user check results:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("💥 Check user API error:", error);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
