import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import { subDays, startOfDay, endOfDay, parseISO, format, eachDayOfInterval } from "date-fns";

/**
 * GET /api/admin/dashboard/users
 * Returns detailed user analytics for the admin dashboard.
 * Requires platform_admin role.
 *
 * Query params:
 *   - startDate: ISO date string (defaults to 30 days ago)
 *   - endDate: ISO date string (defaults to today)
 *   - userType: 'all' | 'guest' | 'registered' | 'premium' (defaults to all)
 */
export async function GET(request) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await getSupabaseAdmin();

    // Verify admin role
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("email", session.user.email)
      .single();

    if (userError || userData?.role !== "platform_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const endDate = searchParams.get("endDate")
      ? endOfDay(parseISO(searchParams.get("endDate")))
      : endOfDay(now);
    const startDate = searchParams.get("startDate")
      ? startOfDay(parseISO(searchParams.get("startDate")))
      : startOfDay(subDays(now, 30));
    const userType = searchParams.get("userType") || "all";

    // Build user query based on userType filter
    let usersQuery = supabase
      .from("users")
      .select("id, email, name, role, is_premium, created_at")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .order("created_at", { ascending: false });

    if (userType === "guest") {
      usersQuery = usersQuery.eq("role", "guest");
    } else if (userType === "registered") {
      usersQuery = usersQuery.neq("role", "guest").eq("is_premium", false);
    } else if (userType === "premium") {
      usersQuery = usersQuery.eq("is_premium", true).neq("role", "guest");
    } else {
      // 'all' - no additional filter
    }

    const { data: users, error: usersError } = await usersQuery;

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Get user type breakdown (all time)
    const [guestCount, registeredCount, premiumCount] = await Promise.all([
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "guest"),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .neq("role", "guest")
        .eq("is_premium", false),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_premium", true)
        .neq("role", "guest"),
    ]);

    // Generate daily user sign-up data for chart
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailySignups = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const count = users.filter((u) => {
        const userDay = format(new Date(u.created_at), "yyyy-MM-dd");
        return userDay === dayStr;
      }).length;
      return {
        date: dayStr,
        label: format(day, "MMM d"),
        users: count,
      };
    });

    // Get recent users with readable info (for data table)
    const recentUsers = users.slice(0, 50).map((user) => ({
      id: user.id,
      name: user.name || user.email?.split("@")[0] || "Unknown",
      email: user.email,
      type: user.role === "guest"
        ? "Guest"
        : user.is_premium
          ? "Premium"
          : "Registered",
      createdAt: user.created_at,
    }));

    // Fetch lesson completions per user for activity data
    const userIds = users.map((u) => u.id);
    let userActivity = [];

    if (userIds.length > 0) {
      const { data: completions } = await supabase
        .from("lesson_completions")
        .select("user_id")
        .in("user_id", userIds.slice(0, 100)); // Limit to first 100 users for performance

      // Count completions per user
      const completionCounts = {};
      completions?.forEach((c) => {
        completionCounts[c.user_id] = (completionCounts[c.user_id] || 0) + 1;
      });

      userActivity = recentUsers.map((user) => ({
        ...user,
        lessonsCompleted: completionCounts[user.id] || 0,
      }));
    }

    return NextResponse.json({
      users: userActivity.length > 0 ? userActivity : recentUsers,
      totalInPeriod: users.length,
      breakdown: {
        guest: guestCount.count || 0,
        registered: registeredCount.count || 0,
        premium: premiumCount.count || 0,
        total: (guestCount.count || 0) + (registeredCount.count || 0) + (premiumCount.count || 0),
      },
      dailySignups,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in dashboard users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
