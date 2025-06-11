// Create this as app/api/debug/route.js - REMOVE AFTER TESTING
import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

export async function GET() {
  try {
    // Test basic connection
    const { data, error } = await getSupabaseAdmin
      .from("users")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json({
        error: "Database connection failed",
        details: error.message,
      });
    }

    // Test auth admin connection
    const { data: authData, error: authError } =
      await getSupabaseAdmin.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({
        error: "Auth admin connection failed",
        details: authError.message,
      });
    }

    return NextResponse.json({
      success: true,
      dbConnection: "OK",
      authConnection: "OK",
      userCount: authData.users.length,
    });
  } catch (error) {
    return NextResponse.json({
      error: "General connection error",
      details: error.message,
    });
  }
}
