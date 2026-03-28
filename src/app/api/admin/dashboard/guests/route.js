import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import { subDays, startOfDay, endOfDay, parseISO, format, eachDayOfInterval, differenceInHours } from "date-fns";

/**
 * Parse user agent string to extract device type and browser
 */
function parseUserAgent(userAgent) {
  const ua = userAgent?.toLowerCase() || "";

  // Device type
  let device = "desktop";
  if (/mobile|android|iphone|ipod/.test(ua)) {
    device = "mobile";
  } else if (/ipad|tablet/.test(ua)) {
    device = "tablet";
  }

  // Browser
  let browser = "Other";
  if (ua.includes("chrome") && !ua.includes("edg") && !ua.includes("opr")) {
    browser = "Chrome";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("opr") || ua.includes("opera")) {
    browser = "Opera";
  }

  return { device, browser };
}

/**
 * GET /api/admin/dashboard/guests
 * Returns guest analytics by campaign, device, and conversion.
 * Requires platform_admin role.
 *
 * Query params:
 *   - startDate: ISO date string (defaults to 30 days ago)
 *   - endDate: ISO date string (defaults to today)
 *   - campaignId: filter by specific campaign/QR code (optional)
 *   - deviceType: 'mobile' | 'desktop' | 'tablet' (optional)
 *   - conversionStatus: 'converted' | 'not_converted' | 'all' (optional)
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
    const campaignFilter = searchParams.get("campaignId");
    const deviceFilter = searchParams.get("deviceType");
    const conversionFilter = searchParams.get("conversionStatus") || "all";

    // Fetch all campaigns for dropdown and mapping
    const { data: campaigns, error: campaignsError } = await supabase
      .from("guest_access_codes")
      .select("id, name, campaign_name, campaign_location, current_uses, created_at")
      .order("campaign_name");

    if (campaignsError) {
      console.error("Error fetching campaigns:", campaignsError);
      return NextResponse.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      );
    }

    // Create campaigns lookup map
    const campaignsMap = new Map(campaigns.map((c) => [c.id, c]));

    // Fetch guest sessions
    let sessionsQuery = supabase
      .from("guest_sessions")
      .select("id, access_code_id, user_id, started_at, expires_at, converted_at, converted_to_email, device_info, ip_address")
      .gte("started_at", startDate.toISOString())
      .lte("started_at", endDate.toISOString());

    if (campaignFilter) {
      sessionsQuery = sessionsQuery.eq("access_code_id", campaignFilter);
    }

    if (conversionFilter === "converted") {
      sessionsQuery = sessionsQuery.not("converted_at", "is", null);
    } else if (conversionFilter === "not_converted") {
      sessionsQuery = sessionsQuery.is("converted_at", null);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError);
      return NextResponse.json(
        { error: "Failed to fetch guest sessions" },
        { status: 500 }
      );
    }

    // Parse device info and filter if needed
    let processedSessions = (sessions || []).map((s) => {
      const userAgent = s.device_info?.user_agent || "";
      const { device, browser } = parseUserAgent(userAgent);
      return {
        ...s,
        device,
        browser,
      };
    });

    if (deviceFilter) {
      processedSessions = processedSessions.filter((s) => s.device === deviceFilter);
    }

    // Calculate metrics by campaign
    const campaignMetrics = {};
    processedSessions.forEach((s) => {
      const campaignId = s.access_code_id;
      if (!campaignMetrics[campaignId]) {
        const campaign = campaignsMap.get(campaignId);
        campaignMetrics[campaignId] = {
          id: campaignId,
          name: campaign?.name || "Unknown",
          campaignName: campaign?.campaign_name || "Unknown",
          location: campaign?.campaign_location || "No location",
          totalGuests: 0,
          conversions: 0,
        };
      }
      campaignMetrics[campaignId].totalGuests++;
      if (s.converted_at) {
        campaignMetrics[campaignId].conversions++;
      }
    });

    const guestsByCampaign = Object.values(campaignMetrics)
      .map((c) => ({
        ...c,
        conversionRate: c.totalGuests > 0
          ? Math.round((c.conversions / c.totalGuests) * 100)
          : 0,
      }))
      .sort((a, b) => b.totalGuests - a.totalGuests);

    // Calculate device breakdown
    const deviceCounts = { mobile: 0, desktop: 0, tablet: 0 };
    processedSessions.forEach((s) => {
      deviceCounts[s.device]++;
    });
    const totalSessions = processedSessions.length;

    const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
      percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
    }));

    // Calculate browser breakdown
    const browserCounts = {};
    processedSessions.forEach((s) => {
      browserCounts[s.browser] = (browserCounts[s.browser] || 0) + 1;
    });

    const browserBreakdown = Object.entries(browserCounts)
      .map(([browser, count]) => ({
        browser,
        count,
        percentage: totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Conversion metrics
    const convertedSessions = processedSessions.filter((s) => s.converted_at);
    const conversionRate = totalSessions > 0
      ? Math.round((convertedSessions.length / totalSessions) * 100)
      : 0;

    // Calculate average time to convert
    let avgTimeToConvert = null;
    if (convertedSessions.length > 0) {
      const totalHours = convertedSessions.reduce((sum, s) => {
        const hours = differenceInHours(new Date(s.converted_at), new Date(s.started_at));
        return sum + hours;
      }, 0);
      const avgHours = totalHours / convertedSessions.length;
      avgTimeToConvert = avgHours < 24
        ? `${Math.round(avgHours)} hours`
        : `${Math.round(avgHours / 24)} days`;
    }

    // Daily sessions for chart
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailySessions = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const daySessions = processedSessions.filter((s) => {
        const sessionDay = format(new Date(s.started_at), "yyyy-MM-dd");
        return sessionDay === dayStr;
      });
      const dayConversions = daySessions.filter((s) => s.converted_at).length;

      return {
        date: dayStr,
        label: format(day, "MMM d"),
        sessions: daySessions.length,
        conversions: dayConversions,
      };
    });

    // Recent sessions for data table
    const recentSessions = processedSessions
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 50)
      .map((s) => {
        const campaign = campaignsMap.get(s.access_code_id);
        return {
          id: s.id,
          campaign: campaign?.name || "Unknown",
          location: campaign?.campaign_location || "No location",
          device: s.device,
          browser: s.browser,
          startedAt: s.started_at,
          converted: !!s.converted_at,
          convertedAt: s.converted_at,
          convertedEmail: s.converted_to_email,
        };
      });

    // Get guest user IDs from sessions in this period
    const guestUserIds = processedSessions.map(s => s.user_id).filter(Boolean);

    // Count guests who completed at least one lesson
    let guestsWithFirstLesson = 0;
    if (guestUserIds.length > 0) {
      // Get unique users who have lesson completions
      const { data: completions, error: completionsError } = await supabase
        .from("lesson_completions")
        .select("user_id")
        .in("user_id", guestUserIds);

      if (!completionsError && completions) {
        // Count unique users with completions
        const uniqueUsersWithCompletions = new Set(completions.map(c => c.user_id));
        guestsWithFirstLesson = uniqueUsersWithCompletions.size;
      }
    }

    // Campaign filter options with human-readable labels
    const campaignOptions = campaigns.map((c) => ({
      value: c.id,
      label: `${c.name} - ${c.campaign_location || "No location"} (${c.current_uses} uses)`,
    }));

    return NextResponse.json({
      overview: {
        totalSessions,
        convertedSessions: convertedSessions.length,
        conversionRate,
        avgTimeToConvert,
        uniqueCampaigns: Object.keys(campaignMetrics).length,
        guestsWithFirstLesson,
        firstLessonRate: totalSessions > 0
          ? Math.round((guestsWithFirstLesson / totalSessions) * 100)
          : 0,
      },
      guestsByCampaign,
      deviceBreakdown,
      browserBreakdown,
      dailySessions,
      recentSessions,
      filterOptions: {
        campaigns: campaignOptions,
        devices: [
          { value: "mobile", label: "Mobile" },
          { value: "desktop", label: "Desktop" },
          { value: "tablet", label: "Tablet" },
        ],
        conversionStatus: [
          { value: "all", label: "All" },
          { value: "converted", label: "Converted" },
          { value: "not_converted", label: "Not Converted" },
        ],
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in dashboard guests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
