"use client";

import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Reliable CDN URLs for marine ecosystem data
const oceanZonesUrls = [
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json", // We'll use ocean features from this
  "/data/lme66.geojson", // Your local fallback
];

export default function EcoMapProgressOceans({
  highlightedRegions = [],
  completedUnitsByCountry = {},
  highlightedOceanZones = [],
  completedUnitsByOcean = {},
}) {
  const [geographies, setGeographies] = useState([]);
  const [oceanZones, setOceanZones] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  // Convert Alpha-2 to numeric for country fill
  const highlightedNumericCodes = highlightedRegions
    .map((code) => alpha2ToNumeric[code])
    .filter(Boolean);

  const completedUnitsByNumericCode = {};
  Object.entries(completedUnitsByCountry).forEach(([alpha2Code, units]) => {
    const numericCode = alpha2ToNumeric[alpha2Code];
    if (numericCode) completedUnitsByNumericCode[numericCode] = units;
  });

  // Debug logging
  useEffect(() => {
    console.log('EcoMapProgressOceans props:', {
      highlightedRegions,
      completedUnitsByCountry,
      highlightedOceanZones,
      completedUnitsByOcean,
      highlightedNumericCodes,
      completedUnitsByNumericCode
    });
  }, [highlightedRegions, completedUnitsByCountry, highlightedOceanZones, completedUnitsByOcean]);

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
              [-180, -60], [180, -60], [180, 60], [-180, 60], [-180, -60]
            ]
          ]
        }
      },
      {
        id: "atlantic",
        properties: { LME_NAME: "Atlantic Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-80, -60], [-10, -60], [-10, 70], [-80, 70], [-80, -60]
            ]
          ]
        }
      },
      {
        id: "indian",
        properties: { LME_NAME: "Indian Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [20, -60], [120, -60], [120, 30], [20, 30], [20, -60]
            ]
          ]
        }
      },
      {
        id: "arctic",
        properties: { LME_NAME: "Arctic Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, 70], [180, 70], [180, 90], [-180, 90], [-180, 70]
            ]
          ]
        }
      },
      {
        id: "southern",
        properties: { LME_NAME: "Southern Ocean" },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-180, -90], [180, -90], [180, -60], [-180, -60], [-180, -90]
            ]
          ]
        }
      }
    ];
  };

  // Helper function to try loading ocean zones
  async function tryLoadOceanZones() {
    // First try your local LME data
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
        firstFeature: data.features?.[0]
      });
      
      if (!data.features || !Array.isArray(data.features)) {
        throw new Error("Invalid GeoJSON structure");
      }
      
      if (data.features.length === 0) {
        throw new Error("No features found in GeoJSON");
      }
      
      // Validate and process features
      const validFeatures = data.features
        .filter((feature, index) => {
          if (!feature.geometry) {
            console.warn(`Feature ${index} has no geometry`);
            return false;
          }
          
          if (!['Polygon', 'MultiPolygon'].includes(feature.geometry.type)) {
            console.warn(`Feature ${index} has unsupported geometry type: ${feature.geometry.type}`);
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
          // Ensure we have a name property
          properties: {
            ...feature.properties,
            LME_NAME: feature.properties.LME_NAME || 
                     feature.properties.Name || 
                     feature.properties.name || 
                     `Marine Zone ${feature.properties.LME_NUMBER || index + 1}`
          }
        }));
      
      console.log(`Successfully processed ${validFeatures.length} valid ocean zones`);
      setDebugInfo(`✅ Loaded ${validFeatures.length} LME zones`);
      
      // Log some example zone names for debugging
      const exampleNames = validFeatures.slice(0, 5).map(f => f.properties.LME_NAME);
      console.log("Example zone names:", exampleNames);
      
      return validFeatures;
      
    } catch (error) {
      console.warn("Failed to load LME data:", error.message);
      setDebugInfo(`❌ LME data failed: ${error.message}. Using simple ocean zones.`);
      
      // Fallback to simple ocean zones
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
        
        // Fetch country boundaries
        console.log("Loading countries...");
        const countryRes = await fetch(geoUrl);
        if (!countryRes.ok) {
          throw new Error(`Failed to fetch country data: ${countryRes.status}`);
        }
        const topoJson = await countryRes.json();
        const geoData = feature(topoJson, topoJson.objects.countries).features;
        setGeographies(geoData);
        console.log(`Loaded ${geoData.length} countries`);

        // Load ocean zones
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
    return zone.properties?.LME_NAME || 
           zone.properties?.Name || 
           zone.properties?.name || 
           `Marine Zone ${zone.id || 'Unknown'}`;
  };

  const isOceanZoneCompleted = (zoneName) => {
    const isCompleted = completedUnitsByOcean[zoneName] && completedUnitsByOcean[zoneName].length > 0;
    console.log(`Checking if ocean zone "${zoneName}" is completed:`, isCompleted);
    return isCompleted;
  };

  const isOceanZoneHighlighted = (zoneName) => {
    const isHighlighted = highlightedOceanZones.includes(zoneName);
    console.log(`Checking if ocean zone "${zoneName}" is highlighted:`, isHighlighted);
    return isHighlighted;
  };

  const isCountryCompleted = (numericCode) => {
    const isCompleted = completedUnitsByNumericCode[numericCode] && completedUnitsByNumericCode[numericCode].length > 0;
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
          <p className="text-red-600 dark:text-red-400 mb-2">Failed to load map data</p>
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
      className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px]"
      onMouseMove={handleMouseMove}
    >
      

      {tooltipContent && (
        <div
          className="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg z-10 pointer-events-none"
          style={{ 
            left: mousePosition.x + 10, 
            top: mousePosition.y - 40,
            maxWidth: '200px'
          }}
        >
          {tooltipContent}
        </div>
      )}

      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 150 }}
        className="w-full h-auto"
        // style={{ background: "#f0f8ff" }} // Light blue background to see ocean zones better
      >
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
                        : "rgba(59,130,246,0.4)"
                    },
                    pressed: { outline: "none" }
                  }}
                  onMouseEnter={() => {
                    const tooltip = isCompleted 
                      ? `${zoneName} ✓ (${completedUnitsByOcean[zoneName]?.length || 0} units completed)`
                      : isHighlighted
                      ? `${zoneName} (In Progress)`
                      : zoneName;
                    setTooltipContent(tooltip);
                  }}
                  onMouseLeave={() => setTooltipContent(null)}
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
              const countryName = countryNameLookup[geo.properties.name] || geo.properties.name;
              const completedUnits = completedUnitsByNumericCode[numericCode];

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
                        : "#d1d5db"
                    },
                    pressed: { outline: "none" }
                  }}
                  onMouseEnter={() => {
                    const tooltip = completed 
                      ? `${countryName} ✓ (${completedUnits?.length || 0} units completed)`
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
          <span className="text-gray-600 dark:text-gray-400">Countries In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Countries Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 bg-opacity-60 border border-blue-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Marine Zones In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 bg-opacity-70 border border-purple-600 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Marine Zones Completed</span>
        </div>
        {/* Debug info panel - enabled for troubleshooting */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
          <p><strong>Debug Info:</strong></p>
          <p>Countries loaded: {geographies.length}</p>
          <p>Ocean zones loaded: {oceanZones.length}</p>
          <p>Highlighted regions: {highlightedRegions.length} ({highlightedRegions.join(', ')})</p>
          <p>Highlighted ocean zones: {highlightedOceanZones.length} ({highlightedOceanZones.join(', ')})</p>
          <p>Completed countries: {Object.keys(completedUnitsByCountry).length} ({Object.keys(completedUnitsByCountry).join(', ')})</p>
          <p>Completed ocean zones: {Object.keys(completedUnitsByOcean).length} ({Object.keys(completedUnitsByOcean).join(', ')})</p>
          {oceanZones.length > 0 && (
            <p>First ocean zone: {getOceanZoneName(oceanZones[0])}</p>
          )}
          {debugInfo && <p>Status: {debugInfo}</p>}
        </div>
      )}
      </div>
    </div>
  );
}


