import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/beta-code/generate
 * Generates a batch of beta invitation codes (admin only)
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

    const supabase = await getSupabaseAdmin();

    // Verify admin role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData || userData.role !== "platform_admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { organization, quantity, expirationMonths, notes } =
      await request.json();

    if (
      !organization ||
      !quantity ||
      quantity < 1 ||
      quantity > 100
    ) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Calculate expiration date if specified
    let expirationDate = null;
    if (expirationMonths && expirationMonths > 0) {
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + expirationMonths);
      expirationDate = expDate.toISOString();
    }

    // Call the database function to generate codes
    const { data: codes, error } = await supabase.rpc("generate_beta_codes", {
      organization_name: organization,
      batch_size: quantity,
      admin_user_id: userData.id,
      expiration_date: expirationDate,
      batch_notes: notes || null,
    });

    if (error) {
      console.error("Error generating codes:", error);
      return NextResponse.json(
        { error: "Failed to generate codes" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      codes: codes.map((c) => c.code),
      count: codes.length,
    });
  } catch (error) {
    console.error("Error in code generation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
