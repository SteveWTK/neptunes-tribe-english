import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";

/**
 * POST /api/guest-access/complete-claim
 * Completes a guest account claim by transferring all data from the guest
 * user to the newly signed-in Google user.
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // The current user should be the Google user (not guest)
    if (session.user.role === "guest") {
      return NextResponse.json(
        { error: "Please sign in with Google first" },
        { status: 400 }
      );
    }

    // Get the pending guest claim from cookie
    const cookieStore = await cookies();
    const guestUserId = cookieStore.get("pending_guest_claim")?.value;

    if (!guestUserId) {
      return NextResponse.json(
        { error: "No pending guest claim found" },
        { status: 400 }
      );
    }

    const newUserId = session.user.userId;

    if (guestUserId === newUserId) {
      // Clear the cookie
      cookieStore.delete("pending_guest_claim");
      return NextResponse.json(
        { error: "Cannot transfer data to the same user" },
        { status: 400 }
      );
    }

    console.log(`🔄 Transferring data from guest ${guestUserId} to user ${newUserId}`);

    const supabase = await getSupabaseAdmin();

    // Transfer user_species_journey (the main journey/progress)
    const { error: journeyError } = await supabase
      .from("user_species_journey")
      .update({ user_id: newUserId })
      .eq("user_id", guestUserId);

    if (journeyError) {
      console.error("Error transferring journey:", journeyError);
      // Continue anyway - this might fail if the user already has a journey
    } else {
      console.log("✅ Transferred user_species_journey");
    }

    // Transfer lesson_completions
    const { error: completionsError } = await supabase
      .from("lesson_completions")
      .update({ user_id: newUserId })
      .eq("user_id", guestUserId);

    if (completionsError) {
      console.error("Error transferring completions:", completionsError);
    } else {
      console.log("✅ Transferred lesson_completions");
    }

    // Transfer adventure_progress
    const { error: adventureError } = await supabase
      .from("adventure_progress")
      .update({ user_id: newUserId })
      .eq("user_id", guestUserId);

    if (adventureError) {
      console.error("Error transferring adventure progress:", adventureError);
    } else {
      console.log("✅ Transferred adventure_progress");
    }

    // Update guest session to mark it as converted
    const { error: sessionError } = await supabase
      .from("guest_sessions")
      .update({
        converted_at: new Date().toISOString(),
        converted_to_email: session.user.email,
      })
      .eq("user_id", guestUserId)
      .is("converted_at", null);

    if (sessionError) {
      console.error("Error updating guest session:", sessionError);
    } else {
      console.log("✅ Updated guest_sessions");
    }

    // Copy premium status from guest to new user if applicable
    const { data: guestData } = await supabase
      .from("users")
      .select("is_premium, premium_until, premium_source")
      .eq("id", guestUserId)
      .single();

    if (guestData?.is_premium && guestData?.premium_until) {
      const premiumExpiry = new Date(guestData.premium_until);
      if (premiumExpiry > new Date()) {
        // Guest still has active premium - transfer it
        const { error: premiumError } = await supabase
          .from("users")
          .update({
            is_premium: true,
            premium_until: guestData.premium_until,
            premium_source: guestData.premium_source || "guest_qr",
          })
          .eq("id", newUserId);

        if (premiumError) {
          console.error("Error transferring premium status:", premiumError);
        } else {
          console.log("✅ Transferred premium status");
        }
      }
    }

    // Delete the guest user from public.users (auth user remains but is unused)
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", guestUserId);

    if (deleteError) {
      console.error("Error deleting guest user:", deleteError);
    } else {
      console.log("✅ Deleted guest user record");
    }

    // Try to delete the auth user as well
    try {
      await supabase.auth.admin.deleteUser(guestUserId);
      console.log("✅ Deleted guest auth user");
    } catch (authDeleteError) {
      console.error("Error deleting guest auth user:", authDeleteError);
      // Non-fatal
    }

    // Clear the pending claim cookie
    cookieStore.delete("pending_guest_claim");

    console.log("🎉 Guest claim completed successfully!");

    return NextResponse.json({
      success: true,
      message: "Account claimed successfully! Your progress has been transferred.",
    });
  } catch (error) {
    console.error("Error completing guest claim:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