// "use client";

// import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
// import { useState, useEffect } from "react";
// import { ComposableMap, Geographies, Geography } from "react-simple-maps";
// import { feature } from "topojson-client";

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// // Reliable CDN URLs for marine ecosystem data
// const oceanZonesUrls = [
//   "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json", // We'll use ocean features from this
//   "/data/lme66.geojson", // Your local fallback
// ];

// export default function EcoMapProgressOceans({
//   highlightedRegions = [],
//   completedUnitsByCountry = {},
//   highlightedOceanZones = [],
//   completedUnitsByOcean = {},
// }) {
//   const [geographies, setGeographies] = useState([]);
//   const [oceanZones, setOceanZones] = useState([]);
//   const [tooltipContent, setTooltipContent] = useState(null);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [debugInfo, setDebugInfo] = useState("");

//   // Convert Alpha-2 to numeric for country fill
//   const highlightedNumericCodes = highlightedRegions
//     .map((code) => alpha2ToNumeric[code])
//     .filter(Boolean);

//   const completedUnitsByNumericCode = {};
//   Object.entries(completedUnitsByCountry).forEach(([alpha2Code, units]) => {
//     const numericCode = alpha2ToNumeric[alpha2Code];
//     if (numericCode) completedUnitsByNumericCode[numericCode] = units;
//   });

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
//               [-180, -60], [180, -60], [180, 60], [-180, 60], [-180, -60]
//             ]
//           ]
//         }
//       },
//       {
//         id: "atlantic",
//         properties: { LME_NAME: "Atlantic Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [-80, -60], [-10, -60], [-10, 70], [-80, 70], [-80, -60]
//             ]
//           ]
//         }
//       },
//       {
//         id: "indian",
//         properties: { LME_NAME: "Indian Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [20, -60], [120, -60], [120, 30], [20, 30], [20, -60]
//             ]
//           ]
//         }
//       },
//       {
//         id: "arctic",
//         properties: { LME_NAME: "Arctic Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [-180, 70], [180, 70], [180, 90], [-180, 90], [-180, 70]
//             ]
//           ]
//         }
//       },
//       {
//         id: "southern",
//         properties: { LME_NAME: "Southern Ocean" },
//         geometry: {
//           type: "Polygon",
//           coordinates: [
//             [
//               [-180, -90], [180, -90], [180, -60], [-180, -60], [-180, -90]
//             ]
//           ]
//         }
//       }
//     ];
//   };

