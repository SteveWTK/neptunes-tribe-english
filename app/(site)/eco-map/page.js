import { getServerSession } from "next-auth";
import { auth } from "@/lib/auth";
import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
import EcoMapClient from "./EcoMapClient";

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

    // Fetch completed units with proper join including marine zones
    const { data: completedData, error: completedError } = await supabase
      .from("completed_units")
      .select(
        `
        unit_id,
        units!inner(
          id,
          title,
          region_code,
          region_name,
          marine_zone,
          ecosystem_type
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

    // Helper function to parse region codes (handles both arrays and single values)
    const parseRegionCodes = (regionCode) => {
      if (!regionCode) return [];

      // Check if it's an array string like ["BR", "PE", "AR"]
      if (regionCode.startsWith("[") && regionCode.endsWith("]")) {
        try {
          return JSON.parse(regionCode);
        } catch (e) {
          console.warn("Failed to parse region code array:", regionCode);
          return [];
        }
      }

      // Single region code
      return [regionCode];
    };

    // Helper function to parse marine zones (handles both arrays and single values)
    const parseMarineZones = (marineZone) => {
      if (!marineZone) return [];

      // Check if it's an array string like ["Baltic Sea", "North Sea"]
      if (marineZone.startsWith("[") && marineZone.endsWith("]")) {
        try {
          return JSON.parse(marineZone);
        } catch (e) {
          console.warn("Failed to parse marine zone array:", marineZone);
          return [];
        }
      }

      // Single marine zone
      return [marineZone];
    };

    // Process the data for the map component
    const completedUnitsByCountry = {};
    const completedUnitsByOcean = {};
    const highlightedRegions = new Set();
    const highlightedOceanZones = new Set();

    if (completedData && completedData.length > 0) {
      completedData.forEach((entry) => {
        const unitData = entry.units;

        console.log("Processing unit:", {
          title: unitData.title,
          region_code: unitData.region_code,
          marine_zone: unitData.marine_zone,
          ecosystem_type: unitData.ecosystem_type,
        });

        // Handle terrestrial units (countries) - support multiple region codes
        const regionCodes = parseRegionCodes(unitData?.region_code);
        regionCodes.forEach((regionCode) => {
          const upperRegionCode = regionCode?.toUpperCase();
          if (upperRegionCode) {
            if (!completedUnitsByCountry[upperRegionCode]) {
              completedUnitsByCountry[upperRegionCode] = [];
            }
            completedUnitsByCountry[upperRegionCode].push(unitData.title);
            highlightedRegions.add(upperRegionCode);
          }
        });

        // Handle marine units (ocean zones) - support multiple marine zones
        const marineZones = parseMarineZones(unitData?.marine_zone);
        marineZones.forEach((marineZone) => {
          if (marineZone) {
            if (!completedUnitsByOcean[marineZone]) {
              completedUnitsByOcean[marineZone] = [];
            }
            completedUnitsByOcean[marineZone].push(unitData.title);
            highlightedOceanZones.add(marineZone);
          }
        });
      });
    }

    console.log("Final processed data:", {
      completedUnitsByCountry,
      completedUnitsByOcean,
      highlightedRegions: [...highlightedRegions],
      highlightedOceanZones: [...highlightedOceanZones],
    });

    const completedUnitsCount = completedData?.length || 0;
    const completedCountriesCount = Object.keys(completedUnitsByCountry).length;
    const completedOceanZonesCount = Object.keys(completedUnitsByOcean).length;

    // Fetch ALL available regions and marine zones (not just completed ones)
    const { data: allUnitsData, error: allUnitsError } = await supabase
      .from("units")
      .select("region_code, marine_zone");

    if (allUnitsError) {
      console.error("Error fetching all units data:", allUnitsError);
    }

    // Extract all unique regions and marine zones that have units
    const allAvailableRegions = new Set();
    const allAvailableMarineZones = new Set();

    if (allUnitsData) {
      allUnitsData.forEach((unit) => {
        // Handle region codes (both single and arrays)
        if (unit.region_code) {
          const regionCodes = parseRegionCodes(unit.region_code);
          regionCodes.forEach((code) => {
            if (code) allAvailableRegions.add(code.toUpperCase());
          });
        }

        // Handle marine zones (both single and arrays)
        if (unit.marine_zone) {
          const marineZones = parseMarineZones(unit.marine_zone);
          marineZones.forEach((zone) => {
            if (zone) allAvailableMarineZones.add(zone);
          });
        }
      });
    }

    console.log("All available regions and zones:", {
      regions: Array.from(allAvailableRegions),
      marineZones: Array.from(allAvailableMarineZones),
    });

    // Fetch user progress data
    const { data: progressData, error: progressError } = await supabase
      .from("user_progress")
      .select(
        "total_points, current_level, streak_days, highest_streak, completed_exercises"
      )
      .eq("user_id", userData.id)
      .single();

    // Handle case where user has no progress record yet (new user)
    if (progressError && progressError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" - this is expected for new users
      console.error("Error fetching user progress:", progressError);
      return (
        <div className="pt-4">
          <p className="font-josefin text-lg text-center my-4">
            Failed to load your XP points. Please try again.
          </p>
        </div>
      );
    }

    const totalPoints = progressData?.total_points || 0;
    const currentLevel = progressData?.current_level || 1;
    const streakDays = progressData?.streak_days || 0;
    const highestStreak = progressData?.highest_streak || 0;
    const completedExercises = progressData?.completed_exercises || 0;

    return (
      <EcoMapClient
        firstName={firstName}
        completedUnitsCount={completedUnitsCount}
        completedCountriesCount={completedCountriesCount}
        completedOceanZonesCount={completedOceanZonesCount}
        totalPoints={totalPoints}
        currentLevel={currentLevel}
        streakDays={streakDays}
        highestStreak={highestStreak}
        highlightedRegions={[...highlightedRegions]}
        completedUnitsByCountry={completedUnitsByCountry}
        highlightedOceanZones={[...highlightedOceanZones]}
        completedUnitsByOcean={completedUnitsByOcean}
        allAvailableRegions={Array.from(allAvailableRegions)}
        allAvailableMarineZones={Array.from(allAvailableMarineZones)}
      />
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

// import { getServerSession } from "next-auth";
// import { auth } from "@/lib/auth";
// import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
// import EcoMapClient from "./EcoMapClient";

// export default async function EcoMapPage() {
//   const session = await auth();
//   const firstName = session?.user?.name
//     ? session.user.name.split(" ").at(0)
//     : "Eco-Warrior!";

//   if (!session || !session.user?.email) {
//     return (
//       <div className="pt-4">
//         <p className="font-josefin text-lg text-center my-4">
//           Please log in to view your progress.
//         </p>
//       </div>
//     );
//   }

//   const email = session.user.email;
//   const supabase = getSupabaseAdmin();

//   try {
//     // Fetch user from Supabase users table (linked to NextAuth email)
//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("email", email)
//       .single();

//     if (userError || !userData) {
//       console.error("Error finding Supabase user by email:", userError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Could not load user progress. Please try refreshing the page.
//           </p>
//         </div>
//       );
//     }

//     // Fetch completed units with proper join including marine zones
//     const { data: completedData, error: completedError } = await supabase
//       .from("completed_units")
//       .select(
//         `
//         unit_id,
//         units!inner(
//           id,
//           title,
//           region_code,
//           region_name,
//           marine_zone,
//           ecosystem_type
//         )
//       `
//       )
//       .eq("user_id", userData.id);

//     if (completedError) {
//       console.error("Error fetching completed units:", completedError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Failed to load your eco-map progress. Please try again.
//           </p>
//         </div>
//       );
//     }

//     // Helper function to parse region codes (handles both arrays and single values)
//     const parseRegionCodes = (regionCode) => {
//       if (!regionCode) return [];

//       // Check if it's an array string like ["BR", "PE", "AR"]
//       if (regionCode.startsWith("[") && regionCode.endsWith("]")) {
//         try {
//           return JSON.parse(regionCode);
//         } catch (e) {
//           console.warn("Failed to parse region code array:", regionCode);
//           return [];
//         }
//       }

//       // Single region code
//       return [regionCode];
//     };

//     // Helper function to parse marine zones (handles both arrays and single values)
//     const parseMarineZones = (marineZone) => {
//       if (!marineZone) return [];

//       // Check if it's an array string like ["Baltic Sea", "North Sea"]
//       if (marineZone.startsWith("[") && marineZone.endsWith("]")) {
//         try {
//           return JSON.parse(marineZone);
//         } catch (e) {
//           console.warn("Failed to parse marine zone array:", marineZone);
//           return [];
//         }
//       }

//       // Single marine zone
//       return [marineZone];
//     };

//     // Process the data for the map component
//     const completedUnitsByCountry = {};
//     const completedUnitsByOcean = {};
//     const highlightedRegions = new Set();
//     const highlightedOceanZones = new Set();

//     if (completedData && completedData.length > 0) {
//       completedData.forEach((entry) => {
//         const unitData = entry.units;

//         console.log("Processing unit:", {
//           title: unitData.title,
//           region_code: unitData.region_code,
//           marine_zone: unitData.marine_zone,
//           ecosystem_type: unitData.ecosystem_type,
//         });

//         // Handle terrestrial units (countries) - support multiple region codes
//         const regionCodes = parseRegionCodes(unitData?.region_code);
//         regionCodes.forEach((regionCode) => {
//           const upperRegionCode = regionCode?.toUpperCase();
//           if (upperRegionCode) {
//             if (!completedUnitsByCountry[upperRegionCode]) {
//               completedUnitsByCountry[upperRegionCode] = [];
//             }
//             completedUnitsByCountry[upperRegionCode].push(unitData.title);
//             highlightedRegions.add(upperRegionCode);
//           }
//         });

//         // Handle marine units (ocean zones) - support multiple marine zones
//         const marineZones = parseMarineZones(unitData?.marine_zone);
//         marineZones.forEach((marineZone) => {
//           if (marineZone) {
//             if (!completedUnitsByOcean[marineZone]) {
//               completedUnitsByOcean[marineZone] = [];
//             }
//             completedUnitsByOcean[marineZone].push(unitData.title);
//             highlightedOceanZones.add(marineZone);
//           }
//         });
//       });
//     }

//     console.log("Final processed data:", {
//       completedUnitsByCountry,
//       completedUnitsByOcean,
//       highlightedRegions: [...highlightedRegions],
//       highlightedOceanZones: [...highlightedOceanZones],
//     });

//     const completedUnitsCount = completedData?.length || 0;
//     const completedCountriesCount = Object.keys(completedUnitsByCountry).length;
//     const completedOceanZonesCount = Object.keys(completedUnitsByOcean).length;

//     // Fetch user progress data
//     const { data: progressData, error: progressError } = await supabase
//       .from("user_progress")
//       .select(
//         "total_points, current_level, streak_days, highest_streak, completed_exercises"
//       )
//       .eq("user_id", userData.id)
//       .single();

//     // Handle case where user has no progress record yet (new user)
//     if (progressError && progressError.code !== "PGRST116") {
//       // PGRST116 is "no rows returned" - this is expected for new users
//       console.error("Error fetching user progress:", progressError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Failed to load your XP points. Please try again.
//           </p>
//         </div>
//       );
//     }

//     const totalPoints = progressData?.total_points || 0;
//     const currentLevel = progressData?.current_level || 1;
//     const streakDays = progressData?.streak_days || 0;
//     const highestStreak = progressData?.highest_streak || 0;
//     const completedExercises = progressData?.completed_exercises || 0;

//     return (
//       <EcoMapClient
//         firstName={firstName}
//         completedUnitsCount={completedUnitsCount}
//         completedCountriesCount={completedCountriesCount}
//         completedOceanZonesCount={completedOceanZonesCount}
//         totalPoints={totalPoints}
//         currentLevel={currentLevel}
//         streakDays={streakDays}
//         highestStreak={highestStreak}
//         highlightedRegions={[...highlightedRegions]}
//         completedUnitsByCountry={completedUnitsByCountry}
//         highlightedOceanZones={[...highlightedOceanZones]}
//         completedUnitsByOcean={completedUnitsByOcean}
//       />
//     );
//   } catch (error) {
//     console.error("Unexpected error in EcoMapPage:", error);
//     return (
//       <div className="pt-4">
//         <p className="font-josefin text-lg text-center my-4 text-red-600">
//           An unexpected error occurred. Please try again later.
//         </p>
//       </div>
//     );
//   }
// }

// import { getServerSession } from "next-auth";
// import { auth } from "@/lib/auth";
// import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
// import EcoMapProgress from "@/app/components/EcoMapProgress";
// import Link from "next/link";
// import EcoMapProgressOceanZones from "@/app/components/EcoMapProgressOceanZones";

// export default async function EcoMapPage() {
//   const session = await auth();
//   const firstName = session?.user?.name
//     ? session.user.name.split(" ").at(0)
//     : "Eco-Warrior!";

//   if (!session || !session.user?.email) {
//     return (
//       <div className="pt-4">
//         <p className="font-josefin text-lg text-center my-4">
//           Please log in to view your progress.
//         </p>
//       </div>
//     );
//   }

//   const email = session.user.email;
//   const supabase = getSupabaseAdmin();

//   try {
//     // Fetch user from Supabase users table (linked to NextAuth email)
//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("email", email)
//       .single();

//     if (userError || !userData) {
//       console.error("Error finding Supabase user by email:", userError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Could not load user progress. Please try refreshing the page.
//           </p>
//         </div>
//       );
//     }

//     // Fetch completed units with proper join including marine zones
//     const { data: completedData, error: completedError } = await supabase
//       .from("completed_units")
//       .select(
//         `
//         unit_id,
//         units!inner(
//           id,
//           title,
//           region_code,
//           region_name,
//           marine_zone,
//           ecosystem_type
//         )
//       `
//       )
//       .eq("user_id", userData.id);

//     if (completedError) {
//       console.error("Error fetching completed units:", completedError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Failed to load your eco-map progress. Please try again.
//           </p>
//         </div>
//       );
//     }

//     // Helper function to parse region codes (handles both arrays and single values)
//     const parseRegionCodes = (regionCode) => {
//       if (!regionCode) return [];

//       // Check if it's an array string like ["BR", "PE", "AR"]
//       if (regionCode.startsWith("[") && regionCode.endsWith("]")) {
//         try {
//           return JSON.parse(regionCode);
//         } catch (e) {
//           console.warn("Failed to parse region code array:", regionCode);
//           return [];
//         }
//       }

//       // Single region code
//       return [regionCode];
//     };

//     // Helper function to parse marine zones (handles both arrays and single values)
//     const parseMarineZones = (marineZone) => {
//       if (!marineZone) return [];

//       // Check if it's an array string like ["Baltic Sea", "North Sea"]
//       if (marineZone.startsWith("[") && marineZone.endsWith("]")) {
//         try {
//           return JSON.parse(marineZone);
//         } catch (e) {
//           console.warn("Failed to parse marine zone array:", marineZone);
//           return [];
//         }
//       }

//       // Single marine zone
//       return [marineZone];
//     };

//     // Process the data for the map component
//     const completedUnitsByCountry = {};
//     const completedUnitsByOcean = {};
//     const highlightedRegions = new Set();
//     const highlightedOceanZones = new Set();

//     if (completedData && completedData.length > 0) {
//       completedData.forEach((entry) => {
//         const unitData = entry.units;

//         console.log("Processing unit:", {
//           title: unitData.title,
//           region_code: unitData.region_code,
//           marine_zone: unitData.marine_zone,
//           ecosystem_type: unitData.ecosystem_type,
//         });

//         // Handle terrestrial units (countries) - support multiple region codes
//         const regionCodes = parseRegionCodes(unitData?.region_code);
//         regionCodes.forEach((regionCode) => {
//           const upperRegionCode = regionCode?.toUpperCase();
//           if (upperRegionCode) {
//             if (!completedUnitsByCountry[upperRegionCode]) {
//               completedUnitsByCountry[upperRegionCode] = [];
//             }
//             completedUnitsByCountry[upperRegionCode].push(unitData.title);
//             highlightedRegions.add(upperRegionCode);
//           }
//         });

//         // Handle marine units (ocean zones) - support multiple marine zones
//         const marineZones = parseMarineZones(unitData?.marine_zone);
//         marineZones.forEach((marineZone) => {
//           if (marineZone) {
//             if (!completedUnitsByOcean[marineZone]) {
//               completedUnitsByOcean[marineZone] = [];
//             }
//             completedUnitsByOcean[marineZone].push(unitData.title);
//             highlightedOceanZones.add(marineZone);
//           }
//         });
//       });
//     }

//     console.log("Final processed data:", {
//       completedUnitsByCountry,
//       completedUnitsByOcean,
//       highlightedRegions: [...highlightedRegions],
//       highlightedOceanZones: [...highlightedOceanZones],
//     });

//     const completedUnitsCount = completedData?.length || 0;
//     const completedCountriesCount = Object.keys(completedUnitsByCountry).length;
//     const completedOceanZonesCount = Object.keys(completedUnitsByOcean).length;

//     // Fetch user progress data
//     const { data: progressData, error: progressError } = await supabase
//       .from("user_progress")
//       .select(
//         "total_points, current_level, streak_days, highest_streak, completed_exercises"
//       )
//       .eq("user_id", userData.id)
//       .single();

//     // Handle case where user has no progress record yet (new user)
//     if (progressError && progressError.code !== "PGRST116") {
//       // PGRST116 is "no rows returned" - this is expected for new users
//       console.error("Error fetching user progress:", progressError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Failed to load your XP points. Please try again.
//           </p>
//         </div>
//       );
//     }

//     const totalPoints = progressData?.total_points || 0;
//     const currentLevel = progressData?.current_level || 1;
//     const streakDays = progressData?.streak_days || 0;
//     const highestStreak = progressData?.highest_streak || 0;
//     const completedExercises = progressData?.completed_exercises || 0;

//     return (
//       <div className="pt-4">
//         <div className="text-center mb-6">
//           <h1 className="text-xl lg:text-2xl text-[#10b981] dark:text-[#e5e7eb] font-bold mb-2">
//             Welcome to your virtual eco-journey around the world, {firstName}!
//           </h1>
//           <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2">
//             You have completed {completedUnitsCount} unit
//             {completedUnitsCount !== 1 ? "s" : ""} across{" "}
//             {completedCountriesCount} countr
//             {completedCountriesCount !== 1 ? "ies" : "y"}
//             {completedOceanZonesCount > 0 && (
//               <>
//                 {" "}
//                 and {completedOceanZonesCount} marine ecosystem
//                 {completedOceanZonesCount !== 1 ? "s" : ""}
//               </>
//             )}
//           </p>
//           <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
//             💡 Click on any country or marine zone to explore units for that
//             region
//           </p>

//           {/* Enhanced progress display */}
//           <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4 lg:mx-8">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//               <div>
//                 <p className="text-2xl font-bold text-[#10b981]">
//                   {totalPoints}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   XP Points
//                 </p>
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-[#10b981]">
//                   {currentLevel}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Level
//                 </p>
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-[#10b981]">
//                   {streakDays}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Current Streak
//                 </p>
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-[#10b981]">
//                   {highestStreak}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Best Streak
//                 </p>
//               </div>
//             </div>

//             {/* Additional marine/terrestrial breakdown */}
//             {(completedCountriesCount > 0 || completedOceanZonesCount > 0) && (
//               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <div className="grid grid-cols-2 gap-4 text-center">
//                   <div>
//                     <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
//                       {completedCountriesCount}
//                     </p>
//                     <p className="text-xs text-gray-600 dark:text-gray-400">
//                       Countries Explored
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
//                       {completedOceanZonesCount}
//                     </p>
//                     <p className="text-xs text-gray-600 dark:text-gray-400">
//                       Marine Zones Explored
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <EcoMapProgressOceanZones
//           highlightedRegions={[...highlightedRegions]}
//           completedUnitsByCountry={completedUnitsByCountry}
//           highlightedOceanZones={[...highlightedOceanZones]}
//           completedUnitsByOcean={completedUnitsByOcean}
//         />

//         {completedUnitsCount > 0 && (
//           <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
//             <p className="text-gray-600 dark:text-gray-400 mb-4">
//               {completedOceanZonesCount > 0
//                 ? "Explore more marine ecosystems and countries to expand your eco-map!"
//                 : "Complete more units to see countries and marine zones light up on your eco-map!"}
//             </p>
//             <Link
//               href="/units"
//               className="inline-block bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
//             >
//               Continue Learning
//             </Link>
//           </div>
//         )}

//         {completedUnitsCount === 0 && (
//           <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
//             <p className="text-gray-600 dark:text-gray-400 mb-4">
//               Complete your first unit to see countries and marine ecosystems
//               light up on your eco-map!
//             </p>
//             <Link
//               href="/units"
//               className="inline-block bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
//             >
//               Start Learning
//             </Link>
//           </div>
//         )}
//       </div>
//     );
//   } catch (error) {
//     console.error("Unexpected error in EcoMapPage:", error);
//     return (
//       <div className="pt-4">
//         <p className="font-josefin text-lg text-center my-4 text-red-600">
//           An unexpected error occurred. Please try again later.
//         </p>
//       </div>
//     );
//   }
// }

// import { getServerSession } from "next-auth";
// import { auth } from "@/lib/auth";
// import getSupabaseAdmin from "@/lib/supabase-admin-lazy";
// import EcoMapProgress from "@/app/components/EcoMapProgress";
// import Link from "next/link";
// import EcoMapProgressOceanZones from "@/app/components/EcoMapProgressOceanZones";

// export default async function EcoMapPage() {
//   const session = await auth();
//   const firstName = session?.user?.name
//     ? session.user.name.split(" ").at(0)
//     : "Eco-Warrior!";

//   if (!session || !session.user?.email) {
//     return (
//       <div className="pt-4">
//         <p className="font-josefin text-lg text-center my-4">
//           Please log in to view your progress.
//         </p>
//       </div>
//     );
//   }

//   const email = session.user.email;
//   const supabase = getSupabaseAdmin();

//   try {
//     // Fetch user from Supabase users table (linked to NextAuth email)
//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .select("id")
//       .eq("email", email)
//       .single();

//     if (userError || !userData) {
//       console.error("Error finding Supabase user by email:", userError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Could not load user progress. Please try refreshing the page.
//           </p>
//         </div>
//       );
//     }

//     // Fetch completed units with proper join including marine zones
//     const { data: completedData, error: completedError } = await supabase
//       .from("completed_units")
//       .select(
//         `
//         unit_id,
//         units!inner(
//           id,
//           title,
//           region_code,
//           region_name,
//           marine_zone,
//           ecosystem_type
//         )
//       `
//       )
//       .eq("user_id", userData.id);

//     if (completedError) {
//       console.error("Error fetching completed units:", completedError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Failed to load your eco-map progress. Please try again.
//           </p>
//         </div>
//       );
//     }

//     // Helper function to parse region codes (handles both arrays and single values)
//     const parseRegionCodes = (regionCode) => {
//       if (!regionCode) return [];

//       // Check if it's an array string like ["BR", "PE", "AR"]
//       if (regionCode.startsWith('[') && regionCode.endsWith(']')) {
//         try {
//           return JSON.parse(regionCode);
//         } catch (e) {
//           console.warn('Failed to parse region code array:', regionCode);
//           return [];
//         }
//       }

//       // Single region code
//       return [regionCode];
//     };

//     // Helper function to parse marine zones (handles both arrays and single values)
//     const parseMarineZones = (marineZone) => {
//       if (!marineZone) return [];

//       // Check if it's an array string like ["Baltic Sea", "North Sea"]
//       if (marineZone.startsWith('[') && marineZone.endsWith(']')) {
//         try {
//           return JSON.parse(marineZone);
//         } catch (e) {
//           console.warn('Failed to parse marine zone array:', marineZone);
//           return [];
//         }
//       }

//       // Single marine zone
//       return [marineZone];
//     };

//     // Process the data for the map component
//     const completedUnitsByCountry = {};
//     const completedUnitsByOcean = {};
//     const highlightedRegions = new Set();
//     const highlightedOceanZones = new Set();

//     if (completedData && completedData.length > 0) {
//       completedData.forEach((entry) => {
//         const unitData = entry.units;

//         console.log('Processing unit:', {
//           title: unitData.title,
//           region_code: unitData.region_code,
//           marine_zone: unitData.marine_zone,
//           ecosystem_type: unitData.ecosystem_type
//         });

//         // Handle terrestrial units (countries) - support multiple region codes
//         const regionCodes = parseRegionCodes(unitData?.region_code);
//         regionCodes.forEach((regionCode) => {
//           const upperRegionCode = regionCode?.toUpperCase();
//           if (upperRegionCode) {
//             if (!completedUnitsByCountry[upperRegionCode]) {
//               completedUnitsByCountry[upperRegionCode] = [];
//             }
//             completedUnitsByCountry[upperRegionCode].push(unitData.title);
//             highlightedRegions.add(upperRegionCode);
//           }
//         });

//         // Handle marine units (ocean zones) - support multiple marine zones
//         const marineZones = parseMarineZones(unitData?.marine_zone);
//         marineZones.forEach((marineZone) => {
//           if (marineZone) {
//             if (!completedUnitsByOcean[marineZone]) {
//               completedUnitsByOcean[marineZone] = [];
//             }
//             completedUnitsByOcean[marineZone].push(unitData.title);
//             highlightedOceanZones.add(marineZone);
//           }
//         });
//       });
//     }

//     console.log('Final processed data:', {
//       completedUnitsByCountry,
//       completedUnitsByOcean,
//       highlightedRegions: [...highlightedRegions],
//       highlightedOceanZones: [...highlightedOceanZones]
//     });

//     const completedUnitsCount = completedData?.length || 0;
//     const completedCountriesCount = Object.keys(completedUnitsByCountry).length;
//     const completedOceanZonesCount = Object.keys(completedUnitsByOcean).length;

//     // Fetch user progress data
//     const { data: progressData, error: progressError } = await supabase
//       .from("user_progress")
//       .select(
//         "total_points, current_level, streak_days, highest_streak, completed_exercises"
//       )
//       .eq("user_id", userData.id)
//       .single();

//     // Handle case where user has no progress record yet (new user)
//     if (progressError && progressError.code !== 'PGRST116') {
//       // PGRST116 is "no rows returned" - this is expected for new users
//       console.error("Error fetching user progress:", progressError);
//       return (
//         <div className="pt-4">
//           <p className="font-josefin text-lg text-center my-4">
//             Failed to load your XP points. Please try again.
//           </p>
//         </div>
//       );
//     }

//     const totalPoints = progressData?.total_points || 0;
//     const currentLevel = progressData?.current_level || 1;
//     const streakDays = progressData?.streak_days || 0;
//     const highestStreak = progressData?.highest_streak || 0;
//     const completedExercises = progressData?.completed_exercises || 0;

//     return (
//       <div className="pt-4">
//         <div className="text-center mb-6">
//           <h1 className="text-xl lg:text-2xl text-[#10b981] dark:text-[#e5e7eb] font-bold mb-2">
//             Welcome to your virtual eco-journey around the world, {firstName}!
//           </h1>
//           <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
//             You have completed {completedUnitsCount} unit
//             {completedUnitsCount !== 1 ? "s" : ""} across{" "}
//             {completedCountriesCount} countr
//             {completedCountriesCount !== 1 ? "ies" : "y"}
//             {completedOceanZonesCount > 0 && (
//               <>
//                 {" "}
//                 and {completedOceanZonesCount} marine ecosystem
//                 {completedOceanZonesCount !== 1 ? "s" : ""}
//               </>
//             )}
//           </p>

//           {/* Enhanced progress display */}
//           <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4 lg:mx-8">
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//               <div>
//                 <p className="text-2xl font-bold text-[#10b981]">
//                   {totalPoints}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   XP Points
//                 </p>
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-[#10b981]">
//                   {currentLevel}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Level
//                 </p>
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-[#10b981]">
//                   {streakDays}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Current Streak
//                 </p>
//               </div>
//               <div>
//                 <p className="text-2xl font-bold text-[#10b981]">
//                   {highestStreak}
//                 </p>
//                 <p className="text-sm text-gray-600 dark:text-gray-400">
//                   Best Streak
//                 </p>
//               </div>
//             </div>

//             {/* Additional marine/terrestrial breakdown */}
//             {(completedCountriesCount > 0 || completedOceanZonesCount > 0) && (
//               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <div className="grid grid-cols-2 gap-4 text-center">
//                   <div>
//                     <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
//                       {completedCountriesCount}
//                     </p>
//                     <p className="text-xs text-gray-600 dark:text-gray-400">
//                       Countries Explored
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
//                       {completedOceanZonesCount}
//                     </p>
//                     <p className="text-xs text-gray-600 dark:text-gray-400">
//                       Marine Zones Explored
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         <EcoMapProgressOceanZones
//           highlightedRegions={[...highlightedRegions]}
//           completedUnitsByCountry={completedUnitsByCountry}
//           highlightedOceanZones={[...highlightedOceanZones]}
//           completedUnitsByOcean={completedUnitsByOcean}
//         />

//         {completedUnitsCount > 0 && (
//           <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
//             <p className="text-gray-600 dark:text-gray-400 mb-4">
//               {completedOceanZonesCount > 0
//                 ? "Explore more marine ecosystems and countries to expand your eco-map!"
//                 : "Complete more units to see countries and marine zones light up on your eco-map!"}
//             </p>
//             <Link
//               href="/units"
//               className="inline-block bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
//             >
//               Continue Learning
//             </Link>
//           </div>
//         )}

//         {completedUnitsCount === 0 && (
//           <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
//             <p className="text-gray-600 dark:text-gray-400 mb-4">
//               Complete your first unit to see countries and marine ecosystems
//               light up on your eco-map!
//             </p>
//             <Link
//               href="/units"
//               className="inline-block bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
//             >
//               Start Learning
//             </Link>
//           </div>
//         )}
//       </div>
//     );
//   } catch (error) {
//     console.error("Unexpected error in EcoMapPage:", error);
//     return (
//       <div className="pt-4">
//         <p className="font-josefin text-lg text-center my-4 text-red-600">
//           An unexpected error occurred. Please try again later.
//         </p>
//       </div>
//     );
//   }
// }
