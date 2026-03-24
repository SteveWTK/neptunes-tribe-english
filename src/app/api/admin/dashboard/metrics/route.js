import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import { subDays, startOfDay, endOfDay, parseISO } from "date-fns";

/**
 * GET /api/admin/dashboard/metrics
 * Returns aggregated overview stats for the admin dashboard.
 * Requires platform_admin role.
 *
 * Query params:
 *   - startDate: ISO date string (defaults to 30 days ago)
 *   - endDate: ISO date string (defaults to today)
 *   - compareMode: 'previous_period' | 'same_period_last_year' (defaults to previous_period)
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
    const compareMode = searchParams.get("compareMode") || "previous_period";

    // Calculate comparison period
    const periodDuration = endDate.getTime() - startDate.getTime();
    let compareStartDate, compareEndDate;

    if (compareMode === "same_period_last_year") {
      compareStartDate = new Date(startDate);
      compareStartDate.setFullYear(compareStartDate.getFullYear() - 1);
      compareEndDate = new Date(endDate);
      compareEndDate.setFullYear(compareEndDate.getFullYear() - 1);
    } else {
      // previous_period
      compareEndDate = new Date(startDate.getTime() - 1);
      compareStartDate = new Date(compareEndDate.getTime() - periodDuration);
    }

    // Fetch all metrics in parallel
    const [
      // Current period metrics
      totalUsersResult,
      newUsersResult,
      premiumUsersResult,
      newPremiumResult,
      lessonCompletionsResult,
      guestSessionsResult,
      guestConversionsResult,
      activeJourneysResult,
      // Comparison period metrics
      prevNewUsersResult,
      prevNewPremiumResult,
      prevLessonCompletionsResult,
      prevGuestSessionsResult,
      prevGuestConversionsResult,
    ] = await Promise.all([
      // Total users (all time, excluding guests)
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .neq("role", "guest"),

      // New users in period (excluding guests)
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .neq("role", "guest")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()),

      // Total premium users
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_premium", true)
        .neq("role", "guest"),

      // Premium upgrades in period (from premium_upgrades audit table)
      supabase
        .from("premium_upgrades")
        .select("*", { count: "exact", head: true })
        .gte("upgraded_at", startDate.toISOString())
        .lte("upgraded_at", endDate.toISOString()),

      // Lesson completions in period
      supabase
        .from("lesson_completions")
        .select("*", { count: "exact", head: true })
        .gte("completed_at", startDate.toISOString())
        .lte("completed_at", endDate.toISOString()),

      // Guest sessions in period
      supabase
        .from("guest_sessions")
        .select("*", { count: "exact", head: true })
        .gte("started_at", startDate.toISOString())
        .lte("started_at", endDate.toISOString()),

      // Guest conversions in period
      supabase
        .from("guest_sessions")
        .select("*", { count: "exact", head: true })
        .not("converted_at", "is", null)
        .gte("converted_at", startDate.toISOString())
        .lte("converted_at", endDate.toISOString()),

      // Active species journeys
      supabase
        .from("user_species_journey")
        .select("*", { count: "exact", head: true }),

      // COMPARISON PERIOD
      // New users in previous period
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .neq("role", "guest")
        .gte("created_at", compareStartDate.toISOString())
        .lte("created_at", compareEndDate.toISOString()),

      // Premium upgrades in previous period
      supabase
        .from("premium_upgrades")
        .select("*", { count: "exact", head: true })
        .gte("upgraded_at", compareStartDate.toISOString())
        .lte("upgraded_at", compareEndDate.toISOString()),

      // Lesson completions in previous period
      supabase
        .from("lesson_completions")
        .select("*", { count: "exact", head: true })
        .gte("completed_at", compareStartDate.toISOString())
        .lte("completed_at", compareEndDate.toISOString()),

      // Guest sessions in previous period
      supabase
        .from("guest_sessions")
        .select("*", { count: "exact", head: true })
        .gte("started_at", compareStartDate.toISOString())
        .lte("started_at", compareEndDate.toISOString()),

      // Guest conversions in previous period
      supabase
        .from("guest_sessions")
        .select("*", { count: "exact", head: true })
        .not("converted_at", "is", null)
        .gte("converted_at", compareStartDate.toISOString())
        .lte("converted_at", compareEndDate.toISOString()),
    ]);

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const newUsers = newUsersResult.count || 0;
    const prevNewUsers = prevNewUsersResult.count || 0;
    const newPremium = newPremiumResult.count || 0;
    const prevNewPremium = prevNewPremiumResult.count || 0;
    const lessonCompletions = lessonCompletionsResult.count || 0;
    const prevLessonCompletions = prevLessonCompletionsResult.count || 0;
    const guestSessions = guestSessionsResult.count || 0;
    const prevGuestSessions = prevGuestSessionsResult.count || 0;
    const guestConversions = guestConversionsResult.count || 0;
    const prevGuestConversions = prevGuestConversionsResult.count || 0;

    // Calculate conversion rate
    const conversionRate = guestSessions > 0
      ? Math.round((guestConversions / guestSessions) * 100)
      : 0;
    const prevConversionRate = prevGuestSessions > 0
      ? Math.round((prevGuestConversions / prevGuestSessions) * 100)
      : 0;

    return NextResponse.json({
      metrics: {
        totalUsers: {
          value: totalUsersResult.count || 0,
          label: "Total Users",
        },
        newUsers: {
          value: newUsers,
          change: calculateChange(newUsers, prevNewUsers),
          label: "New Users",
        },
        premiumUsers: {
          value: premiumUsersResult.count || 0,
          label: "Premium Users",
        },
        premiumUpgrades: {
          value: newPremium,
          change: calculateChange(newPremium, prevNewPremium),
          label: "Premium Upgrades",
        },
        lessonCompletions: {
          value: lessonCompletions,
          change: calculateChange(lessonCompletions, prevLessonCompletions),
          label: "Lessons Completed",
        },
        guestSessions: {
          value: guestSessions,
          change: calculateChange(guestSessions, prevGuestSessions),
          label: "Guest Sessions",
        },
        guestConversions: {
          value: guestConversions,
          change: calculateChange(guestConversions, prevGuestConversions),
          label: "Guest Conversions",
        },
        conversionRate: {
          value: conversionRate,
          change: conversionRate - prevConversionRate,
          label: "Conversion Rate",
          suffix: "%",
        },
        activeJourneys: {
          value: activeJourneysResult.count || 0,
          label: "Active Journeys",
        },
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        compareStart: compareStartDate.toISOString(),
        compareEnd: compareEndDate.toISOString(),
        compareMode,
      },
    });
  } catch (error) {
    console.error("Error in dashboard metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
