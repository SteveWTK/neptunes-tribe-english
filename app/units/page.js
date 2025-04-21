"use client";

import { useEffect, useState } from "react";
import MultiGapFillExerciseNew from "../components/MultiGapFillExerciseNew";
import { fetchAllUnits, fetchUnitThemes } from "@/app/lib/data-service"; // ✅ this import now

export default function Page() {
  const [unitId, setUnitId] = useState(1);
  const [units, setUnits] = useState([]);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("All");

  useEffect(() => {
    const loadData = async () => {
      const [unitsData, themeData] = await Promise.all([
        fetchAllUnits(),
        fetchUnitThemes(),
      ]);
      setUnits(unitsData);
      setThemes(["All", ...themeData]);
      if (unitsData.length > 0) {
        setUnitId(unitsData[0].id);
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

  const handleRandomUnit = () => {
    if (filteredUnits.length > 0) {
      const randomUnit =
        filteredUnits[Math.floor(Math.random() * filteredUnits.length)];
      setUnitId(randomUnit.id);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-4">
      {/* Theme filter */}
      <select
        className="bg-accent-200 hover:bg-accent-400 text-accent-900 rounded-md px-2 py-1 text-center"
        value={selectedTheme}
        onChange={(e) => setSelectedTheme(e.target.value)}
      >
        {themes.map((theme, index) => (
          <option key={index} value={theme}>
            {formatTheme(theme)}
          </option>
        ))}
      </select>

      {/* Unit selector */}
      <select
        className="bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center min-w-32 max-w-60"
        value={unitId ?? ""}
        onChange={(e) => setUnitId(Number(e.target.value))}
      >
        <option value="">-- Select Unit --</option>
        <option value="random">🎲 Random Unit</option>
        {filteredUnits.map((unit) => (
          <option key={unit.id} value={unit.id}>
            Unit {unit.unit}: {unit.title}
          </option>
        ))}
      </select>

      {/* Handle random manually */}
      {unitId === "random" && handleRandomUnit()}

      {/* Exercise */}
      {unitId && typeof unitId === "number" && (
        <MultiGapFillExerciseNew unitId={unitId} />
      )}

      {/*<select
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
      <MultiGapFillExerciseNew unitId={unitId} />*/}
    </div>
  );
}
