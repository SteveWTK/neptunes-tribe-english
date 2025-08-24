// app/(site)/units/page.js - Enhanced with Premium Filtering and Sorting
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
  const ecosystemFilter = searchParams?.ecosystem;

  // New filtering parameters
  const sortBy = searchParams?.sort || "rank"; // rank, length, newest
  const sortOrder = searchParams?.order || "asc";
  const showCompleted = searchParams?.completed === "true";
  const showOnlyIncomplete = searchParams?.incomplete === "true";

  // Check if user is premium
  const isPremiumUser = session?.user?.is_premium || false;
  const isLoggedIn = !!session?.user?.email;

  let units;
  let isFiltered = false;
  let completedUnitIds = [];

  try {
    // Get user's completed units if logged in
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

    if (regionFilter || marineZoneFilter || ecosystemFilter) {
      // Fetch filtered units with enhanced logic
      isFiltered = true;

      // Build the query based on filters
      let query = supabase.from("units").select("*").eq("featured", true);

      // Premium filtering
      if (!isPremiumUser) {
        query = query.eq("is_premium", false);
      }

      // Apply region/ecosystem filters
      if (regionFilter) {
        query = query.or(
          `region_code.eq.${regionFilter},region_code.like.%"${regionFilter}"%`
        );
      }

      if (marineZoneFilter) {
        const decodedMarineZone = decodeURIComponent(marineZoneFilter);
        query = query.or(
          `marine_zone.eq.${decodedMarineZone},marine_zone.like.%"${decodedMarineZone}"%`
        );
      }

      if (
        ecosystemFilter &&
        ecosystemFilter !== "all" &&
        ecosystemFilter !== "undefined"
      ) {
        if (ecosystemFilter === "marine") {
          query = query.or(
            `primary_ecosystem.eq.marine,ecosystem_type.eq.marine,marine_zone.not.is.null`
          );
        } else {
          query = query.or(
            `primary_ecosystem.eq.${ecosystemFilter},ecosystem_type.eq.${ecosystemFilter}`
          );
        }
      }

      // Apply sorting
      switch (sortBy) {
        case "length":
          query = query.order("length", { ascending: sortOrder === "asc" });
          break;
        case "newest":
          query = query.order("id", { ascending: sortOrder === "asc" });
          break;
        default:
          query = query.order("rank", { ascending: sortOrder === "asc" });
      }

      const { data: filteredUnits, error } = await query;

      if (error) {
        console.error("Error fetching filtered units:", error);
        // Fallback to featured units
        units = await fetchFeaturedUnits({
          isPremiumUser,
          sortBy,
          sortOrder,
          userCompletedIds: completedUnitIds,
        });
        isFiltered = false;
      } else {
        units = filteredUnits || [];
      }
    } else {
      // Use enhanced fetchFeaturedUnits with filtering options
      units = await fetchFeaturedUnits({
        isPremiumUser,
        sortBy,
        sortOrder,
        showCompletedOnly: showCompleted,
        userCompletedIds: completedUnitIds,
      });
    }

    // Apply completion filtering client-side if needed
    if (showOnlyIncomplete && completedUnitIds.length > 0) {
      units = units.filter((unit) => !completedUnitIds.includes(unit.id));
    }

    // Fetch unit details for all units
    const unitDetails = await Promise.all(
      units.map((unit) => fetchUnitDetails(unit.id))
    );

    const featuredUnits = units.map((unit, index) => ({
      ...unit,
      ...unitDetails[index],
    }));

    // Get challenges with premium filtering
    const challenges = await fetchSingleGapChallenges("default", isPremiumUser);

    return (
      <SiteHomeClient
        featuredUnits={featuredUnits}
        challenges={challenges}
        completedUnitIds={completedUnitIds}
        filterInfo={{
          isFiltered,
          regionFilter,
          marineZoneFilter,
          ecosystemFilter,
          sortBy,
          sortOrder,
          showCompleted,
          showOnlyIncomplete,
        }}
        userInfo={{
          isLoggedIn,
          isPremiumUser,
          email: session?.user?.email,
        }}
      />
    );
  } catch (error) {
    console.error("Unexpected error in SiteHomePage:", error);

    // Fallback to default behavior
    const units = await fetchFeaturedUnits({ isPremiumUser });
    const unitDetails = await Promise.all(
      units.map((unit) => fetchUnitDetails(unit.id))
    );

    const featuredUnits = units.map((unit, index) => ({
      ...unit,
      ...unitDetails[index],
    }));

    const challenges = await fetchSingleGapChallenges("default", isPremiumUser);

    return (
      <SiteHomeClient
        featuredUnits={featuredUnits}
        challenges={challenges}
        completedUnitIds={[]}
        filterInfo={{
          isFiltered: false,
          regionFilter: null,
          marineZoneFilter: null,
          ecosystemFilter: null,
          sortBy: "rank",
          sortOrder: "asc",
          showCompleted: false,
          showOnlyIncomplete: false,
        }}
        userInfo={{
          isLoggedIn,
          isPremiumUser,
          email: session?.user?.email,
        }}
      />
    );
  }
}

