import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

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

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, role, stripe_subscription_status")
      .eq("email", session.user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      feedbackType, // 'quick' or 'detailed'

      // Quick feedback
      quickComment,
      overallRating,

      // Detailed feedback ratings
      contentQualityRating,
      contentQualityComment,
      easeOfUseRating,
      easeOfUseComment,
      learningEffectivenessRating,
      learningEffectivenessComment,
      technicalPerformanceRating,
      technicalPerformanceComment,

      // Open-ended
      whatEnjoyed,
      whatImproved,
      featureRequests,
      generalComments,

      // Context
      currentPage,
      currentLessonId,
      deviceType,
      browser,
      screenSize,
    } = body;

    // Determine user role for display
    const isBetaTester = userData.role === "beta_tester";
    const isPremium =
      userData.stripe_subscription_status === "active" ||
      userData.stripe_subscription_status === "trialing";

    let userRole = "user";
    if (isBetaTester) {
      userRole = "beta_tester";
    } else if (isPremium) {
      userRole = "premium";
    }

    // Insert feedback
    const { data: feedback, error: insertError } = await supabase
      .from("feedback")
      .insert({
        user_id: userData.id,
        user_email: session.user.email,
        user_role: userRole,
        is_beta_tester: isBetaTester,

        feedback_type: feedbackType || "quick",

        // Quick feedback
        quick_comment: quickComment,
        overall_rating: overallRating,

        // Detailed ratings
        content_quality_rating: contentQualityRating,
        content_quality_comment: contentQualityComment,
        ease_of_use_rating: easeOfUseRating,
        ease_of_use_comment: easeOfUseComment,
        learning_effectiveness_rating: learningEffectivenessRating,
        learning_effectiveness_comment: learningEffectivenessComment,
        technical_performance_rating: technicalPerformanceRating,
        technical_performance_comment: technicalPerformanceComment,

        // Open-ended
        what_enjoyed: whatEnjoyed,
        what_improved: whatImproved,
        feature_requests: featureRequests,
        general_comments: generalComments,

        // Context
        current_page: currentPage,
        current_lesson_id: currentLessonId,
        device_type: deviceType,
        browser: browser,
        screen_size: screenSize,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting feedback:", insertError);
      return NextResponse.json(
        { error: "Failed to submit feedback" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      feedback,
      message: "Thank you for your feedback!",
    });
  } catch (error) {
    console.error("Error in feedback submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
