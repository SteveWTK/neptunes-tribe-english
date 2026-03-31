import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/user/premium-status
 * Returns the user's premium status including pending activation flag.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = await getSupabaseAdmin();

    const { data: userData, error } = await supabase
      .from("users")
      .select("is_premium, premium_until, pending_premium_activation")
      .eq("email", session.user.email)
      .single();

    if (error) {
      console.error("Error fetching user premium status:", error);
      return NextResponse.json(
        { error: "Failed to fetch premium status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isPremium: userData?.is_premium || false,
      premiumUntil: userData?.premium_until || null,
      pendingPremiumActivation: userData?.pending_premium_activation || false,
    });
  } catch (error) {
    console.error("Error in premium-status endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
