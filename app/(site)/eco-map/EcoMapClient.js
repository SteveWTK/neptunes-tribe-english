"use client";

import EcoMapProgressOceanZones from "@/app/components/EcoMapProgressOceanZones";
import RegionExplorer from "@/app/components/RegionExplorer";
import GreenScaleProgress from "@/app/components/GreenScaleProgress";
import { useState } from "react";
import { Lightbulb, Map, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function EcoMapClient({
  firstName,
  completedUnitsCount,
  completedCountriesCount,
  completedOceanZonesCount,
  totalPoints,
  currentLevel,
  highlightedRegions,
  completedUnitsByCountry,
  highlightedOceanZones,
  completedUnitsByOcean,
  allAvailableRegions,
  allAvailableMarineZones,
  ecosystemProgress = {},
  lastActivityDate = null,
}) {
  const [activeTab, setActiveTab] = useState("map");

  // Process ecosystem data for the GreenScale component
  const completedUnitsByEcosystem = {
    ocean: ecosystemProgress.ocean?.units_completed || 0,
    forest: ecosystemProgress.forest?.units_completed || 0,
    arctic: ecosystemProgress.arctic?.units_completed || 0,
    grassland: ecosystemProgress.grassland?.units_completed || 0,
  };

  const tabs = [
    {
      id: "map",
      label: "Eco-Map",
      icon: <Map className="w-4 h-4" />,
      description: "Track your global journey",
    },
    {
      id: "progress",
      label: "Green Scale",
      icon: <Trophy className="w-4 h-4" />,
      description: "Environmental challenges & badges",
    },
  ];

  return (
    <div className="pt-4">
      <div className="text-center mb-6">
        <h1 className="text-xl lg:text-2xl text-[#10b981] dark:text-[#e5e7eb] font-bold mb-4 mx-2">
          Welcome to your virtual eco-journey around the world, {firstName}!
        </h1>

        {/* Enhanced progress display */}
        <div className="mt-5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4 lg:mx-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#10b981] dark:text-green-300">
                {totalPoints}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                XP points
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#10b981] dark:text-green-300">
                {currentLevel}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {completedCountriesCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Countries Explored
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {completedOceanZonesCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Marine Zones Explored
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-center">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab descriptions */}
        <div className="text-center mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "map" && (
          <div className="space-y-6">
            <EcoMapProgressOceanZones
              highlightedRegions={highlightedRegions}
              completedUnitsByCountry={completedUnitsByCountry}
              highlightedOceanZones={highlightedOceanZones}
              completedUnitsByOcean={completedUnitsByOcean}
            />

            <RegionExplorer
              completedUnitsByCountry={completedUnitsByCountry}
              completedUnitsByOcean={completedUnitsByOcean}
              highlightedRegions={highlightedRegions}
              highlightedOceanZones={highlightedOceanZones}
              allAvailableRegions={allAvailableRegions}
              allAvailableMarineZones={allAvailableMarineZones}
            />
          </div>
        )}

        {activeTab === "progress" && (
          <div className="px-4">
            <GreenScaleProgress
              completedUnitsByEcosystem={completedUnitsByEcosystem}
              totalUnitsCompleted={completedUnitsCount}
              lastActivityDate={lastActivityDate}
              userProgress={ecosystemProgress}
            />
          </div>
        )}
      </div>

      {/* Call to Action Section */}
      <div className="max-w-4xl mx-auto mt-8">
        {completedUnitsCount > 0 ? (
          <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">
                Keep Growing Your Impact!
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {completedOceanZonesCount > 0
                ? "Explore more marine ecosystems and countries to advance your Green Scale!"
                : "Complete more environmental challenges to unlock new badges and expand your eco-map!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/units"
                className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg hover:bg-[#059669] transition-colors font-medium"
              >
                Continue Learning
              </Link>
              <Link
                href="/eco-news"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Neptune&apos;s News
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">
                Start Your Environmental Journey!
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Complete your first unit to see countries and marine ecosystems
              light up on your eco-map and begin earning environmental badges!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/units"
                className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg hover:bg-[#059669] transition-colors font-medium"
              >
                Start Learning
              </Link>
              <Link
                href="/pricing"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Go Premium
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// "use client";

// import EcoMapProgressOceanZones from "@/app/components/EcoMapProgressOceanZones";
// import RegionExplorer from "@/app/components/RegionExplorer";
// import { Lightbulb } from "lucide-react";
// import Link from "next/link";

// console.log("RegionExplorer import:", RegionExplorer); // Debug line

// export default function EcoMapClient({
//   firstName,
//   completedUnitsCount,
//   completedCountriesCount,
//   completedOceanZonesCount,
//   totalPoints,
//   currentLevel,
//   streakDays,
//   highestStreak,
//   highlightedRegions,
//   completedUnitsByCountry,
//   highlightedOceanZones,
//   completedUnitsByOcean,
//   allAvailableRegions,
//   allAvailableMarineZones,
// }) {
//   return (
//     <div className="pt-4">
//       <div className="text-center mb-6">
//         <h1 className="text-xl lg:text-2xl text-[#10b981] dark:text-[#e5e7eb] font-bold mb-4 mx-2">
//           Welcome to your virtual eco-journey around the world, {firstName}!
//         </h1>

//         {/* Enhanced progress display */}
//         <div className="mt-5 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4 lg:mx-8">
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
//             <div>
//               <p className="text-2xl font-bold text-[#10b981] dark:text-green-300">
//                 {totalPoints}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 XP points
//               </p>
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-[#10b981] dark:text-green-300">
//                 {currentLevel}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400">Level</p>
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
//                 {completedCountriesCount}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Countries Explored
//               </p>
//             </div>
//             <div>
//               <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                 {completedOceanZonesCount}
//               </p>
//               <p className="text-sm text-gray-600 dark:text-gray-400">
//                 Marine Zones Explored
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <EcoMapProgressOceanZones
//         highlightedRegions={highlightedRegions}
//         completedUnitsByCountry={completedUnitsByCountry}
//         highlightedOceanZones={highlightedOceanZones}
//         completedUnitsByOcean={completedUnitsByOcean}
//       />
//       <RegionExplorer
//         completedUnitsByCountry={completedUnitsByCountry}
//         completedUnitsByOcean={completedUnitsByOcean}
//         highlightedRegions={highlightedRegions}
//         highlightedOceanZones={highlightedOceanZones}
//         allAvailableRegions={allAvailableRegions}
//         allAvailableMarineZones={allAvailableMarineZones}
//       />
//       {completedUnitsCount > 0 && (
//         <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
//           <p className="text-gray-600 dark:text-gray-400 mb-4">
//             {completedOceanZonesCount > 0
//               ? "Explore more marine ecosystems and countries to expand your eco-map!"
//               : "Complete more units to see countries and marine zones light up on your eco-map!"}
//           </p>
//           <Link
//             href="/units"
//             className="inline-block bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
//           >
//             Continue Learning
//           </Link>
//         </div>
//       )}

//       {completedUnitsCount === 0 && (
//         <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
//           <p className="text-gray-600 dark:text-gray-400 mb-4">
//             Complete your first unit to see countries and marine ecosystems
//             light up on your eco-map!
//           </p>
//           <Link
//             href="/units"
//             className="inline-block bg-[#10b981] text-white px-6 py-2 rounded-lg hover:bg-[#059669] transition-colors"
//           >
//             Start Learning
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// }

{
  /* <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2 mx-2">
          You have completed {completedUnitsCount} unit
          {completedUnitsCount !== 1 ? "s" : ""} across{" "}
          {completedCountriesCount} countr
          {completedCountriesCount !== 1 ? "ies" : "y"}
          {completedOceanZonesCount > 0 && (
            <>
              {" "}
              and {completedOceanZonesCount} marine ecosystem
              {completedOceanZonesCount !== 1 ? "s" : ""}
            </>
          )}
        </p> */
}
{
  /* <p className="flex justify-center gap-2 py-2 text-sm lg:text-sm text-gray-500 dark:text-gray-500">
          <span>
            <Lightbulb className="text-sm" />
          </span>{" "}
          Use the region explorer below the map to discover units by location
        </p> */
}

{
  /* Additional marine/terrestrial breakdown */
}
{
  /* {(completedCountriesCount > 0 || completedOceanZonesCount > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {streakDays}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    current Streak
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                    {highestStreak}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Best Streak
                  </p>
                </div>
              </div>
            </div>
          )} */
}
