// app/components/EcoMapProgressOceanZones.js - Enhanced with Weekly Themes
"use client";

import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
import { useState, useEffect, useRef } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { feature } from "topojson-client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, Eye } from "lucide-react";
import Link from "next/link";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function EcoMapProgressOceans({
  highlightedRegions = [],
  completedUnitsByCountry = {},
  highlightedOceanZones = [],
  completedUnitsByOcean = {},
  challenges = [],
  userChallengeProgress = {},
  currentWeeklyTheme = null,
  themeImages = [],
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const [geographies, setGeographies] = useState([]);
  const [oceanZones, setOceanZones] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [showThemePopup, setShowThemePopup] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");
  const [hoveredRegion, setHoveredRegion] = useState(null);

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

  // Check if region is part of current week's theme
  const isThemeRegion = (regionCode, zoneName = null) => {
    if (!currentWeeklyTheme) return false;

    if (regionCode) {
      return currentWeeklyTheme.featured_regions?.includes(
        regionCode.toUpperCase()
      );
    }

    if (zoneName) {
      return currentWeeklyTheme.featured_marine_zones?.includes(zoneName);
    }

    return false;
  };

  const handleCountryMouseDown = (geo) => {
    const numericCode = geo.id;
    const alpha2Code = getAlpha2FromNumeric(numericCode);
    const countryName =
      countryNameLookup[geo.properties.name] || geo.properties.name;

    if (alpha2Code) {
      router.push(`/units?region=${alpha2Code}`);
    }
  };

  const handleOceanMouseDown = (geo) => {
    const zoneName = getOceanZoneName(geo);
    router.push(`/units?marine_zone=${encodeURIComponent(zoneName)}`);
  };

  const handleThemeRegionHover = (
    regionType,
    regionName,
    regionCode = null
  ) => {
    if (!currentWeeklyTheme) return;

    setHoveredRegion({ type: regionType, name: regionName, code: regionCode });
    setShowThemePopup(true);
  };

  const handleThemeRegionLeave = () => {
    setHoveredRegion(null);
    setShowThemePopup(false);
  };

  // Create simple ocean zones (your existing function)
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

  // Your existing ocean loading function
  async function tryLoadOceanZones() {
    try {
      console.log("Trying to load local LME data...");
      setDebugInfo("Loading local LME data...");

      const response = await fetch("/data/lme66.geojson");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.features || !Array.isArray(data.features)) {
        throw new Error("Invalid GeoJSON structure");
      }

      const validFeatures = data.features
        .filter((feature, index) => {
          return (
            feature.geometry &&
            ["Polygon", "MultiPolygon"].includes(feature.geometry.type) &&
            feature.properties
          );
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

      setDebugInfo(`✅ Loaded ${validFeatures.length} LME zones`);
      return validFeatures;
    } catch (error) {
      console.warn("Failed to load LME data:", error.message);
      setDebugInfo(
        `❌ LME data failed: ${error.message}. Using simple ocean zones.`
      );
      return createSimpleOceanZones();
    }
  }

  useEffect(() => {
    async function fetchMapData() {
      try {
        setLoading(true);
        setDebugInfo("Loading map data...");

        const countryRes = await fetch(geoUrl);
        if (!countryRes.ok) {
          throw new Error(`Failed to fetch country data: ${countryRes.status}`);
        }
        const topoJson = await countryRes.json();
        const geoData = feature(topoJson, topoJson.objects.countries).features;
        setGeographies(geoData);

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
    return (
      completedUnitsByOcean[zoneName] &&
      completedUnitsByOcean[zoneName].length > 0
    );
  };

  const isOceanZoneHighlighted = (zoneName) => {
    return highlightedOceanZones.includes(zoneName);
  };

  const isCountryCompleted = (numericCode) => {
    return (
      completedUnitsByNumericCode[numericCode] &&
      completedUnitsByNumericCode[numericCode].length > 0
    );
  };

  const isCountryHighlighted = (numericCode) => {
    return highlightedNumericCodes.includes(numericCode);
  };

  // Get country/zone fill color with theme highlighting
  const getCountryFill = (geo, isCompleted, isHighlighted) => {
    const numericCode = geo.id;
    const alpha2Code = getAlpha2FromNumeric(numericCode);
    const isThemed = isThemeRegion(alpha2Code);

    if (isCompleted) {
      return isThemed ? "#22c55e" : "#16a34a"; // Bright green for themed, darker for non-themed
    }
    if (isHighlighted) {
      return isThemed ? "#06b6d4" : "#0891b2"; // Bright cyan for themed, darker for non-themed
    }

    // Default colors - themed regions more visible
    return isThemed ? "rgba(59, 130, 246, 0.3)" : "rgba(229, 231, 235, 0.4)";
  };

  const getOceanFill = (geo, isCompleted, isHighlighted) => {
    const zoneName = getOceanZoneName(geo);
    const isThemed = isThemeRegion(null, zoneName);

    if (isCompleted) {
      return isThemed ? "rgba(168, 85, 247, 0.8)" : "rgba(168, 85, 247, 0.6)";
    }
    if (isHighlighted) {
      return isThemed ? "rgba(14, 165, 233, 0.7)" : "rgba(14, 165, 233, 0.5)";
    }

    // Default - themed zones more visible
    return isThemed ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.1)";
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
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative max-w-6xl mx-auto pt-2 pb-12 min-h-[500px]"
      onMouseMove={handleMouseMove}
    >
      {/* Weekly Theme Header */}
      {/* {currentWeeklyTheme && (
        <div data-tour="weekly-theme" className="mb-6 mx-4">
          <div className="bg-gradient-to-r  from-blue-800 via-blue-900 to-green-700 dark:from-blue-800 dark:via-blue-900 dark:to-green-700 text-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-6 h-6" />
              <h2 className="text-2xl font-bold">
                {lang === "pt" ? "Tema desta Semana" : "This Week's Theme"}
              </h2>
            </div>
            <Link href="/theme">
              <h3 className="text-xl font-semibold mb-4 hover:text-accent-200">
                {lang === "pt"
                  ? currentWeeklyTheme.theme_title_pt
                  : currentWeeklyTheme.theme_title}
              </h3>
            </Link>
            <p className="text-blue-100 mb-4">
              {lang === "pt"
                ? currentWeeklyTheme.theme_description_pt
                : currentWeeklyTheme.theme_description}
            </p>
            <div className="flex items-center gap-4 text-sm text-blue-100">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {currentWeeklyTheme.featured_regions?.length || 0} regions
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {currentWeeklyTheme.featured_marine_zones?.length || 0} marine
                zones
              </span>
            </div>
          </div>
        </div>
      )} */}

      {/* Tooltip for regular regions */}
      {tooltipContent && !showThemePopup && (
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

      {/* Enhanced Adventure Popup */}
      <AnimatePresence>
        {showThemePopup && hoveredRegion && currentWeeklyTheme && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20 pointer-events-none"
            style={{
              left: Math.min(mousePosition.x + 15, window.innerWidth - 350),
              top: Math.max(mousePosition.y - 200, 10),
              width: "320px",
              maxHeight: "400px",
            }}
          >
            <div className="p-4">
              {/* Adventure Header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {lang === "pt" ? "Mundo deste Mês" : "This Month's World"}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-100">
                {lang === "pt"
                  ? currentWeeklyTheme.theme_title_pt
                  : currentWeeklyTheme.theme_title}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                {lang === "pt"
                  ? currentWeeklyTheme.theme_description_pt
                  : currentWeeklyTheme.theme_description}
              </p>

              {/* Hovered Region Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {hoveredRegion.type === "country"
                      ? "Country"
                      : "Marine Zone"}
                  </span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">
                  {hoveredRegion.name}
                </p>
              </div>

              {/* Theme Images */}
              {themeImages && themeImages.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-3 gap-2">
                    {themeImages.slice(0, 6).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="text-center">
                <Link
                  href="/theme"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  <Eye className="w-4 h-4" />
                  {lang === "pt" ? "Clique para explorar" : "Click to explore"}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Map */}
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
            {/* Ocean zones */}
            <Geographies geography={oceanZones}>
              {({ geographies: oceanGeographies }) =>
                oceanGeographies.map((geo) => {
                  const zoneName = getOceanZoneName(geo);
                  const isCompleted = isOceanZoneCompleted(zoneName);
                  const isHighlighted = isOceanZoneHighlighted(zoneName);
                  const isThemed = isThemeRegion(null, zoneName);

                  return (
                    <Geography
                      key={`ocean-${geo.rsmKey || geo.id}`}
                      geography={geo}
                      fill={getOceanFill(geo, isCompleted, isHighlighted)}
                      stroke={isThemed ? "#1e40af" : "#64748b"}
                      strokeWidth={isThemed ? 1.2 : 0.8}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          outline: "none",
                          fill: isCompleted
                            ? "rgba(168, 85, 247, 0.9)"
                            : isHighlighted
                            ? "rgba(14,165,233,0.8)"
                            : isThemed
                            ? "rgba(59,130,246,0.5)"
                            : "rgba(59,130,246,0.3)",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                        if (isThemed && currentWeeklyTheme) {
                          handleThemeRegionHover("marine", zoneName);
                        } else {
                          const tooltip = isCompleted
                            ? `${zoneName} ✓ (${
                                completedUnitsByOcean[zoneName]?.length || 0
                              } units completed)`
                            : isHighlighted
                            ? `${zoneName} (In Progress)`
                            : zoneName;
                          setTooltipContent(tooltip);
                        }
                      }}
                      onMouseLeave={() => {
                        if (isThemed) {
                          handleThemeRegionLeave();
                        } else {
                          setTooltipContent(null);
                        }
                      }}
                      onMouseDown={() => handleOceanMouseDown(geo)}
                    />
                  );
                })
              }
            </Geographies>

            {/* Countries */}
            <Geographies geography={geographies}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numericCode = geo.id;
                  const alpha2Code = getAlpha2FromNumeric(numericCode);
                  const isHighlighted = isCountryHighlighted(numericCode);
                  const completed = isCountryCompleted(numericCode);
                  const isThemed = isThemeRegion(alpha2Code);
                  const countryName =
                    countryNameLookup[geo.properties.name] ||
                    geo.properties.name;
                  const completedUnits =
                    completedUnitsByNumericCode[numericCode];

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getCountryFill(geo, completed, isHighlighted)}
                      stroke={isThemed ? "#ffffff" : "#e5e7eb"}
                      strokeWidth={isThemed ? 0.8 : 0.3}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          outline: "none",
                          fill: completed
                            ? "#16a34a"
                            : isHighlighted
                            ? "#0891b2"
                            : isThemed
                            ? "rgba(59, 130, 246, 0.5)"
                            : "#d1d5db",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                        if (isThemed && currentWeeklyTheme) {
                          handleThemeRegionHover(
                            "country",
                            countryName,
                            alpha2Code
                          );
                        } else {
                          const tooltip = completed
                            ? `${countryName} ✓ (${
                                completedUnits?.length || 0
                              } units completed)`
                            : isHighlighted
                            ? `${countryName} (In Progress)`
                            : countryName;
                          setTooltipContent(tooltip);
                        }
                      }}
                      onMouseLeave={() => {
                        if (isThemed) {
                          handleThemeRegionLeave();
                        } else {
                          setTooltipContent(null);
                        }
                      }}
                      onMouseDown={() => handleCountryMouseDown(geo)}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Enhanced Legend with Weekly Adventure */}
      {/* <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        {currentWeeklyTheme && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900 rounded-full">
            <div className="w-4 h-4 bg-blue-400 rounded border-2 border-blue-600"></div>
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              {lang === "pt" ? "Tema desta Semana" : "This Week's Theme"}
            </span>
          </div>
        )} */}
      {/* <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Not Started</span>
        </div> */}
      {/* <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-400 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Countries In Progress
          </span>
        </div> */}
      {/* <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Countries Completed
          </span>
        </div> */}
      {/* <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 bg-opacity-60 border border-blue-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Marine Zones In Progress
          </span>
        </div> */}
      {/* <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 bg-opacity-70 border border-purple-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Marine Zones Completed
          </span>
        </div> */}
      {/* </div> */}
    </div>
  );
}

// app/components/EcoMapProgressOceanZones.js - Enhanced with React Icons
// "use client";

// import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
// import { useState, useEffect, useRef } from "react";
// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   Marker,
//   ZoomableGroup,
// } from "react-simple-maps";
// import { feature } from "topojson-client";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { motion } from "framer-motion";

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
// export default function EcoMapProgressOceans({
//   highlightedRegions = [],
//   completedUnitsByCountry = {},
//   highlightedOceanZones = [],
//   completedUnitsByOcean = {},
//   challenges = [],
//   userChallengeProgress = {},
// }) {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [geographies, setGeographies] = useState([]);
//   const [oceanZones, setOceanZones] = useState([]);
//   const [tooltipContent, setTooltipContent] = useState(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [debugInfo, setDebugInfo] = useState("");
//   // const [activeChallenges, setActiveChallenges] = useState([]);
//   // const [selectedChallenge, setSelectedChallenge] = useState(null);
//   // const [showChallengeOverlays, setShowChallengeOverlays] = useState(true);

//   // Convert Alpha-2 to numeric for country fill
//   const highlightedNumericCodes = highlightedRegions
//     .map((code) => alpha2ToNumeric[code])
//     .filter(Boolean);

//   const completedUnitsByNumericCode = {};
//   Object.entries(completedUnitsByCountry).forEach(([alpha2Code, units]) => {
//     const numericCode = alpha2ToNumeric[alpha2Code];
//     if (numericCode) completedUnitsByNumericCode[numericCode] = units;
//   });

//   // Helper function to find alpha2 code from numeric code
//   const getAlpha2FromNumeric = (numericCode) => {
//     return Object.entries(alpha2ToNumeric).find(
//       ([alpha2, numeric]) => numeric === numericCode
//     )?.[0];
//   };

//   // Fetch active environmental challenges
//   // useEffect(() => {
//   //   const fetchChallenges = async () => {
//   //     try {
//   //       const response = await fetch("/api/challenges/active");
//   //       if (response.ok) {
//   //         const challengesData = await response.json();
//   //         setActiveChallenges(challengesData);
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching challenges:", error);
//   //     }
//   //   };

//   //   fetchChallenges();
//   // }, []);

//   // Simple approach: use onMouseDown event directly on Geography components
//   const handleCountryMouseDown = (geo) => {
//     const numericCode = geo.id;
//     const alpha2Code = getAlpha2FromNumeric(numericCode);
//     const countryName =
//       countryNameLookup[geo.properties.name] || geo.properties.name;

//     console.log("Country mousedown:", { numericCode, alpha2Code, countryName });

//     if (alpha2Code) {
//       console.log(`Navigating to country: ${countryName} (${alpha2Code})`);
//       router.push(`/units?region=${alpha2Code}`);
//     }
//   };

//   const handleOceanMouseDown = (geo) => {
//     const zoneName = getOceanZoneName(geo);
//     console.log("Ocean mousedown:", zoneName);
//     console.log(`Navigating to ocean zone: ${zoneName}`);
//     router.push(`/units?marine_zone=${encodeURIComponent(zoneName)}`);
//   };

//   // Simple ocean zones based on major ocean basins (fallback)
//   const createSimpleOceanZones = () => {
//     return [
//       {
//         id: "pacific",
//         properties: { LME_NAME: "Pacific Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [-180, -60],
//               [180, -60],
//               [180, 60],
//               [-180, 60],
//               [-180, -60],
//             ],
//           ],
//         },
//       },
//       {
//         id: "atlantic",
//         properties: { LME_NAME: "Atlantic Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [-80, -60],
//               [-10, -60],
//               [-10, 70],
//               [-80, 70],
//               [-80, -60],
//             ],
//           ],
//         },
//       },
//       {
//         id: "indian",
//         properties: { LME_NAME: "Indian Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [20, -60],
//               [120, -60],
//               [120, 30],
//               [20, 30],
//               [20, -60],
//             ],
//           ],
//         },
//       },
//       {
//         id: "arctic",
//         properties: { LME_NAME: "Arctic Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [-180, 70],
//               [180, 70],
//               [180, 90],
//               [-180, 90],
//               [-180, 70],
//             ],
//           ],
//         },
//       },
//       {
//         id: "southern",
//         properties: { LME_NAME: "Southern Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [-180, -90],
//               [180, -90],
//               [180, -60],
//               [-180, -60],
//               [-180, -90],
//             ],
//           ],
//         },
//       },
//     ];
//   };

//   // Helper function to try loading ocean zones
//   async function tryLoadOceanZones() {
//     try {
//       console.log("Trying to load local LME data...");
//       setDebugInfo("Loading local LME data...");

//       const response = await fetch("/data/lme66.geojson");
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const data = await response.json();
//       console.log("LME ocean zones data loaded:", {
//         type: data.type,
//         featuresCount: data.features?.length,
//         firstFeature: data.features?.[0],
//       });

//       if (!data.features || !Array.isArray(data.features)) {
//         throw new Error("Invalid GeoJSON structure");
//       }

//       if (data.features.length === 0) {
//         throw new Error("No features found in GeoJSON");
//       }

//       const validFeatures = data.features
//         .filter((feature, index) => {
//           if (!feature.geometry) {
//             console.warn(`Feature ${index} has no geometry`);
//             return false;
//           }

//           if (!["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
//             console.warn(
//               `Feature ${index} has unsupported geometry type: ${feature.geometry.type}`
//             );
//             return false;
//           }

//           if (!feature.properties) {
//             console.warn(`Feature ${index} has no properties`);
//             return false;
//           }

//           return true;
//         })
//         .map((feature, index) => ({
//           ...feature,
//           id: feature.id || `lme-${index}`,
//           properties: {
//             ...feature.properties,
//             LME_NAME:
//               feature.properties.LME_NAME ||
//               feature.properties.Name ||
//               feature.properties.name ||
//               `Marine Zone ${feature.properties.LME_NUMBER || index + 1}`,
//           },
//         }));

//       console.log(
//         `Successfully processed ${validFeatures.length} valid ocean zones`
//       );
//       setDebugInfo(`✅ Loaded ${validFeatures.length} LME zones`);

//       const exampleNames = validFeatures
//         .slice(0, 5)
//         .map((f) => f.properties.LME_NAME);
//       console.log("Example zone names:", exampleNames);

//       return validFeatures;
//     } catch (error) {
//       console.warn("Failed to load LME data:", error.message);
//       setDebugInfo(
//         `❌ LME data failed: ${error.message}. Using simple ocean zones.`
//       );

//       const simpleZones = createSimpleOceanZones();
//       console.log("Using simple ocean zones:", simpleZones.length);
//       return simpleZones;
//     }
//   }

//   useEffect(() => {
//     async function fetchMapData() {
//       try {
//         setLoading(true);
//         setDebugInfo("Loading map data...");

//         console.log("Loading countries...");
//         const countryRes = await fetch(geoUrl);
//         if (!countryRes.ok) {
//           throw new Error(`Failed to fetch country data: ${countryRes.status}`);
//         }
//         const topoJson = await countryRes.json();
//         const geoData = feature(topoJson, topoJson.objects.countries).features;
//         setGeographies(geoData);
//         console.log(`Loaded ${geoData.length} countries`);

//         const oceanZoneData = await tryLoadOceanZones();
//         setOceanZones(oceanZoneData);
//       } catch (error) {
//         console.error("Error loading map data:", error);
//         setError(error.message);
//         setDebugInfo(`❌ Fatal error: ${error.message}`);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchMapData();
//   }, []);

//   const handleMouseMove = (event) => {
//     setMousePosition({ x: event.clientX, y: event.clientY });
//   };

//   const getOceanZoneName = (zone) => {
//     return (
//       zone.properties?.LME_NAME ||
//       zone.properties?.Name ||
//       zone.properties?.name ||
//       `Marine Zone ${zone.id || "Unknown"}`
//     );
//   };

//   const isOceanZoneCompleted = (zoneName) => {
//     const isCompleted =
//       completedUnitsByOcean[zoneName] &&
//       completedUnitsByOcean[zoneName].length > 0;
//     return isCompleted;
//   };

//   const isOceanZoneHighlighted = (zoneName) => {
//     const isHighlighted = highlightedOceanZones.includes(zoneName);
//     return isHighlighted;
//   };

//   const isCountryCompleted = (numericCode) => {
//     const isCompleted =
//       completedUnitsByNumericCode[numericCode] &&
//       completedUnitsByNumericCode[numericCode].length > 0;
//     return isCompleted;
//   };

//   const isCountryHighlighted = (numericCode) => {
//     const isHighlighted = highlightedNumericCodes.includes(numericCode);
//     return isHighlighted;
//   };

//   if (loading) {
//     return (
//       <div className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px] flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
//           <p className="text-gray-600 dark:text-gray-400">Loading eco-map...</p>
//           {debugInfo && (
//             <p className="text-sm text-gray-500 mt-2">{debugInfo}</p>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px] flex items-center justify-center">
//         <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
//           <p className="text-red-600 dark:text-red-400 mb-2">
//             Failed to load map data
//           </p>
//           <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
//           {debugInfo && (
//             <p className="text-xs text-gray-500 mt-2">{debugInfo}</p>
//           )}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div
//       className="relative max-w-6xl mx-auto pt-2 pb-12 min-h-[500px]"
//       onMouseMove={handleMouseMove}
//     >
//       {tooltipContent && (
//         <div
//           className="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg z-10 pointer-events-none"
//           style={{
//             left: mousePosition.x + 10,
//             top: mousePosition.y - 40,
//             maxWidth: "200px",
//           }}
//         >
//           {tooltipContent}
//         </div>
//       )}

//       <div className="relative aspect-[16/9] w-full overflow-hidden">
//         <ComposableMap
//           projection="geoNaturalEarth1"
//           projectionConfig={{
//             center: [0, -35],
//             scale: 150,
//           }}
//           className="w-full h-auto"
//         >
//           <ZoomableGroup>
//             {/* Render ocean zones first (behind countries) */}
//             <Geographies geography={oceanZones}>
//               {({ geographies: oceanGeographies }) =>
//                 oceanGeographies.map((geo) => {
//                   const zoneName = getOceanZoneName(geo);
//                   const isCompleted = isOceanZoneCompleted(zoneName);
//                   const isHighlighted = isOceanZoneHighlighted(zoneName);

//                   return (
//                     <Geography
//                       key={`ocean-${geo.rsmKey || geo.id}`}
//                       geography={geo}
//                       fill={
//                         isCompleted
//                           ? "rgba(168, 85, 247, 0.7)" // Purple for completed ocean zones
//                           : isHighlighted
//                           ? "rgba(14,165,233,0.6)" // Blue for highlighted ocean zones
//                           : "rgba(59,130,246,0.2)" // Light blue for default ocean
//                       }
//                       stroke="#1e40af"
//                       strokeWidth={0.8}
//                       style={{
//                         default: { outline: "none" },
//                         hover: {
//                           outline: "none",
//                           fill: isCompleted
//                             ? "rgba(168, 85, 247, 0.9)"
//                             : isHighlighted
//                             ? "rgba(14,165,233,0.8)"
//                             : "rgba(59,130,246,0.4)",
//                         },
//                         pressed: { outline: "none" },
//                       }}
//                       onMouseEnter={() => {
//                         const tooltip = isCompleted
//                           ? `${zoneName} ✓ (${
//                               completedUnitsByOcean[zoneName]?.length || 0
//                             } units completed)`
//                           : isHighlighted
//                           ? `${zoneName} (In Progress)`
//                           : zoneName;
//                         setTooltipContent(tooltip);
//                       }}
//                       onMouseLeave={() => setTooltipContent(null)}
//                       onMouseDown={() => handleOceanMouseDown(geo)}
//                     />
//                   );
//                 })
//               }
//             </Geographies>

//             {/* Render country shapes on top */}
//             <Geographies geography={geographies}>
//               {({ geographies }) =>
//                 geographies.map((geo) => {
//                   const numericCode = geo.id;
//                   const isHighlighted = isCountryHighlighted(numericCode);
//                   const completed = isCountryCompleted(numericCode);
//                   const countryName =
//                     countryNameLookup[geo.properties.name] ||
//                     geo.properties.name;
//                   const completedUnits =
//                     completedUnitsByNumericCode[numericCode];

//                   return (
//                     <Geography
//                       key={geo.rsmKey}
//                       geography={geo}
//                       fill={
//                         completed
//                           ? "#22c55e" // Green for completed countries
//                           : isHighlighted
//                           ? "#06b6d4" // Cyan for highlighted countries
//                           : "rgba(229,231,235,0.8)" // Semi-transparent light gray for default
//                       }
//                       stroke="#ffffff"
//                       strokeWidth={0.5}
//                       style={{
//                         default: { outline: "none" },
//                         hover: {
//                           outline: "none",
//                           fill: completed
//                             ? "#16a34a"
//                             : isHighlighted
//                             ? "#0891b2"
//                             : "#d1d5db",
//                         },
//                         pressed: { outline: "none" },
//                       }}
//                       onMouseEnter={() => {
//                         const tooltip = completed
//                           ? `${countryName} ✓ (${
//                               completedUnits?.length || 0
//                             } units completed)`
//                           : isHighlighted
//                           ? `${countryName} (In Progress)`
//                           : countryName;
//                         setTooltipContent(tooltip);
//                       }}
//                       onMouseLeave={() => setTooltipContent(null)}
//                       onMouseDown={() => handleCountryMouseDown(geo)}
//                     />
//                   );
//                 })
//               }
//             </Geographies>
//           </ZoomableGroup>
//         </ComposableMap>
//       </div>

//       {/* Enhanced Legend */}
//       <div className="mt-4 flex flex-wrap justify-center align-middle gap-4 text-sm">
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">Not Started</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-cyan-400 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">
//             Countries In Progress
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-green-500 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">
//             Countries Completed
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-blue-400 bg-opacity-60 border border-blue-600 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">
//             Marine Zones In Progress
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-purple-500 bg-opacity-70 border border-purple-600 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">
//             Marine Zones Completed
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }
