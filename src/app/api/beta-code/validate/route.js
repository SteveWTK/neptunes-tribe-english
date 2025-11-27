import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/beta-code/validate
 * Validates a beta code without redeeming it (for UI feedback)
 */
export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Invalid code format" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseAdmin();

    // Look up the code
    const { data: codeData, error } = await supabase
      .from("beta_invitation_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .single();

    if (error || !codeData) {
      return NextResponse.json(
        { valid: false, error: "Invalid code" },
        { status: 200 }
      );
    }

    if (codeData.is_used) {
      return NextResponse.json(
        { valid: false, error: "Code has already been used" },
        { status: 200 }
      );
    }

    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "Code has expired" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      organization: codeData.organization,
    });
  } catch (error) {
    console.error("Error validating beta code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