// app/(site)/units/page.js - Updated with Ecosystem Filtering
// import {
//   fetchFeaturedUnits,
//   fetchUnitDetails,
//   fetchSingleGapChallenges,
// } from "@/lib/data-service";
// import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
// import { auth } from "@/lib/auth";
// import SiteHomeClient from "./SiteHomeClient";

// export default async function SiteHomePage(props) {
//   const session = await auth();
//   const supabase = getSupabaseAdmin();

//   // Extract filter parameters - await searchParams for Next.js 15
//   const searchParams = await props.searchParams;
//   const regionFilter = searchParams?.region;
//   const marineZoneFilter = searchParams?.marine_zone;
//   const ecosystemFilter = searchParams?.ecosystem; // ✅ NEW: Add ecosystem filter

//   let units;
//   let isFiltered = false;

//   try {
//     if (regionFilter || marineZoneFilter || ecosystemFilter) {
//       // Fetch filtered units
//       isFiltered = true;

//       // Build the query based on filters
//       let query = supabase
//         .from("units")
//         .select("*")
//         .eq("featured", true) // Keep only featured units, or remove this line to show all units
//         .order("rank", { ascending: true });

//       // Apply filters
//       if (regionFilter) {
//         // Handle both single region codes and arrays
//         query = query.or(
//           `region_code.eq.${regionFilter},region_code.like.%"${regionFilter}"%`
//         );
//       }

//       if (marineZoneFilter) {
//         const decodedMarineZone = decodeURIComponent(marineZoneFilter);
//         // Handle both single marine zones and arrays
//         query = query.or(
//           `marine_zone.eq.${decodedMarineZone},marine_zone.like.%"${decodedMarineZone}"%`
//         );
//       }

//       // ✅ NEW: Add ecosystem filtering
//       if (
//         ecosystemFilter &&
//         ecosystemFilter !== "all" &&
//         ecosystemFilter !== "undefined"
//       ) {
//         console.log("🌍 Filtering by ecosystem:", ecosystemFilter); // Debug log

//         // Filter by primary_ecosystem, with fallback to ecosystem_type
//         // Also include marine units if filtering for marine ecosystem
//         if (ecosystemFilter === "marine") {
//           query = query.or(
//             `primary_ecosystem.eq.marine,ecosystem_type.eq.marine,marine_zone.not.is.null`
//           );
//         } else {
//           query = query.or(
//             `primary_ecosystem.eq.${ecosystemFilter},ecosystem_type.eq.${ecosystemFilter}`
//           );
//         }
//       }

//       const { data: filteredUnits, error } = await query;

//       if (error) {
//         console.error("Error fetching filtered units:", error);
//         // Fallback to featured units if filtering fails
//         units = await fetchFeaturedUnits();
//         isFiltered = false;
//       } else {
//         units = filteredUnits || [];
//         console.log(
//           `🔍 Found ${units.length} units for ecosystem: ${ecosystemFilter}`
//         ); // Debug log
//       }
//     } else {
//       // Use existing featured units logic
//       units = await fetchFeaturedUnits();
//     }

//     // Fetch unit details for all units
//     const unitDetails = await Promise.all(
//       units.map((unit) => fetchUnitDetails(unit.id))
//     );

//     const featuredUnits = units.map((unit, index) => ({
//       ...unit,
//       ...unitDetails[index],
//     }));

//     // Get user's completed units if logged in
//     let completedUnitIds = [];
//     if (session?.user?.email) {
//       const { data: userData } = await supabase
//         .from("users")
//         .select("id")
//         .eq("email", session.user.email)
//         .single();

//       if (userData) {
//         const { data: completedData } = await supabase
//           .from("completed_units")
//           .select("unit_id")
//           .eq("user_id", userData.id);

//         completedUnitIds = completedData?.map((item) => item.unit_id) || [];
//       }
//     }

//     const challenges = await fetchSingleGapChallenges("default");

//     return (
//       <SiteHomeClient
//         featuredUnits={featuredUnits}
//         challenges={challenges}
//         completedUnitIds={completedUnitIds}
//         filterInfo={{
//           isFiltered,
//           regionFilter,
//           marineZoneFilter,
//           ecosystemFilter, // ✅ NEW: Pass ecosystem filter to client
//         }}
//       />
//     );
//   } catch (error) {
//     console.error("Unexpected error in SiteHomePage:", error);

//     // Fallback to default behavior
//     const units = await fetchFeaturedUnits();
//     const unitDetails = await Promise.all(
//       units.map((unit) => fetchUnitDetails(unit.id))
//     );

//     const featuredUnits = units.map((unit, index) => ({
//       ...unit,
//       ...unitDetails[index],
//     }));

//     const challenges = await fetchSingleGapChallenges("default");

//     return (
//       <SiteHomeClient
//         featuredUnits={featuredUnits}
//         challenges={challenges}
//         completedUnitIds={[]}
//         filterInfo={{
//           isFiltered: false,
//           regionFilter: null,
//           marineZoneFilter: null,
//           ecosystemFilter: null, // ✅ NEW: Include in fallback
//         }}
//       />
//     );
//   }
// }
