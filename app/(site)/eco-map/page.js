import { getServerSession } from "next-auth";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import EcoMapProgress from "@/app/components/EcoMapProgress";
import Link from "next/link";

export default async function EcoMapPage() {
  const session = await auth();
  const firstName = session?.user?.name
    ? session.user.name.split(" ").at(0)
    : "Eco-Warrior!";

  if (!session || !session.user?.email) {
    return (
      <div className="pt-4">
        <p className="font-josefin text-lg text-center my-4">
          Please log in to view your progress.
        </p>
      </div>
    );
  }

  const email = session.user.email;
  const supabase = getSupabaseAdmin();

  try {
    // Fetch user from Supabase users table (linked to NextAuth email)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      console.error("Error finding Supabase user by email:", userError);
      return (
        <div className="pt-4">
          <p className="font-josefin text-lg text-center my-4">
            Could not load user progress. Please try refreshing the page.
          </p>
        </div>
      );
    }

    // Fetch completed units with proper join
    const { data: completedData, error: completedError } = await supabase
      .from("completed_units")
      .select(
        `
        unit_id,
        units!inner(
          id,
          title,
          region_code,
          region_name
        )
      `
      )
      .eq("user_id", userData.id);

    if (completedError) {
      console.error("Error fetching completed units:", completedError);
      return (
        <div className="pt-4">
          <p className="font-josefin text-lg text-center my-4">
            Failed to load your eco-map progress. Please try again.
          </p>
        </div>
      );
    }

    // Process the data for the map component
    const completedUnitsByCountry = {};
    const highlightedRegions = new Set();

    if (completedData && completedData.length > 0) {
      completedData.forEach((entry) => {
        const unitData = entry.units;
        const regionCode = unitData?.region_code?.toUpperCase();

        if (!regionCode) {
          console.warn("Unit missing region_code:", unitData);
          return;
        }

        // Use Alpha-2 codes as keys (will be converted in component)
        if (!completedUnitsByCountry[regionCode]) {
          completedUnitsByCountry[regionCode] = [];
        }

        completedUnitsByCountry[regionCode].push(unitData.title);
        highlightedRegions.add(regionCode);
      });
    }

    const completedUnitsCount = completedData?.length || 0;

    // FIXED: Fetch user progress data correctly
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select(
        "total_points, current_level, streak_days, highest_streak, completed_exercises"
      )
      .eq("user_id", userData.id)
      .single(); // Use .single() since user_id is unique

    if (progressError) {
      console.error("Error fetching user progress:", progressError);
      return (
        <div className="pt-4">
          <p className="font-josefin text-lg text-center my-4">
            Failed to load your XP points. Please try again.
          </p>
        </div>
      );
    }

    // FIXED: Access the data correctly
    const totalPoints = progressData?.total_points || 0;
    const currentLevel = progressData?.current_level || 1;
    const streakDays = progressData?.streak_days || 0;
    const highestStreak = progressData?.highest_streak || 0;
    const completedExercises = progressData?.completed_exercises || 0;

    return (
      <div className="pt-4">
        <div className="text-center mb-6">
          <h1 className="text-xl lg:text-2xl text-[#10b981] dark:text-[#e5e7eb] font-bold mb-2">
            Welcome to your virtual eco-journey around the world, {firstName}!
          </h1>
          <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
            You have completed {completedUnitsCount} unit
            {completedUnitsCount !== 1 ? "s" : ""} across{" "}
            {highlightedRegions.size} region
            {highlightedRegions.size !== 1 ? "s" : ""}
          </p>

          {/* ENHANCED: Better progress display */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4 lg:mx-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#10b981]">
                  {totalPoints}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  XP Points
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#10b981]">
                  {currentLevel}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Level
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#10b981]">
                  {streakDays}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Streak
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#10b981]">
                  {highestStreak}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Best Streak
                </p>
              </div>
            </div>
          </div>
        </div>

        <EcoMapProgress
          highlightedRegions={[...highlightedRegions]}
          completedUnitsByCountry={completedUnitsByCountry}
        />

        {completedUnitsCount !== 0 && (
          <div className="text-center mt-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Complete another unit to see more countries light up on your
              eco-map!
            </p>
            <Link
              href="/units"
              className="inline-block bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
            >
              Continue Learning
            </Link>
          </div>
        )}

        {completedUnitsCount === 0 && (
          <div className="text-center mt-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Complete your first unit to see countries light up on your
              eco-map!
            </p>
            <Link
              href="/units"
              className="inline-block bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
            >
              Start Learning
            </Link>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Unexpected error in EcoMapPage:", error);
    return (
      <div className="pt-4">
        <p className="font-josefin text-lg text-center my-4 text-red-600">
          An unexpected error occurred. Please try again later.
        </p>
      </div>
    );
  }
}
