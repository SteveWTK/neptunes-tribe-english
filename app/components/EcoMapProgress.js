"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ISO Alpha-2 to Numeric mapping
const alpha2ToNumeric = {
  BR: "076",
  ID: "360",
  KE: "404",
  US: "840",
  CA: "124",
  AU: "036",
  // Add more as needed
};

// Optional: Country name mapping (you can extract this dynamically too)
const countryNameLookup = {
  "076": "Brazil",
  360: "Indonesia",
  404: "Kenya",
  840: "United States",
  124: "Canada",
  "036": "Australia",
};

export default function EcoMapProgress({
  highlightedRegions = [],
  completedUnitsByCountry = {},
}) {
  const [geographies, setGeographies] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);

  const highlightedNumericCodes = highlightedRegions
    .map((code) => alpha2ToNumeric[code])
    .filter(Boolean);

  useEffect(() => {
    async function fetchMapData() {
      const res = await fetch(geoUrl);
      const topoJson = await res.json();
      const geoData = feature(topoJson, topoJson.objects.countries).features;
      setGeographies(geoData);
    }

    fetchMapData();
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto pt-4 pb-12 min-h-[500px]">
      <h2 className="text-xl font-bold mb-4 text-center">
        Your Eco-Journey Around the World
      </h2>

      {tooltipContent && (
        <div className="absolute top-100 left-0 bg-primary-800 text-white dark:bg-primary-300 dark:text-gray-900 shadow-md p-2 rounded text-sm border border-gray-200 z-10">
          <strong>{tooltipContent.name}</strong>
          <ul className="mt-1 list-disc list-inside">
            {tooltipContent.units?.length > 0 ? (
              tooltipContent.units.map((unit, idx) => <li key={idx}>{unit}</li>)
            ) : (
              <li>No completed units yet</li>
            )}
          </ul>
        </div>
      )}

      <ComposableMap
        projection="geoEqualEarth"
        width={800}
        height={500}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geographies}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const id = geo.id;
              const isHighlighted = highlightedNumericCodes.includes(id);
              const name = countryNameLookup[id] || geo.properties.name;
              const units = completedUnitsByCountry[id] || [];

              return (
                <Geography
                  key={geo.rsmKey || id}
                  geography={geo}
                  fill={isHighlighted ? "#34d399" : "#e5e7eb"}
                  stroke="#888"
                  onMouseEnter={() =>
                    isHighlighted &&
                    setTooltipContent({
                      name,
                      units,
                    })
                  }
                  onMouseLeave={() => setTooltipContent(null)}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#10b981", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </div>
  );
}

// "use client";

// import { useState, useEffect } from "react";
// import { ComposableMap, Geographies, Geography } from "react-simple-maps";
// import { feature } from "topojson-client";

// const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// export default function EcoMapProgress({ highlightedRegions = [] }) {
//   const [geographies, setGeographies] = useState([]);

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
//     <div className="max-w-4xl mx-auto p-4 min-h-[500px]">
//       <h2 className="text-xl font-bold mb-4">
//         Your Eco-Journey Around the World
//       </h2>
//       <ComposableMap
//         projection="geoEqualEarth"
//         width={800}
//         height={550}
//         style={{ width: "100%", height: "auto" }}
//       >
//         <Geographies geography={geographies}>
//           {({ geographies }) =>
//             geographies.map((geo) => {
//               const isHighlighted = highlightedRegions.includes(geo.id); // ISO numeric code
//               return (
//                 <Geography
//                   key={geo.rsmKey || geo.id}
//                   geography={geo}
//                   fill={isHighlighted ? "#34d399" : "#e5e7eb"} // Tailwind colors, #e5e7eb
//                   stroke="#888"
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
