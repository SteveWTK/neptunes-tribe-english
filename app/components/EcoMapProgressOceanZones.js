// app/components/EcoMapProgressOceanZones.js - Enhanced with Environmental Challenges
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

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Challenge overlay components
const OilSpillOverlay = ({ challenge, opacity = 0.8 }) => {
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.2 : 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!challenge?.challenge_data?.center) return null;

  const [lng, lat] = challenge.challenge_data.center;
  const radius = challenge.challenge_data.radius || 1;

  return (
    <Marker coordinates={[lng, lat]}>
      {/* Main spill area */}
      <circle
        r={radius * 8}
        fill="rgba(0, 0, 0, 0.7)"
        stroke="rgba(139, 69, 19, 0.9)"
        strokeWidth={2}
        opacity={opacity}
        style={{
          transform: `scale(${pulseScale})`,
          transition: "transform 2s ease-in-out",
        }}
      />
      {/* Spreading oil effect */}
      <circle
        r={radius * 12}
        fill="none"
        stroke="rgba(0, 0, 0, 0.4)"
        strokeWidth={1}
        strokeDasharray="3,3"
        opacity={opacity * 0.6}
      />
      {/* Warning icon */}
      <text
        textAnchor="middle"
        y={5}
        fontSize="14"
        fill="white"
        fontWeight="bold"
      >
        ⚠️
      </text>
    </Marker>
  );
};

const WildfireOverlay = ({ challenge, opacity = 0.8 }) => {
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker((prev) => !prev);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  if (!challenge?.challenge_data?.hotspots) return null;

  return challenge.challenge_data.hotspots.map((hotspot, index) => {
    const [lng, lat] = hotspot;
    return (
      <Marker key={`fire-${index}`} coordinates={[lng, lat]}>
        {/* Fire glow effect */}
        <circle
          r={12}
          fill={flicker ? "rgba(255, 69, 0, 0.8)" : "rgba(255, 140, 0, 0.6)"}
          opacity={opacity}
          style={{
            transition: "fill 0.8s ease-in-out",
          }}
        />
        {/* Inner fire */}
        <circle
          r={8}
          fill={flicker ? "rgba(255, 0, 0, 0.9)" : "rgba(255, 69, 0, 0.7)"}
          opacity={opacity}
        />
        {/* Fire emoji */}
        <text textAnchor="middle" y={5} fontSize="12" fill="white">
          🔥
        </text>
      </Marker>
    );
  });
};

