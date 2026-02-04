import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/guest-access/campaigns/[id]
 * Returns detailed campaign info with individual session data. Admin only.
 */
export async function GET(request, { params }) {
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

    const { id } = await params;

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("guest_access_codes")
      .select("*")
      .eq("id", id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Fetch sessions for this campaign
    const { data: sessions } = await supabase
      .from("guest_sessions")
      .select("*")
      .eq("access_code_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      campaign,
      sessions: sessions || [],
    });
  } catch (error) {
    console.error("Error fetching campaign detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/guest-access/campaigns/[id]
 * Updates a campaign (toggle active, change max_uses, etc.). Admin only.
 */
export async function PATCH(request, { params }) {
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

    const { id } = await params;
    const updates = await request.json();

    // Only allow specific fields to be updated
    const allowedFields = [
      "name",
      "is_active",
      "max_uses",
      "expires_at",
      "destination_path",
      "access_tier",
      "duration_hours",
      "welcome_message",
      "welcome_message_pt",
      "welcome_message_th",
      "campaign_name",
      "campaign_location",
      "metadata",
    ];

    const sanitizedUpdates = {};
    for (const key of allowedFields) {
      if (key in updates) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("guest_access_codes")
      .update(sanitizedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating campaign:", updateError);
      return NextResponse.json(
        { error: "Failed to update campaign" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
