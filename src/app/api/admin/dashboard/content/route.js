import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import { subDays, startOfDay, endOfDay, parseISO, format, eachDayOfInterval } from "date-fns";

/**
 * GET /api/admin/dashboard/content
 * Returns content performance analytics (lessons, adventures).
 * Requires platform_admin role.
 *
 * Query params:
 *   - startDate: ISO date string (defaults to 30 days ago)
 *   - endDate: ISO date string (defaults to today)
 *   - worldId: filter by world (optional)
 *   - adventureId: filter by adventure (optional)
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
    const worldFilter = searchParams.get("worldId");
    const adventureFilter = searchParams.get("adventureId");

    // Fetch all lessons with their details
    const { data: allLessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("id, title, world, theme_tags, difficulty, xp_reward, is_active, is_premium")
      .order("title");

    if (lessonsError) {
      console.error("Error fetching lessons:", lessonsError);
      return NextResponse.json(
        { error: "Failed to fetch lessons" },
        { status: 500 }
      );
    }

    // Build lesson completions query
    let completionsQuery = supabase
      .from("lesson_completions")
      .select("lesson_id, adventure_id, xp_earned, completed_at")
      .gte("completed_at", startDate.toISOString())
      .lte("completed_at", endDate.toISOString());

    if (adventureFilter) {
      completionsQuery = completionsQuery.eq("adventure_id", adventureFilter);
    }

    const { data: completions, error: completionsError } = await completionsQuery;

    if (completionsError) {
      console.error("Error fetching completions:", completionsError);
      return NextResponse.json(
        { error: "Failed to fetch completions" },
        { status: 500 }
      );
    }

    // Create lessons lookup map
    const lessonsMap = new Map(allLessons.map((l) => [l.id, l]));

    // Filter completions by world if specified
    let filteredCompletions = completions || [];
    if (worldFilter) {
      filteredCompletions = filteredCompletions.filter((c) => {
        const lesson = lessonsMap.get(c.lesson_id);
        return lesson?.world === worldFilter;
      });
    }

    // Calculate lesson completion counts
    const lessonCompletionCounts = {};
    const adventureCompletionCounts = {};
    const worldCompletionCounts = {};
    let totalXPEarned = 0;

    filteredCompletions.forEach((c) => {
      // Count by lesson
      lessonCompletionCounts[c.lesson_id] = (lessonCompletionCounts[c.lesson_id] || 0) + 1;

      // Count by adventure (theme_tags)
      if (c.adventure_id) {
        adventureCompletionCounts[c.adventure_id] = (adventureCompletionCounts[c.adventure_id] || 0) + 1;
      }

      // Count by world
      const lesson = lessonsMap.get(c.lesson_id);
      if (lesson?.world) {
        worldCompletionCounts[lesson.world] = (worldCompletionCounts[lesson.world] || 0) + 1;
      }

      // Total XP
      totalXPEarned += c.xp_earned || 0;
    });

    // Get top 10 lessons by completions with human-readable names
    const topLessons = Object.entries(lessonCompletionCounts)
      .map(([lessonId, count]) => {
        const lesson = lessonsMap.get(lessonId);
        return {
          id: lessonId,
          title: lesson?.title || "Unknown Lesson",
          world: lesson?.world || "Unknown",
          adventure: lesson?.theme_tags || "Unknown",
          completions: count,
          isPremium: lesson?.is_premium || false,
        };
      })
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 10);

    // Get completions by world with human-readable names
    const completionsByWorld = Object.entries(worldCompletionCounts)
      .map(([world, count]) => ({
        world,
        completions: count,
      }))
      .sort((a, b) => b.completions - a.completions);

    // Get unique worlds and adventures for filter options
    const uniqueWorlds = [...new Set(allLessons.map((l) => l.world).filter(Boolean))].sort();
    const uniqueAdventures = [...new Set(allLessons.map((l) => l.theme_tags).filter(Boolean))].sort();

    // Generate daily completion data for chart
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const dailyCompletions = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const count = filteredCompletions.filter((c) => {
        const completionDay = format(new Date(c.completed_at), "yyyy-MM-dd");
        return completionDay === dayStr;
      }).length;
      return {
        date: dayStr,
        label: format(day, "MMM d"),
        completions: count,
      };
    });

    // Lesson status summary
    const activeLessons = allLessons.filter((l) => l.is_active).length;
    const premiumLessons = allLessons.filter((l) => l.is_premium).length;

    return NextResponse.json({
      overview: {
        totalLessons: allLessons.length,
        activeLessons,
        premiumLessons,
        completionsInPeriod: filteredCompletions.length,
        totalXPEarned,
        uniqueUsersCompleting: new Set(filteredCompletions.map((c) => c.user_id)).size,
      },
      topLessons,
      completionsByWorld,
      dailyCompletions,
      filterOptions: {
        worlds: uniqueWorlds.map((w) => ({ value: w, label: w })),
        adventures: uniqueAdventures.map((a) => ({ value: a, label: a })),
      },
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in dashboard content:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
