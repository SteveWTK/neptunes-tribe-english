"use client";

import { alpha2ToNumeric, countryNameLookup } from "@/lib/isoMappings";
import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { feature } from "topojson-client";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

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
