"use client";

import { useEffect, useState } from "react";
import MultiGapFillExerciseNew from "@/app/components/MultiGapFillExerciseNew";
import { fetchAllUnits, fetchUnitThemes } from "@/lib/data-service"; // ✅ this import now

export default function Page() {
  const [unitId, setUnitId] = useState(1);
  const [units, setUnits] = useState([]);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("All");

  const buttonClass =
    "text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [unitsData, themeData] = await Promise.all([
          fetchAllUnits(),
          fetchUnitThemes(),
        ]);
        setUnits(unitsData);
        setThemes(["All", ...themeData]);
        if (unitsData.length > 0) {
          setUnitId(unitsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load units or themes:", err);
      }
    };

    loadData();
  }, []);

  const filteredUnits =
    selectedTheme === "All"
      ? units
      : units.filter((u) => u.theme === selectedTheme);

  function formatTheme(theme) {
    if (!theme) return "";
    return theme
      .split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  return (
    <div className="flex flex-col items-center space-y-4 bg-white dark:bg-primary-900">
      {/* Theme filter */}
      <div className="mt-6 flex flex-col gap-2">
        {/* Unit selector */}
        <select
          className="text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600"
          value={unitId ?? ""}
          onChange={(e) => setUnitId(Number(e.target.value))}
        >
          <option value="">-- Select Unit --</option>
          {filteredUnits.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.unit}: {unit.title}
            </option>
          ))}
        </select>
      </div>

      {/* Exercise */}
      {unitId && typeof unitId === "number" && (
        <MultiGapFillExerciseNew unitId={unitId} />
      )}
    </div>
  );
}

// const handleRandomUnit = () => {
//   if (filteredUnits.length > 0) {
//     const randomUnit =
//       filteredUnits[Math.floor(Math.random() * filteredUnits.length)];
//     setUnitId(randomUnit.id);
//   }
// };

{
  /* <option value="random">🎲 Random Unit</option> */
}

{
  /* Handle random manually */
}
// {unitId === "random" && handleRandomUnit()}

{
  /* <select
          className="text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600"
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
        >
          {themes.map((theme, index) => (
            <option key={index} value={theme}>
              {formatTheme(theme)}
            </option>
          ))}
        </select> */
}

{
  /*<select
        className="bg-accent-50 hover:bg-accent-500 text-accent-900  rounded-md px-2 py-1 mt-4 text-center align-middle min-w-24 max-w-60 ml-8"
        value={unitId}
        onChange={(e) => setUnitId(Number(e.target.value))}
      >
        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            Unit {unit.unit}: {unit.title}
          </option>
        ))}
      </select>
      <MultiGapFillExerciseNew unitId={unitId} />*/
}