//   // Helper function to try loading ocean zones
//   async function tryLoadOceanZones() {
//     // First try your local LME data
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
//         firstFeature: data.features?.[0]
//       });
      
//       if (!data.features || !Array.isArray(data.features)) {
//         throw new Error("Invalid GeoJSON structure");
//       }
      
//       if (data.features.length === 0) {
//         throw new Error("No features found in GeoJSON");
//       }
      
//       // Validate and process features
//       const validFeatures = data.features
//         .filter((feature, index) => {
//           if (!feature.geometry) {
//             console.warn(`Feature ${index} has no geometry`);
//             return false;
//           }
          
//           if (!['Polygon', 'MultiPolygon'].includes(feature.geometry.type)) {
//             console.warn(`Feature ${index} has unsupported geometry type: ${feature.geometry.type}`);
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
//           // Ensure we have a name property
//           properties: {
//             ...feature.properties,
//             LME_NAME: feature.properties.LME_NAME || 
//                      feature.properties.Name || 
//                      feature.properties.name || 
//                      `Marine Zone ${feature.properties.LME_NUMBER || index + 1}`
//           }
//         }));
      
//       console.log(`Successfully processed ${validFeatures.length} valid ocean zones`);
//       setDebugInfo(`✅ Loaded ${validFeatures.length} LME zones`);
      
//       // Log some example zone names for debugging
//       const exampleNames = validFeatures.slice(0, 3).map(f => f.properties.LME_NAME);
//       console.log("Example zone names:", exampleNames);
      
//       return validFeatures;
      
//     } catch (error) {
//       console.warn("Failed to load LME data:", error.message);
//       setDebugInfo(`❌ LME data failed: ${error.message}. Using simple ocean zones.`);
      
//       // Fallback to simple ocean zones
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
        
//         // Fetch country boundaries
//         console.log("Loading countries...");
//         const countryRes = await fetch(geoUrl);
//         if (!countryRes.ok) {
//           throw new Error(`Failed to fetch country data: ${countryRes.status}`);
//         }
//         const topoJson = await countryRes.json();
//         const geoData = feature(topoJson, topoJson.objects.countries).features;
//         setGeographies(geoData);
//         console.log(`Loaded ${geoData.length} countries`);

//         // Load ocean zones
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
//     return zone.properties?.LME_NAME || 
//            zone.properties?.Name || 
//            zone.properties?.name || 
//            `Marine Zone ${zone.id || 'Unknown'}`;
//   };

//   const isOceanZoneCompleted = (zoneName) => {
//     return completedUnitsByOcean[zoneName] && completedUnitsByOcean[zoneName].length > 0;
//   };

//   const isOceanZoneHighlighted = (zoneName) => {
//     return highlightedOceanZones.includes(zoneName);
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
//           <p className="text-red-600 dark:text-red-400 mb-2">Failed to load map data</p>
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
//       className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px]"
//       onMouseMove={handleMouseMove}
//     >
//       {/* Debug info panel */}
//       {/* {process.env.NODE_ENV === 'development' && (
//         <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
//           <p><strong>Debug Info:</strong></p>
//           <p>Countries loaded: {geographies.length}</p>
//           <p>Ocean zones loaded: {oceanZones.length}</p>
//           <p>Highlighted ocean zones: {highlightedOceanZones.length} ({highlightedOceanZones.join(', ')})</p>
//           <p>Completed ocean zones: {Object.keys(completedUnitsByOcean).length} ({Object.keys(completedUnitsByOcean).join(', ')})</p>
//           {oceanZones.length > 0 && (
//             <p>First ocean zone: {getOceanZoneName(oceanZones[0])}</p>
//           )}
//           {debugInfo && <p>Status: {debugInfo}</p>}
//         </div>
//       )} */}

