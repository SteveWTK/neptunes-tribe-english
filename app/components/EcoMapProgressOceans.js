"use client";

import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
// Updated to use direct GitHub CDN link for LME data
// const oceanZonesUrl =
  // "https://raw.githubusercontent.com/datasets/lme-large-marine-ecosystems/main/polygons/geojson/lme66.geojson";
const oceanZonesUrl = "/data/lme66.geojson";

export default function EcoMapProgressOceans({
  highlightedRegions = [],
  completedUnitsByCountry = {},
  highlightedOceanZones = [],
  completedUnitsByOcean = {}, // e.g. { "North Sea": ["cod", "herring"] }
}) {
  const [geographies, setGeographies] = useState([]);
  const [oceanZones, setOceanZones] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Convert Alpha-2 to numeric for country fill
  const highlightedNumericCodes = highlightedRegions
    .map((code) => alpha2ToNumeric[code])
    .filter(Boolean);

  const completedUnitsByNumericCode = {};
  Object.entries(completedUnitsByCountry).forEach(([alpha2Code, units]) => {
    const numericCode = alpha2ToNumeric[alpha2Code];
    if (numericCode) completedUnitsByNumericCode[numericCode] = units;
  });

  useEffect(() => {
    async function fetchMapData() {
      try {
        setLoading(true);

        // Fetch country boundaries
        const countryRes = await fetch(geoUrl);
        if (!countryRes.ok) {
          throw new Error(`Failed to fetch country data: ${countryRes.status}`);
        }
        const topoJson = await countryRes.json();
        const geoData = feature(topoJson, topoJson.objects.countries).features;
        setGeographies(geoData);

        // Fetch ocean zones (LME data) with better error handling
        try {
          const oceanRes = await fetch(oceanZonesUrl);
          if (!oceanRes.ok) {
            throw new Error(
              `Failed to fetch ocean zones: ${oceanRes.status} - ${oceanRes.statusText}`
            );
          }
          const oceanData = await oceanRes.json();

          // Validate GeoJSON structure
          if (!oceanData.features || !Array.isArray(oceanData.features)) {
            throw new Error("Invalid GeoJSON structure for ocean zones");
          }

          // Filter out any non-polygon features and validate
          const validOceanZones = oceanData.features.filter((feature) => {
            if (
              feature.geometry?.type === "Polygon" ||
              feature.geometry?.type === "MultiPolygon"
            ) {
              return true;
            }
            console.warn("Skipping non-polygon feature:", feature);
            return false;
          });

          setOceanZones(validOceanZones);
          console.log(`Loaded ${validOceanZones.length} ocean zones`);
        } catch (oceanError) {
          console.warn("Could not load ocean zones:", oceanError);
          // Continue without ocean zones - map will still show countries
          setOceanZones([]);
        }
      } catch (error) {
        console.error("Error loading map data:", error);
        setError(error.message);
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
    // Try different possible property names for LME data
    return zone.properties?.LME_NAME ||
      zone.properties?.Name ||
      zone.properties?.name ||
      zone.properties?.LME_NUMBER
      ? `LME ${zone.properties.LME_NUMBER}`
      : `Marine Zone ${zone.id || "Unknown"}`;
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

  if (loading) {
    return (
      <div className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading eco-map...</p>
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
      className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px]"
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

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 150 }}
        className="w-full h-auto"
      >
        {/* Render ocean zones first (behind countries) */}
        {oceanZones.map((zone, idx) => {
          const zoneName = getOceanZoneName(zone);
          const isCompleted = isOceanZoneCompleted(zoneName);
          const isHighlighted = isOceanZoneHighlighted(zoneName);

          return (
            <Geography
              key={`ocean-${idx}`}
              geography={zone}
              fill={
                isCompleted
                  ? "rgba(34,197,94,0.6)" // Green for completed
                  : isHighlighted
                  ? "rgba(14,165,233,0.5)" // Blue for highlighted
                  : "rgba(59,130,246,0.2)" // Light blue for default ocean
              }
              stroke="#1e40af"
              strokeWidth={0.5}
              style={{
                default: { outline: "none" },
                hover: {
                  outline: "none",
                  fill: isCompleted
                    ? "rgba(34,197,94,0.8)"
                    : isHighlighted
                    ? "rgba(14,165,233,0.7)"
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
            />
          );
        })}

        {/* Render country shapes on top */}
        <Geographies geography={geographies}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const numericCode = geo.id;
              const isHighlighted =
                highlightedNumericCodes.includes(numericCode);
              const completed = completedUnitsByNumericCode[numericCode];
              const countryName =
                countryNameLookup[geo.properties.name] || geo.properties.name;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={
                    completed
                      ? "#22c55e" // Green for completed
                      : isHighlighted
                      ? "#06b6d4" // Cyan for highlighted
                      : "#e5e7eb" // Light gray for default
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
                      ? `${countryName} ✓ (${completed.length} units completed)`
                      : isHighlighted
                      ? `${countryName} (In Progress)`
                      : countryName;
                    setTooltipContent(tooltip);
                  }}
                  onMouseLeave={() => setTooltipContent(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-400 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-300 bg-opacity-40 border border-blue-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">
            Marine Ecosystems
          </span>
        </div>
      </div>
    </div>
  );
}
