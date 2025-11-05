import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = session.user.userId || session.user.id;

    // Check if user has completed onboarding
    const { data, error } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error checking onboarding status:", error);
      return NextResponse.json({ completed: false });
    }

    return NextResponse.json({ completed: data?.onboarding_completed || false });
  } catch (error) {
    console.error("Error in onboarding status API:", error);
    return NextResponse.json({ completed: false });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { completed } = await request.json();
    const supabase = await createClient();
    const userId = session.user.userId || session.user.id;

    // Update onboarding status
    const { error } = await supabase
      .from("users")
      .update({ onboarding_completed: completed })
      .eq("id", userId);

    if (error) {
      console.error("Error updating onboarding status:", error);
      return NextResponse.json(
        { error: "Failed to update onboarding status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in onboarding status update:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