//       {tooltipContent && (
//         <div
//           className="fixed bg-gray-800 text-white text-sm px-3 py-2 rounded shadow-lg z-10 pointer-events-none"
//           style={{ 
//             left: mousePosition.x + 10, 
//             top: mousePosition.y - 40,
//             maxWidth: '200px'
//           }}
//         >
//           {tooltipContent}
//         </div>
//       )}

//       <ComposableMap
//         projection="geoNaturalEarth1"
//         projectionConfig={{ scale: 150 }}
//         className="w-full h-auto"
//         // style={{ background: "#f0f8ff" }} // Light blue background to see ocean zones better
//       >
//         {/* Render ocean zones first (behind countries) */}
//         <Geographies geography={oceanZones}>
//           {({ geographies: oceanGeographies }) =>
//             oceanGeographies.map((geo) => {
//               const zoneName = getOceanZoneName(geo);
//               const isCompleted = isOceanZoneCompleted(zoneName);
//               const isHighlighted = isOceanZoneHighlighted(zoneName);

//               return (
//                 <Geography
//                   key={`ocean-${geo.rsmKey || geo.id}`}
//                   geography={geo}
//                   fill={
//                     isCompleted
//                       ? "rgba(25, 4, 104, 0.6)" // Green for completed
//                       : isHighlighted
//                       ? "rgba(14,165,233,0.5)" // Blue for highlighted
//                       : "rgba(59,130,246,0.2)" // Light blue for default ocean
//                   }
//                   stroke="#1e40af"
//                   strokeWidth={0.8}
//                   style={{
//                     default: { outline: "none" },
//                     hover: { 
//                       outline: "none",
//                       fill: isCompleted 
//                         ? "rgba(34,197,94,0.8)" 
//                         : isHighlighted 
//                         ? "rgba(14,165,233,0.7)" 
//                         : "rgba(59,130,246,0.4)"
//                     },
//                     pressed: { outline: "none" }
//                   }}
//                   onMouseEnter={() => {
//                     const tooltip = isCompleted 
//                       ? `${zoneName} ✓ (${completedUnitsByOcean[zoneName]?.length || 0} units completed)`
//                       : isHighlighted
//                       ? `${zoneName} (In Progress)`
//                       : zoneName;
//                     setTooltipContent(tooltip);
//                   }}
//                   onMouseLeave={() => setTooltipContent(null)}
//                 />
//               );
//             })
//           }
//         </Geographies>

//         {/* Render country shapes on top */}
//         <Geographies geography={geographies}>
//           {({ geographies }) =>
//             geographies.map((geo) => {
//               const numericCode = geo.id;
//               const isHighlighted = highlightedNumericCodes.includes(numericCode);
//               const completed = completedUnitsByNumericCode[numericCode];
//               const countryName = countryNameLookup[geo.properties.name] || geo.properties.name;

//               return (
//                 <Geography
//                   key={geo.rsmKey}
//                   geography={geo}
//                   fill={
//                     completed
//                       ? "#22c55e" // Green for completed
//                       : isHighlighted
//                       ? "#06b6d4" // Cyan for highlighted
//                       : "rgba(229,231,235,0.8)" // Semi-transparent light gray for default
//                   }
//                   stroke="#ffffff"
//                   strokeWidth={0.5}
//                   style={{
//                     default: { outline: "none" },
//                     hover: { 
//                       outline: "none",
//                       fill: completed 
//                         ? "#16a34a" 
//                         : isHighlighted 
//                         ? "#0891b2" 
//                         : "#d1d5db"
//                     },
//                     pressed: { outline: "none" }
//                   }}
//                   onMouseEnter={() => {
//                     const tooltip = completed 
//                       ? `${countryName} ✓ (${completed.length} units completed)`
//                       : isHighlighted
//                       ? `${countryName} (In Progress)`
//                       : countryName;
//                     setTooltipContent(tooltip);
//                   }}
//                   onMouseLeave={() => setTooltipContent(null)}
//                 />
//               );
//             })
//           }
//         </Geographies>
//       </ComposableMap>

//       {/* Legend */}
//       <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">Not Started</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-cyan-400 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">In Progress</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-green-500 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">Completed</span>
//         </div>
//         <div className="flex items-center gap-2">
//           <div className="w-4 h-4 bg-blue-300 bg-opacity-40 border border-blue-600 rounded"></div>
//           <span className="text-gray-600 dark:text-gray-400">Marine Ecosystems ({oceanZones.length} loaded)</span>
//         </div>
//       </div>
//     </div>
//   );
// }