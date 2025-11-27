import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/beta-code/list
 * Lists all beta invitation codes with usage stats (admin only)
 */
export async function GET(request) {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const organization = searchParams.get("organization");
    const isUsed = searchParams.get("isUsed");

    // Build query
    let query = supabase
      .from("beta_invitation_codes")
      .select("*")
      .order("created_at", { ascending: false });

    if (organization) {
      query = query.eq("organization", organization);
    }
    if (isUsed !== null) {
      query = query.eq("is_used", isUsed === "true");
    }

    const { data: codes, error } = await query;

    if (error) {
      console.error("Error fetching codes:", error);
      return NextResponse.json(
        { error: "Failed to fetch codes" },
        { status: 500 }
      );
    }

    // Get statistics
    const totalCodes = codes.length;
    const usedCodes = codes.filter((c) => c.is_used).length;
    const unusedCodes = totalCodes - usedCodes;
    const organizations = [...new Set(codes.map((c) => c.organization))];

    return NextResponse.json({
      codes,
      stats: {
        total: totalCodes,
        used: usedCodes,
        unused: unusedCodes,
        organizations,
      },
    });
  } catch (error) {
    console.error("Error in code list fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
