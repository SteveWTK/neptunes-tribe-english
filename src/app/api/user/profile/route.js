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
        "id, name, email, image, role, is_premium, is_supporter, stripe_customer_id, stripe_subscription_status, created_at, full_name, school_id, school_level_id, teacher_id, enrolled_at, user_type"
      )
      .eq("email", session.user.email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch school info if enrolled
    let schoolInfo = null;
    if (user.school_id) {
      const { data: school } = await supabase
        .from("schools")
        .select("id, name, slug, logo_url")
        .eq("id", user.school_id)
        .single();

      let levelInfo = null;
      if (user.school_level_id) {
        const { data: level } = await supabase
          .from("school_levels")
          .select("id, name, habitat_level")
          .eq("id", user.school_level_id)
          .single();
        levelInfo = level;
      }

      let teacherInfo = null;
      if (user.teacher_id) {
        const { data: teacher } = await supabase
          .from("school_teachers")
          .select("id, name")
          .eq("id", user.teacher_id)
          .single();
        teacherInfo = teacher;
      }

      schoolInfo = {
        school,
        level: levelInfo,
        teacher: teacherInfo,
        enrolledAt: user.enrolled_at,
      };
    }

    // Check if user needs to set display name
    // For school students, use full_name; for others, use name
    const displayName = user.full_name || user.name;
    const needsDisplayName = !displayName || displayName.trim() === "";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        fullName: user.full_name,
        displayName, // The best name to show (full_name or name)
        email: user.email,
        image: user.image,
        role: user.role,
        isPremium: user.is_premium,
        isSupporter: user.is_supporter,
        hasStripeCustomer: !!user.stripe_customer_id,
        subscriptionStatus: user.stripe_subscription_status,
        createdAt: user.created_at,
        userType: user.user_type,
      },
      schoolInfo,
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
