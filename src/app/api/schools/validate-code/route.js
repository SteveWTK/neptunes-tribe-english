import { NextResponse } from "next/server";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/schools/validate-code
 * Public endpoint to validate a school code and get the school slug for redirect.
 */
export async function POST(request) {
  try {
    const supabase = await getSupabaseAdmin();

    const body = await request.json();
    const code = body.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    // Find school by code
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id, name, slug, is_active")
      .eq("code", code)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { valid: false, error: "Invalid school code" },
        { status: 200 }
      );
    }

    if (!school.is_active) {
      return NextResponse.json(
        { valid: false, error: "This school is no longer active" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
      },
    });
  } catch (error) {
    console.error("Error validating school code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
