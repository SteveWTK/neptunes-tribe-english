"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";

export default function RegionExplorer({
  completedUnitsByCountry = {},
  completedUnitsByOcean = {},
  highlightedRegions = [],
  highlightedOceanZones = [],
  allAvailableRegions = [],
  allAvailableMarineZones = [],
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("countries");

  console.log("RegionExplorer - Raw data:", {
    allAvailableRegions,
    sampleAlpha2ToNumeric: {
      BR: alpha2ToNumeric["BR"],
      US: alpha2ToNumeric["US"],
    },
    sampleCountryNameLookup: {
      "032": countryNameLookup["032"],
      840: countryNameLookup["840"],
    },
  });

  // Filter and process countries
  const countries = allAvailableRegions
    .filter((regionCode) => {
      // Filter out arrays and non-standard codes
      const isValid =
        typeof regionCode === "string" &&
        regionCode.length === 2 &&
        !regionCode.includes("[") &&
        !regionCode.includes("]") &&
        !regionCode.includes('"') &&
        !regionCode.includes(",") &&
        /^[A-Z]{2}$/.test(regionCode);

      if (!isValid) {
        console.log("Filtered out invalid region:", regionCode);
      }
      return isValid;
    })
    .map((countryCode) => {
      // Step 1: Convert alpha2 to numeric
      const numericCode = alpha2ToNumeric[countryCode];
      console.log(`Lookup: ${countryCode} -> ${numericCode}`);

      // Step 2: Convert numeric to country name
      const countryName = numericCode ? countryNameLookup[numericCode] : null;
      console.log(`Lookup: ${numericCode} -> ${countryName}`);

      return {
        name: countryName || countryCode,
        code: countryCode,
        isCompleted: !!completedUnitsByCountry[countryCode],
        isHighlighted: highlightedRegions.includes(countryCode),
        unitCount: completedUnitsByCountry[countryCode]?.length || 0,
        hasValidName: !!countryName,
      };
    })
    .filter((country) => {
      if (!country.hasValidName) {
        console.log("No country name found for:", country.code);
      }
      return country.hasValidName;
    })
    .sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return -1;
      if (!a.isCompleted && b.isCompleted) return 1;
      if (a.isHighlighted && !b.isHighlighted) return -1;
      if (!a.isHighlighted && b.isHighlighted) return 1;
      return a.name.localeCompare(b.name);
    });

  // Process ocean zones (no change needed here)
  const oceanZones = allAvailableMarineZones
    .map((zoneName) => ({
      name: zoneName,
      isCompleted: !!completedUnitsByOcean[zoneName],
      isHighlighted: highlightedOceanZones.includes(zoneName),
      unitCount: completedUnitsByOcean[zoneName]?.length || 0,
    }))
    .sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return -1;
      if (!a.isCompleted && b.isCompleted) return 1;
      if (a.isHighlighted && !b.isHighlighted) return -1;
      if (!a.isHighlighted && b.isHighlighted) return 1;
      return a.name.localeCompare(b.name);
    });

  console.log("Final processed countries:", countries.slice(0, 5));

  const handleCountryClick = (countryCode) => {
    console.log(`Navigating to country: ${countryCode}`);
    router.push(`/units?region=${countryCode}`);
  };

  const handleOceanClick = (oceanName) => {
    console.log(`Navigating to ocean: ${oceanName}`);
    router.push(`/units?marine_zone=${encodeURIComponent(oceanName)}`);
  };

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            🗺️ Explore Regions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click on any region to discover learning units
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("countries")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "countries"
                ? "bg-[#10b981] text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-[#10b981]"
            }`}
          >
            🌍 Countries ({countries.length})
          </button>
          <button
            onClick={() => setActiveTab("oceans")}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === "oceans"
                ? "bg-[#10b981] text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-[#10b981]"
            }`}
          >
            🌊 Marine Zones ({oceanZones.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "countries" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryClick(country.code)}
                  className={`text-left p-3 rounded-lg border transition-all hover:shadow-md ${
                    country.isCompleted
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                      : country.isHighlighted
                      ? "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-700 hover:bg-cyan-100 dark:hover:bg-cyan-900/30"
                      : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {country.name}
                    </span>
                    {country.isCompleted && (
                      <span className="text-green-600 dark:text-green-400 text-sm">
                        ✓ {country.unitCount}
                      </span>
                    )}
                    {!country.isCompleted && (
                      <span className="text-blue-600 dark:text-blue-400 text-sm">
                        {country.isHighlighted
                          ? "⏳ In Progress"
                          : "🔍 Explore"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click to explore units
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "oceans" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {oceanZones.map((ocean) => (
                <button
                  key={ocean.name}
                  onClick={() => handleOceanClick(ocean.name)}
                  className={`text-left p-3 rounded-lg border transition-all hover:shadow-md ${
                    ocean.isCompleted
                      ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      : ocean.isHighlighted
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                      : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {ocean.name}
                    </span>
                    {ocean.isCompleted && (
                      <span className="text-purple-600 dark:text-purple-400 text-sm">
                        ✓ {ocean.unitCount}
                      </span>
                    )}
                    {!ocean.isCompleted && (
                      <span className="text-blue-600 dark:text-blue-400 text-sm">
                        {ocean.isHighlighted ? "⏳ In Progress" : "🔍 Explore"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click to explore marine units
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty states */}
          {activeTab === "countries" && countries.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🌍</div>
              <p className="text-gray-600 dark:text-gray-400">
                Complete your first unit to see countries appear here!
              </p>
            </div>
          )}

          {activeTab === "oceans" && oceanZones.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">🌊</div>
              <p className="text-gray-600 dark:text-gray-400">
                Complete marine units to see ocean zones appear here!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
