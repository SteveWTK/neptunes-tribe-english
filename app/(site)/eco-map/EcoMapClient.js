"use client";

import EcoMapProgressOceanZones from "@/app/components/EcoMapProgressOceanZones";
import RegionExplorer from "@/app/components/RegionExplorer";
import { Lightbulb } from "lucide-react";
import Link from "next/link";

console.log("RegionExplorer import:", RegionExplorer); // Debug line

export default function EcoMapClient({
  firstName,
  completedUnitsCount,
  completedCountriesCount,
  completedOceanZonesCount,
  totalPoints,
  currentLevel,
  streakDays,
  highestStreak,
  highlightedRegions,
  completedUnitsByCountry,
  highlightedOceanZones,
  completedUnitsByOcean,
  allAvailableRegions,
  allAvailableMarineZones,
}) {
  return (
    <div className="pt-4">
      <div className="text-center mb-6">
        <h1 className="text-xl lg:text-2xl text-[#10b981] dark:text-[#e5e7eb] font-bold mb-4 mx-2">
          Welcome to your virtual eco-journey around the world, {firstName}!
        </h1>
        {/* <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mb-2 mx-2">
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
        </p> */}
        {/* <p className="flex justify-center gap-2 py-2 text-sm lg:text-sm text-gray-500 dark:text-gray-500">
          <span>
            <Lightbulb className="text-sm" />
          </span>{" "}
          Use the region explorer below the map to discover units by location
        </p> */}

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

          {/* Additional marine/terrestrial breakdown */}
          {/* {(completedCountriesCount > 0 || completedOceanZonesCount > 0) && (
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
          )} */}
        </div>
      </div>

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
      {completedUnitsCount > 0 && (
        <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {completedOceanZonesCount > 0
              ? "Explore more marine ecosystems and countries to expand your eco-map!"
              : "Complete more units to see countries and marine zones light up on your eco-map!"}
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
        <div className="text-center mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg mx-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Complete your first unit to see countries and marine ecosystems
            light up on your eco-map!
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
}
