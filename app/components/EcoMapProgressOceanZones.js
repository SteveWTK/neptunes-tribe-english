// app/components/EcoMapProgressOceanZones.js - Enhanced with React Icons
"use client";

import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
import { useState, useEffect, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { feature } from "topojson-client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

// ✨ FIXED: React Icons imports with verified icons
import {
  GiOilDrum,
  GiFire, // Changed from GiForestFire
  GiIcebergs,
  GiCoral,
  GiFactory,
  GiWaterDrop,
} from "react-icons/gi";

console.log("Icon check:", {
  GiOilDrum: typeof GiOilDrum,
  GiFire: typeof GiFire,
  GiIcebergs: typeof GiIcebergs,
  GiCoral: typeof GiCoral,
  GiFactory: typeof GiFactory,
  GiWaterDrop: typeof GiWaterDrop,
});

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
export default function EcoMapProgressOceans({
  highlightedRegions = [],
  completedUnitsByCountry = {},
  highlightedOceanZones = [],
  completedUnitsByOcean = {},
  challenges = [],
  userChallengeProgress = {},
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [geographies, setGeographies] = useState([]);
  const [oceanZones, setOceanZones] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showChallengeOverlays, setShowChallengeOverlays] = useState(true);

  // Convert Alpha-2 to numeric for country fill
  const highlightedNumericCodes = highlightedRegions
    .map((code) => alpha2ToNumeric[code])
    .filter(Boolean);

  const completedUnitsByNumericCode = {};
  Object.entries(completedUnitsByCountry).forEach(([alpha2Code, units]) => {
    const numericCode = alpha2ToNumeric[alpha2Code];
    if (numericCode) completedUnitsByNumericCode[numericCode] = units;
  });

  // Helper function to find alpha2 code from numeric code
  const getAlpha2FromNumeric = (numericCode) => {
    return Object.entries(alpha2ToNumeric).find(
      ([alpha2, numeric]) => numeric === numericCode
    )?.[0];
  };

  // Fetch active environmental challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await fetch("/api/challenges/active");
        if (response.ok) {
          const challengesData = await response.json();
          setActiveChallenges(challengesData);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
      }
    };

    fetchChallenges();
  }, []);

  // Simple approach: use onMouseDown event directly on Geography components
  const handleCountryMouseDown = (geo) => {
    const numericCode = geo.id;
    const alpha2Code = getAlpha2FromNumeric(numericCode);
    const countryName =
      countryNameLookup[geo.properties.name] || geo.properties.name;

    console.log("Country mousedown:", { numericCode, alpha2Code, countryName });

    if (alpha2Code) {
      console.log(`Navigating to country: ${countryName} (${alpha2Code})`);
      router.push(`/units?region=${alpha2Code}`);
    }
  };

  const handleOceanMouseDown = (geo) => {
    const zoneName = getOceanZoneName(geo);
    console.log("Ocean mousedown:", zoneName);
    console.log(`Navigating to ocean zone: ${zoneName}`);
    router.push(`/units?marine_zone=${encodeURIComponent(zoneName)}`);
  };

  // Simple ocean zones based on major ocean basins (fallback)
  const createSimpleOceanZones = () => {
    return [
      {
        id: "pacific",
        properties: { LME_NAME: "Pacific Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, -60],
              [180, -60],
              [180, 60],
              [-180, 60],
              [-180, -60],
            ],
          ],
        },
      },
      {
        id: "atlantic",
        properties: { LME_NAME: "Atlantic Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-80, -60],
              [-10, -60],
              [-10, 70],
              [-80, 70],
              [-80, -60],
            ],
          ],
        },
      },
      {
        id: "indian",
        properties: { LME_NAME: "Indian Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [20, -60],
              [120, -60],
              [120, 30],
              [20, 30],
              [20, -60],
            ],
          ],
        },
      },
      {
        id: "arctic",
        properties: { LME_NAME: "Arctic Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, 70],
              [180, 70],
              [180, 90],
              [-180, 90],
              [-180, 70],
            ],
          ],
        },
      },
      {
        id: "southern",
        properties: { LME_NAME: "Southern Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, -90],
              [180, -90],
              [180, -60],
              [-180, -60],
              [-180, -90],
            ],
          ],
        },
      },
    ];
  };

  // Helper function to try loading ocean zones
  async function tryLoadOceanZones() {
    try {
      console.log("Trying to load local LME data...");
      setDebugInfo("Loading local LME data...");

      const response = await fetch("/data/lme66.geojson");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("LME ocean zones data loaded:", {
        type: data.type,
        featuresCount: data.features?.length,
        firstFeature: data.features?.[0],
      });

      if (!data.features || !Array.isArray(data.features)) {
        throw new Error("Invalid GeoJSON structure");
      }

      if (data.features.length === 0) {
        throw new Error("No features found in GeoJSON");
      }

      const validFeatures = data.features
        .filter((feature, index) => {
          if (!feature.geometry) {
            console.warn(`Feature ${index} has no geometry`);
            return false;
          }

          if (!["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
            console.warn(
              `Feature ${index} has unsupported geometry type: ${feature.geometry.type}`
            );
            return false;
          }

          if (!feature.properties) {
            console.warn(`Feature ${index} has no properties`);
            return false;
          }

          return true;
        })
        .map((feature, index) => ({
          ...feature,
          id: feature.id || `lme-${index}`,
          properties: {
            ...feature.properties,
            LME_NAME:
              feature.properties.LME_NAME ||
              feature.properties.Name ||
              feature.properties.name ||
              `Marine Zone ${feature.properties.LME_NUMBER || index + 1}`,
          },
        }));

      console.log(
        `Successfully processed ${validFeatures.length} valid ocean zones`
      );
      setDebugInfo(`✅ Loaded ${validFeatures.length} LME zones`);

      const exampleNames = validFeatures
        .slice(0, 5)
        .map((f) => f.properties.LME_NAME);
      console.log("Example zone names:", exampleNames);

      return validFeatures;
    } catch (error) {
      console.warn("Failed to load LME data:", error.message);
      setDebugInfo(
        `❌ LME data failed: ${error.message}. Using simple ocean zones.`
      );

      const simpleZones = createSimpleOceanZones();
      console.log("Using simple ocean zones:", simpleZones.length);
      return simpleZones;
    }
  }

  useEffect(() => {
    async function fetchMapData() {
      try {
        setLoading(true);
        setDebugInfo("Loading map data...");

        console.log("Loading countries...");
        const countryRes = await fetch(geoUrl);
        if (!countryRes.ok) {
          throw new Error(`Failed to fetch country data: ${countryRes.status}`);
        }
        const topoJson = await countryRes.json();
        const geoData = feature(topoJson, topoJson.objects.countries).features;
        setGeographies(geoData);
        console.log(`Loaded ${geoData.length} countries`);

        const oceanZoneData = await tryLoadOceanZones();
        setOceanZones(oceanZoneData);
      } catch (error) {
        console.error("Error loading map data:", error);
        setError(error.message);
        setDebugInfo(`❌ Fatal error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchMapData();
  }, []);

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const getOceanZoneName = (zone) => {
    return (
      zone.properties?.LME_NAME ||
      zone.properties?.Name ||
      zone.properties?.name ||
      `Marine Zone ${zone.id || "Unknown"}`
    );
  };

  const isOceanZoneCompleted = (zoneName) => {
    const isCompleted =
      completedUnitsByOcean[zoneName] &&
      completedUnitsByOcean[zoneName].length > 0;
    return isCompleted;
  };

  const isOceanZoneHighlighted = (zoneName) => {
    const isHighlighted = highlightedOceanZones.includes(zoneName);
    return isHighlighted;
  };

  const isCountryCompleted = (numericCode) => {
    const isCompleted =
      completedUnitsByNumericCode[numericCode] &&
      completedUnitsByNumericCode[numericCode].length > 0;
    return isCompleted;
  };

  const isCountryHighlighted = (numericCode) => {
    const isHighlighted = highlightedNumericCodes.includes(numericCode);
    return isHighlighted;
  };

  if (loading) {
    return (
      <div className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading eco-map...</p>
          {debugInfo && (
            <p className="text-sm text-gray-500 mt-2">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px] flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 mb-2">
            Failed to load map data
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          {debugInfo && (
            <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative max-w-6xl mx-auto pt-2 pb-12 min-h-[500px]"
      onMouseMove={handleMouseMove}
    >
      {tooltipContent && (
        <div
          className="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg z-10 pointer-events-none"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 40,
            maxWidth: "200px",
          }}
        >
          {tooltipContent}
        </div>
      )}

      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{
            center: [0, -35],
            scale: 150,
          }}
          className="w-full h-auto"
        >
          <ZoomableGroup>
            {/* Render ocean zones first (behind countries) */}
            <Geographies geography={oceanZones}>
              {({ geographies: oceanGeographies }) =>
                oceanGeographies.map((geo) => {
                  const zoneName = getOceanZoneName(geo);
                  const isCompleted = isOceanZoneCompleted(zoneName);
                  const isHighlighted = isOceanZoneHighlighted(zoneName);

                  return (
                    <Geography
                      key={`ocean-${geo.rsmKey || geo.id}`}
                      geography={geo}
                      fill={
                        isCompleted
                          ? "rgba(168, 85, 247, 0.7)" // Purple for completed ocean zones
                          : isHighlighted
                          ? "rgba(14,165,233,0.6)" // Blue for highlighted ocean zones
                          : "rgba(59,130,246,0.2)" // Light blue for default ocean
                      }
                      stroke="#1e40af"
                      strokeWidth={0.8}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          outline: "none",
                          fill: isCompleted
                            ? "rgba(168, 85, 247, 0.9)"
                            : isHighlighted
                            ? "rgba(14,165,233,0.8)"
                            : "rgba(59,130,246,0.4)",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                        const tooltip = isCompleted
                          ? `${zoneName} ✓ (${
                              completedUnitsByOcean[zoneName]?.length || 0
                            } units completed)`
                          : isHighlighted
                          ? `${zoneName} (In Progress)`
                          : zoneName;
                        setTooltipContent(tooltip);
                      }}
                      onMouseLeave={() => setTooltipContent(null)}
                      onMouseDown={() => handleOceanMouseDown(geo)}
                    />
                  );
                })
              }
            </Geographies>

            {/* Render country shapes on top */}
            <Geographies geography={geographies}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numericCode = geo.id;
                  const isHighlighted = isCountryHighlighted(numericCode);
                  const completed = isCountryCompleted(numericCode);
                  const countryName =
                    countryNameLookup[geo.properties.name] ||
                    geo.properties.name;
                  const completedUnits =
                    completedUnitsByNumericCode[numericCode];

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={
                        completed
                          ? "#22c55e" // Green for completed countries
                          : isHighlighted
                          ? "#06b6d4" // Cyan for highlighted countries
                          : "rgba(229,231,235,0.8)" // Semi-transparent light gray for default
                      }
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          outline: "none",
                          fill: completed
                            ? "#16a34a"
                            : isHighlighted
                            ? "#0891b2"
                            : "#d1d5db",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                        const tooltip = completed
                          ? `${countryName} ✓ (${
                              completedUnits?.length || 0
                            } units completed)`
                          : isHighlighted
                          ? `${countryName} (In Progress)`
                          : countryName;
                        setTooltipContent(tooltip);
                      }}
                      onMouseLeave={() => setTooltipContent(null)}
                      onMouseDown={() => handleCountryMouseDown(geo)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Enhanced Legend */}
      <div className="mt-4 flex flex-wrap justify-center align-middle gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-400 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Countries In Progress
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Countries Completed
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 bg-opacity-60 border border-blue-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Marine Zones In Progress
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 bg-opacity-70 border border-purple-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Marine Zones Completed
          </span>
        </div>
      </div>
    </div>
  );
}
