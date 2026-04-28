import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/schools/enroll
 * Enrolls a user in a school.
 * Can be called:
 * 1. By an authenticated user to enroll themselves
 * 2. During signup flow to prepare enrollment data
 */
export async function POST(request) {
  try {
    const session = await auth();
    const supabase = await getSupabaseAdmin();

    const body = await request.json();

    // Validate required fields
    if (!body.school_id) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    // Verify school exists and is active
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id, name, auto_premium, premium_duration_days, is_active")
      .eq("id", body.school_id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { error: "School not found" },
        { status: 404 }
      );
    }

    if (!school.is_active) {
      return NextResponse.json(
        { error: "This school is no longer active" },
        { status: 400 }
      );
    }

    // Verify level if provided and get habitat_level for auto-setting
    let habitatLevel = null;
    if (body.school_level_id) {
      const { data: level, error: levelError } = await supabase
        .from("school_levels")
        .select("id, is_active, habitat_level")
        .eq("id", body.school_level_id)
        .eq("school_id", body.school_id)
        .single();

      if (levelError || !level || !level.is_active) {
        return NextResponse.json(
          { error: "Invalid level for this school" },
          { status: 400 }
        );
      }

      // Store the habitat_level for auto-setting user's current_level
      habitatLevel = level.habitat_level;
    }

    // Verify teacher if provided
    if (body.teacher_id) {
      const { data: teacher, error: teacherError } = await supabase
        .from("school_teachers")
        .select("id, is_active")
        .eq("id", body.teacher_id)
        .eq("school_id", body.school_id)
        .single();

      if (teacherError || !teacher || !teacher.is_active) {
        return NextResponse.json(
          { error: "Invalid teacher for this school" },
          { status: 400 }
        );
      }
    }

    // If user is authenticated, update their record
    if (session?.user?.email) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, premium_until")
        .eq("email", session.user.email)
        .single();

      if (userError || !userData) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Prepare update data
      const updateData = {
        school_id: body.school_id,
        school_level_id: body.school_level_id || null,
        teacher_id: body.teacher_id || null,
        full_name: body.full_name?.trim() || null,
        enrolled_at: new Date().toISOString(),
        user_type: "school", // School students
      };

      // Auto-set current_level based on school level's habitat_level mapping
      if (habitatLevel) {
        updateData.current_level = habitatLevel;
        console.log("📚 Setting user current_level to:", habitatLevel);
      } else {
        console.log("⚠️ No habitat_level found for school_level_id:", body.school_level_id);
      }

      // If user doesn't have a name set, use full_name
      if (body.full_name?.trim()) {
        const { data: currentUserData } = await supabase
          .from("users")
          .select("name, email")
          .eq("id", userData.id)
          .single();

        // Set name if it's empty or just the email address
        if (!currentUserData?.name || currentUserData.name.trim() === "" || currentUserData.name === currentUserData.email) {
          updateData.name = body.full_name.trim();
        }
      }

      // If school has auto_premium and user isn't already premium, grant premium
      if (school.auto_premium) {
        const currentPremiumUntil = userData.premium_until
          ? new Date(userData.premium_until)
          : null;
        const now = new Date();

        // Only grant if not already premium or extend existing premium
        if (!currentPremiumUntil || currentPremiumUntil < now) {
          const premiumUntil = new Date();
          premiumUntil.setDate(premiumUntil.getDate() + school.premium_duration_days);
          updateData.premium_until = premiumUntil.toISOString();
          updateData.role = "User"; // Ensure role is set properly
        }
      }

      // Update user
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", userData.id);

      if (updateError) {
        console.error("Error enrolling user:", updateError);
        return NextResponse.json(
          { error: "Failed to enroll in school" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Successfully enrolled in school",
        school_name: school.name,
        premium_granted: school.auto_premium,
      });
    }

    // If not authenticated, return the enrollment data for use after signup
    return NextResponse.json({
      success: true,
      enrollment_data: {
        school_id: body.school_id,
        school_level_id: body.school_level_id || null,
        teacher_id: body.teacher_id || null,
        full_name: body.full_name?.trim() || null,
      },
      school: {
        name: school.name,
        auto_premium: school.auto_premium,
      },
    });
  } catch (error) {
    console.error("Error in enrollment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/schools/enroll
 * Returns the current user's school enrollment status.
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

    // Get user with school info
    const { data: user, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        school_id,
        school_level_id,
        teacher_id,
        full_name,
        enrolled_at
      `)
      .eq("email", session.user.email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.school_id) {
      return NextResponse.json({
        enrolled: false,
      });
    }

    // Get school details
    const { data: school } = await supabase
      .from("schools")
      .select("id, name, slug, logo_url, primary_color")
      .eq("id", user.school_id)
      .single();

    // Get level details if set
    let level = null;
    if (user.school_level_id) {
      const { data: levelData } = await supabase
        .from("school_levels")
        .select("id, name, habitat_level")
        .eq("id", user.school_level_id)
        .single();
      level = levelData;
    }

    // Get teacher details if set
    let teacher = null;
    if (user.teacher_id) {
      const { data: teacherData } = await supabase
        .from("school_teachers")
        .select("id, name")
        .eq("id", user.teacher_id)
        .single();
      teacher = teacherData;
    }

    return NextResponse.json({
      enrolled: true,
      school,
      level,
      teacher,
      full_name: user.full_name,
      enrolled_at: user.enrolled_at,
    });
  } catch (error) {
    console.error("Error fetching enrollment status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
