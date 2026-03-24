import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import { subDays, startOfDay, endOfDay, parseISO, format, eachDayOfInterval } from "date-fns";

/**
 * GET /api/admin/dashboard/premium
 * Returns detailed premium upgrade analytics.
 * Requires platform_admin role.
 *
 * Query params:
 *   - startDate: ISO date string (defaults to 30 days ago)
 *   - endDate: ISO date string (defaults to today)
 *   - source: filter by upgrade source (optional)
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
    const sourceFilter = searchParams.get("source");

    // Build query
    let upgradesQuery = supabase
      .from("premium_upgrades")
      .select(`
        id,
        user_id,
        upgrade_type,
        source,
        plan_type,
        previous_state,
        was_qr_guest,
        qr_campaign_id,
        upgraded_at
      `)
      .gte("upgraded_at", startDate.toISOString())
      .lte("upgraded_at", endDate.toISOString())
      .order("upgraded_at", { ascending: false });

    if (sourceFilter) {
      upgradesQuery = upgradesQuery.eq("source", sourceFilter);
    }

    const { data: upgrades, error: upgradesError } = await upgradesQuery;

    if (upgradesError) {
      console.error("Error fetching premium upgrades:", upgradesError);
      return NextResponse.json(
        { error: "Failed to fetch premium upgrades" },
        { status: 500 }
      );
    }

    // Get user details for the upgrades
    const userIds = [...new Set(upgrades.map((u) => u.user_id))];
    let usersMap = new Map();

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, email, name")
        .in("id", userIds);

      users?.forEach((u) => {
        usersMap.set(u.id, u);
      });
    }

    // Get campaign details for QR upgrades
    const campaignIds = [...new Set(upgrades.filter((u) => u.qr_campaign_id).map((u) => u.qr_campaign_id))];
    let campaignsMap = new Map();

    if (campaignIds.length > 0) {
      const { data: campaigns } = await supabase
        .from("guest_access_codes")
        .select("id, name, campaign_name, campaign_location")
        .in("id", campaignIds);

      campaigns?.forEach((c) => {
        campaignsMap.set(c.id, c);
      });
    }

    // Calculate metrics by source
    const sourceMetrics = {};
    const previousStateMetrics = {};
    const planTypeMetrics = {};
    let qrGuestUpgrades = 0;

    upgrades.forEach((u) => {
      // By source
      sourceMetrics[u.source] = (sourceMetrics[u.source] || 0) + 1;

      // By previous state (funnel)
      previousStateMetrics[u.previous_state] = (previousStateMetrics[u.previous_state] || 0) + 1;

      // By plan type
      planTypeMetrics[u.plan_type] = (planTypeMetrics[u.plan_type] || 0) + 1;

      // QR guest upgrades
      if (u.was_qr_guest) qrGuestUpgrades++;
    });

    // Convert to arrays for charts
    const upgradesBySource = Object.entries(sourceMetrics)
      .map(([source, count]) => ({
        source: formatSourceLabel(source),
        sourceKey: source,
        count,
        percentage: upgrades.length > 0 ? Math.round((count / upgrades.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const upgradesByPreviousState = Object.entries(previousStateMetrics)
      .map(([state, count]) => ({
        state: formatStateLabel(state),
        stateKey: state,
        count,
        percentage: upgrades.length > 0 ? Math.round((count / upgrades.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Daily upgrades for chart
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyUpgrades = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const count = upgrades.filter((u) => {
        const upgradeDay = format(new Date(u.upgraded_at), "yyyy-MM-dd");
        return upgradeDay === dayStr;
      }).length;
      return {
        date: dayStr,
        label: format(day, "MMM d"),
        upgrades: count,
      };
    });

    // Recent upgrades with human-readable data
    const recentUpgrades = upgrades.slice(0, 50).map((u) => {
      const user = usersMap.get(u.user_id);
      const campaign = u.qr_campaign_id ? campaignsMap.get(u.qr_campaign_id) : null;

      return {
        id: u.id,
        userName: user?.name || user?.email?.split("@")[0] || "Unknown",
        userEmail: user?.email,
        source: formatSourceLabel(u.source),
        sourceKey: u.source,
        planType: u.plan_type,
        previousState: formatStateLabel(u.previous_state),
        wasQrGuest: u.was_qr_guest,
        campaignName: campaign?.name || null,
        campaignLocation: campaign?.campaign_location || null,
        upgradedAt: u.upgraded_at,
      };
    });

    // Filter options
    const sourceOptions = [
      { value: "subscription_page", label: "Subscription Page" },
      { value: "premium_lesson_modal", label: "Premium Lesson Modal" },
      { value: "species_companion_cta", label: "Species Companion CTA" },
      { value: "guest_conversion", label: "Guest Conversion" },
      { value: "qr_campaign", label: "QR Campaign" },
      { value: "marketing_email", label: "Marketing Email" },
      { value: "referral", label: "Referral" },
      { value: "admin_grant", label: "Admin Grant" },
      { value: "unknown", label: "Unknown" },
    ];

    return NextResponse.json({
      overview: {
        totalUpgrades: upgrades.length,
        qrGuestUpgrades,
        qrGuestPercentage: upgrades.length > 0 ? Math.round((qrGuestUpgrades / upgrades.length) * 100) : 0,
      },
      upgradesBySource,
      upgradesByPreviousState,
      dailyUpgrades,
      recentUpgrades,
      filterOptions: {
        sources: sourceOptions,
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in dashboard premium:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Format source key to human-readable label
 */
function formatSourceLabel(source) {
  const labels = {
    unknown: "Unknown",
    subscription_page: "Subscription Page",
    premium_lesson_modal: "Premium Lesson Modal",
    species_companion_cta: "Species Companion CTA",
    guest_conversion: "Guest Conversion",
    qr_campaign: "QR Campaign",
    marketing_email: "Marketing Email",
    referral: "Referral",
    admin_grant: "Admin Grant",
  };
  return labels[source] || source;
}

/**
 * Format previous state to human-readable label
 */
function formatStateLabel(state) {
  const labels = {
    guest: "From Guest",
    registered: "From Registered",
    expired_premium: "Reactivation",
  };
  return labels[state] || state;
}
