import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * POST /api/guest-access/prepare-claim
 * Prepares a guest account for claiming by storing the guest user ID in a cookie.
 * This is called before Google OAuth so we can transfer data after sign-in.
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

    if (session.user.role !== "guest") {
      return NextResponse.json(
        { error: "Only guest users can claim accounts" },
        { status: 403 }
      );
    }

    const guestUserId = session.user.userId;

    if (!guestUserId) {
      return NextResponse.json(
        { error: "Guest user ID not found" },
        { status: 400 }
      );
    }

    // Store the guest user ID in a cookie that expires in 10 minutes
    const cookieStore = await cookies();
    cookieStore.set("pending_guest_claim", guestUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    console.log("🎫 Prepared guest claim for user:", guestUserId);

    return NextResponse.json({
      success: true,
      message: "Guest claim prepared",
    });
  } catch (error) {
    console.error("Error preparing guest claim:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
