"use client";

import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const oceanZonesUrl = "/data/lme66.geojson";

export default function EcoMapProgress({
  highlightedRegions = [],
  completedUnitsByCountry = {},
  highlightedOceanZones = [],
  completedUnitsByOcean = {}, // e.g. { "North Sea": ["cod", "herring"] }
}) {
  const [geographies, setGeographies] = useState([]);
  const [oceanZones, setOceanZones] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
        const res = await fetch(geoUrl);
        const topoJson = await res.json();
        const geoData = feature(topoJson, topoJson.objects.countries).features;
        setGeographies(geoData);
      } catch (error) {
        console.error("Error loading map data:", error);
      }
    }

    fetchMapData();
  }, []);

  useEffect(() => {
    async function fetchOceanZones() {
      const res = await fetch(oceanZonesUrl);
      if (res.ok) {
        const data = await res.json();
        setOceanZones(data.features);
      } else {
        console.error("Failed to load ocean zones");
      }
    }
    fetchOceanZones();
  }, []);

  const handleMouseMove = (event) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <div
      className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px]"
      onMouseMove={handleMouseMove}
    >
      {tooltipContent && (
        <div
          className="fixed bg-primary-800 text-white text-sm px-2 py-1 rounded shadow"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y + 10,
            zIndex: 10,
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
        {/* Render country shapes */}
        <Geographies geography={geographies}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const numericCode = geo.id;
              const isHighlighted =
                highlightedNumericCodes.includes(numericCode);
              const completed = completedUnitsByNumericCode[numericCode];

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={
                    completed
                      ? "#4ade80" // green
                      : isHighlighted
                      ? "#22d3ee" // cyan
                      : "#e5e7eb" // default
                  }
                  stroke="#fff"
                  strokeWidth={0.3}
                  onMouseEnter={() =>
                    setTooltipContent(
                      countryNameLookup[geo.properties.name] ||
                        geo.properties.name
                    )
                  }
                  onMouseLeave={() => setTooltipContent(null)}
                />
              );
            })
          }
        </Geographies>

        {/* Render ocean zones as polygons */}
        {oceanZones.map((zone, idx) => {
          const zoneName = zone.properties?.LME_NAME || `Zone ${idx}`;
          const isCompleted = completedUnitsByOcean[zoneName];
          const isHighlighted = highlightedOceanZones.includes(zoneName);

          return (
            <Geography
              key={`ocean-${idx}`}
              geography={zone}
              fill={
                isCompleted
                  ? "rgba(34,197,94,0.5)" // green semi-transparent
                  : isHighlighted
                  ? "rgba(14,165,233,0.4)" // blue highlight
                  : "rgba(59,130,246,0.15)" // default ocean blue
              }
              stroke="#3b82f6"
              strokeWidth={0.5}
              onMouseEnter={() => setTooltipContent(zoneName)}
              onMouseLeave={() => setTooltipContent(null)}
            />
          );
        })}
      </ComposableMap>
    </div>
  );
}

// "use client";

// import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
// import { useState, useEffect } from "react";
// import { ComposableMap, Geographies, Geography } from "react-simple-maps";
// import { feature } from "topojson-client";

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// export default function EcoMapProgress({
//   highlightedRegions = [],
//   completedUnitsByCountry = {},
// }) {
//   const [geographies, setGeographies] = useState([]);
//   const [tooltipContent, setTooltipContent] = useState(null);

//   const highlightedNumericCodes = highlightedRegions
//     .map((code) => alpha2ToNumeric[code])
//     .filter(Boolean);

//   useEffect(() => {
//     async function fetchMapData() {
//       const res = await fetch(geoUrl);
//       const topoJson = await res.json();
//       const geoData = feature(topoJson, topoJson.objects.countries).features;
//       setGeographies(geoData);
//     }

//     fetchMapData();
//   }, []);

//   return (
//     <div className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px]">
//       {tooltipContent && (
//         <div className="absolute top-100 left-0 bg-primary-800 text-white dark:bg-primary-300 dark:text-gray-900 shadow-md p-2 rounded text-sm border border-gray-200 z-10">
//           <strong>{tooltipContent.name}</strong>
//           <ul className="mt-1 list-disc list-inside">
//             {tooltipContent.units?.length > 0 ? (
//               tooltipContent.units.map((unit, idx) => <li key={idx}>{unit}</li>)
//             ) : (
//               <li>No completed units yet</li>
//             )}
//           </ul>
//         </div>
//       )}

//       <ComposableMap
//         projection="geoEqualEarth"
//         width={800}
//         height={500}
//         style={{ width: "100%", height: "auto" }}
//       >
//         <Geographies geography={geographies}>
//           {({ geographies }) =>
//             geographies.map((geo) => {
//               const id = geo.id;
//               const isHighlighted = highlightedNumericCodes.includes(id);
//               const name = countryNameLookup[id] || geo.properties.name;
//               const units = completedUnitsByCountry[id] || [];

//               return (
//                 <Geography
//                   key={geo.rsmKey || id}
//                   geography={geo}
//                   fill={isHighlighted ? "#34d399" : "#e5e7eb"}
//                   stroke="#888"
//                   onMouseEnter={() =>
//                     isHighlighted &&
//                     setTooltipContent({
//                       name,
//                       units,
//                     })
//                   }
//                   onMouseLeave={() => setTooltipContent(null)}
//                   style={{
//                     default: { outline: "none" },
//                     hover: { fill: "#10b981", outline: "none" },
//                     pressed: { outline: "none" },
//                   }}
//                 />
//               );
//             })
//           }
//         </Geographies>
//       </ComposableMap>
//     </div>
//   );
// }
