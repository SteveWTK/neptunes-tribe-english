import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/beta-code/redeem
 * Redeems a beta tester invitation code and upgrades user to beta_tester
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

    // Call the database function to redeem the code
    console.log("Attempting to redeem code:", code.trim().toUpperCase(), "for user:", session.user.email);

    const { data, error } = await supabase.rpc("redeem_beta_code", {
      code_to_redeem: code.trim().toUpperCase(),
      user_email: session.user.email,
    });

    console.log("Supabase RPC response:", { data, error });

    if (error) {
      console.error("Error redeeming beta code:", error);
      return NextResponse.json(
        { error: error.message || "Failed to redeem code", details: error },
        { status: 500 }
      );
    }

    // The function returns a JSON object with success/error
    if (!data.success) {
      console.log("Function returned error:", data.error);
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      organization: data.organization,
    });
  } catch (error) {
    console.error("Error in beta code redemption:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
