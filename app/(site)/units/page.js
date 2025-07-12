import {
  fetchFeaturedUnits,
  fetchUnitDetails,
  fetchSingleGapChallenges,
} from "@/lib/data-service";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import { auth } from "@/lib/auth";
import SiteHomeClient from "./SiteHomeClient";

export default async function SiteHomePage(props) {
  const session = await auth();
  const supabase = getSupabaseAdmin();

  // Extract filter parameters - await searchParams for Next.js 15
  const searchParams = await props.searchParams;
  const regionFilter = searchParams?.region;
  const marineZoneFilter = searchParams?.marine_zone;

  let units;
  let isFiltered = false;

  try {
    if (regionFilter || marineZoneFilter) {
      // Fetch filtered units
      isFiltered = true;

      // Build the query based on filters
      let query = supabase
        .from("units")
        .select("*")
        .eq("featured", true) // Keep only featured units, or remove this line to show all units
        .order("rank", { ascending: true });

      // Apply filters
      if (regionFilter) {
        // Handle both single region codes and arrays
        // For arrays like ["BR", "PE"], we need to check if the region_code contains the filter
        query = query.or(
          `region_code.eq.${regionFilter},region_code.like.%"${regionFilter}"%`
        );
      }

      if (marineZoneFilter) {
        const decodedMarineZone = decodeURIComponent(marineZoneFilter);
        // Handle both single marine zones and arrays
        query = query.or(
          `marine_zone.eq.${decodedMarineZone},marine_zone.like.%"${decodedMarineZone}"%`
        );
      }

      const { data: filteredUnits, error } = await query;

      if (error) {
        console.error("Error fetching filtered units:", error);
        // Fallback to featured units if filtering fails
        units = await fetchFeaturedUnits();
        isFiltered = false;
      } else {
        units = filteredUnits || [];
      }
    } else {
      // Use existing featured units logic
      units = await fetchFeaturedUnits();
    }

    // Fetch unit details for all units
    const unitDetails = await Promise.all(
      units.map((unit) => fetchUnitDetails(unit.id))
    );

    const featuredUnits = units.map((unit, index) => ({
      ...unit,
      ...unitDetails[index],
    }));

    // Get user's completed units if logged in
    let completedUnitIds = [];
    if (session?.user?.email) {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

      if (userData) {
        const { data: completedData } = await supabase
          .from("completed_units")
          .select("unit_id")
          .eq("user_id", userData.id);

        completedUnitIds = completedData?.map((item) => item.unit_id) || [];
      }
    }

    const challenges = await fetchSingleGapChallenges("default");

    return (
      <SiteHomeClient
        featuredUnits={featuredUnits}
        challenges={challenges}
        completedUnitIds={completedUnitIds}
        filterInfo={{
          isFiltered,
          regionFilter,
          marineZoneFilter,
        }}
      />
    );
  } catch (error) {
    console.error("Unexpected error in SiteHomePage:", error);

    // Fallback to default behavior
    const units = await fetchFeaturedUnits();
    const unitDetails = await Promise.all(
      units.map((unit) => fetchUnitDetails(unit.id))
    );

    const featuredUnits = units.map((unit, index) => ({
      ...unit,
      ...unitDetails[index],
    }));

    const challenges = await fetchSingleGapChallenges("default");

    return (
      <SiteHomeClient
        featuredUnits={featuredUnits}
        challenges={challenges}
        completedUnitIds={[]}
        filterInfo={{
          isFiltered: false,
          regionFilter: null,
          marineZoneFilter: null,
        }}
      />
    );
  }
}