const IceMeltOverlay = ({ challenge, opacity = 0.8 }) => {
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBreathe((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Arctic regions affected by ice melt
  const arcticRegions = [
    { coordinates: [-45, 70], label: "Greenland" },
    { coordinates: [90, 80], label: "Arctic Ocean" },
    { coordinates: [-105, 75], label: "Canadian Arctic" },
    { coordinates: [60, 75], label: "Siberian Arctic" },
  ];

  return arcticRegions.map((region, index) => (
    <Marker key={`ice-${index}`} coordinates={region.coordinates}>
      {/* Ice sheet representation */}
      <circle
        r={breathe ? 15 : 12}
        fill="rgba(173, 216, 230, 0.6)"
        stroke="rgba(70, 130, 180, 0.8)"
        strokeWidth={2}
        opacity={opacity}
        style={{
          transition: "r 3s ease-in-out",
        }}
      />
      {/* Melting effect */}
      <circle r={8} fill="rgba(135, 206, 235, 0.4)" opacity={opacity * 0.7} />
      {/* Ice emoji */}
      <text textAnchor="middle" y={5} fontSize="12">
        🧊
      </text>
    </Marker>
  ));
};

const CoralBleachingOverlay = ({ challenge, opacity = 0.8 }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade((prev) => !prev);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Great Barrier Reef coordinates
  const reefCoordinates = [145.77, -16.29];

  return (
    <Marker coordinates={reefCoordinates}>
      {/* Bleached coral area */}
      <circle
        r={18}
        fill={fade ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 182, 193, 0.6)"}
        stroke="rgba(255, 160, 122, 0.8)"
        strokeWidth={2}
        opacity={opacity}
        style={{
          transition: "fill 2.5s ease-in-out",
        }}
      />
      {/* Healthy coral (smaller, showing loss) */}
      <circle r={8} fill="rgba(255, 127, 80, 0.6)" opacity={opacity * 0.8} />
      {/* Coral emoji */}
      <text textAnchor="middle" y={5} fontSize="12">
        🪸
      </text>
    </Marker>
  );
};

// Enhanced progress indicator for challenges
const ChallengeProgressIndicator = ({ challenge, userProgress = 0 }) => {
  const progressPercentage = Math.min(
    100,
    (challenge.total_contributions / challenge.units_required) * 100
  );
  const userContribution = Math.min(
    100,
    (userProgress / challenge.units_required) * 100
  );

  const getUrgencyColor = () => {
    const daysLeft = challenge.end_date
      ? Math.ceil(
          (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
        )
      : 999;

    if (daysLeft <= 2) return "text-red-600";
    if (daysLeft <= 5) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusEmoji = () => {
    if (progressPercentage >= 100) return "✅";
    if (progressPercentage >= 75) return "🔥";
    if (progressPercentage >= 50) return "⚡";
    if (progressPercentage >= 25) return "💪";
    return "🆘";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-2 relative group">
        <h4 className="font-semibold text-sm cursor-help">
          {challenge.challenge_name}
        </h4>
        <span className="text-lg">{getStatusEmoji()}</span>

        {/* Elegant description tooltip */}
        {challenge.description && (
          <div className="absolute left-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none">
            <div className="absolute -top-2 left-6 w-4 h-4 bg-gray-900 transform rotate-45"></div>
            {challenge.description}
          </div>
        )}
      </div>

      {/* Global progress bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Global Progress</span>
          <span>
            {challenge.total_contributions}/{challenge.units_required}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* User contribution bar */}
      {userProgress > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Your Contribution</span>
            <span>{userProgress} units</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-green-500 h-1 rounded-full transition-all duration-500"
              style={{ width: `${userContribution}%` }}
            />
          </div>
        </div>
      )}

      {/* Urgency indicator */}
      {challenge.end_date && (
        <div className={`text-xs ${getUrgencyColor()}`}>
          Ends: {new Date(challenge.end_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

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

  // Render challenge overlay based on type
  const renderChallengeOverlay = (challenge) => {
    if (!showChallengeOverlays) return null;

    const opacity =
      selectedChallenge && selectedChallenge.id !== challenge.id ? 0.3 : 0.8;

    switch (challenge.challenge_type) {
      case "oil_spill":
        return (
          <OilSpillOverlay
            key={`oil-${challenge.challenge_id}`}
            challenge={challenge}
            opacity={opacity}
          />
        );
      case "wildfire":
        return (
          <WildfireOverlay
            key={`fire-${challenge.challenge_id}`}
            challenge={challenge}
            opacity={opacity}
          />
        );
      case "ice_melt":
        return (
          <IceMeltOverlay
            key={`ice-${challenge.challenge_id}`}
            challenge={challenge}
            opacity={opacity}
          />
        );
      case "coral_bleaching":
        return (
          <CoralBleachingOverlay
            key={`coral-${challenge.challenge_id}`}
            challenge={challenge}
            opacity={opacity}
          />
        );
      default:
        return null;
    }
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
      className="relative max-w-6xl mx-auto pt-4 pb-12 min-h-[500px]"
      onMouseMove={handleMouseMove}
    >
      {/* Challenge controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4 justify-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showChallengeOverlays}
            onChange={(e) => setShowChallengeOverlays(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Show Environmental Challenges</span>
        </label>

        {activeChallenges.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedChallenge(null)}
              className={`px-3 py-1 rounded text-sm ${
                !selectedChallenge
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All Challenges
            </button>
            {activeChallenges.map((challenge) => (
              <button
                key={challenge.challenge_id}
                onClick={() => setSelectedChallenge(challenge)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedChallenge?.challenge_id === challenge.challenge_id
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {challenge.challenge_type === "oil_spill" && "🛢️"}
                {challenge.challenge_type === "wildfire" && "🔥"}
                {challenge.challenge_type === "ice_melt" && "🧊"}
                {challenge.challenge_type === "coral_bleaching" && "🪸"}
                {challenge.challenge_name.split(" ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active challenges info panel */}
      {activeChallenges.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeChallenges.map((challenge) => (
            <ChallengeProgressIndicator
              key={challenge.id}
              challenge={challenge}
              userProgress={userChallengeProgress[challenge.id] || 0}
            />
          ))}
        </div>
      )}

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

            {/* Render challenge overlays */}
            {showChallengeOverlays &&
              activeChallenges
                .filter(
                  (challenge) =>
                    !selectedChallenge ||
                    selectedChallenge.challenge_id === challenge.challenge_id
                )
                .map((challenge) => renderChallengeOverlay(challenge))}
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

        {/* Challenge legend */}
        {showChallengeOverlays && activeChallenges.length > 0 && (
          <>
            <div className="w-px h-4 bg-gray-300 mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🛢️</span>
              <span className="text-gray-600 dark:text-gray-400">
                Oil Spill
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="text-gray-600 dark:text-gray-400">Wildfire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🧊</span>
              <span className="text-gray-600 dark:text-gray-400">Ice Melt</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🪸</span>
              <span className="text-gray-600 dark:text-gray-400">
                Coral Bleaching
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
