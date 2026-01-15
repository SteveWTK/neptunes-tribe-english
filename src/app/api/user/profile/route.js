import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * GET /api/user/profile
 * Fetches user's profile data
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseAdmin();

    const { data: user, error } = await supabase
      .from("users")
      .select(
        "id, name, email, image, role, is_premium, is_supporter, stripe_customer_id, stripe_subscription_status, created_at"
      )
      .eq("email", session.user.email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user needs to set display name
    const needsDisplayName = !user.name || user.name.trim() === "";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        isPremium: user.is_premium,
        isSupporter: user.is_supporter,
        hasStripeCustomer: !!user.stripe_customer_id,
        subscriptionStatus: user.stripe_subscription_status,
        createdAt: user.created_at,
      },
      needsDisplayName,
    });
  } catch (error) {
    console.error("Error in profile GET:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Updates user's profile data
 */
export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    // Validate name
    if (name !== undefined) {
      if (typeof name !== "string") {
        return NextResponse.json(
          { error: "Name must be a string" },
          { status: 400 }
        );
      }
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: "Name must be at least 2 characters" },
          { status: 400 }
        );
      }
      if (name.trim().length > 50) {
        return NextResponse.json(
          { error: "Name must be 50 characters or less" },
          { status: 400 }
        );
      }
    }

    const supabase = await getSupabaseAdmin();

    // Get current user
    const { data: currentUser, error: fetchError } = await supabase
      .from("users")
      .select("id")
      .eq("email", session.user.email)
      .single();

    if (fetchError || !currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build update object (only include fields that were provided)
    const updateData = {};
    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", currentUser.id)
      .select("id, name, email, image")
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile", details: updateError.message },
        { status: 500 }
      );
    }

    console.log(`✅ Updated profile for user ${currentUser.id}:`, updateData);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error in profile PATCH:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
