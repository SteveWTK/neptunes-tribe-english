"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MultiGapFillExerciseNew from "@/app/components/MultiGapFillExerciseNew";
import { fetchAllUnits } from "@/lib/data-service";

export default function UnitPage() {
  const { unitId } = useParams();
  const numericUnitId = Number(unitId);

  const [units, setUnits] = useState([]);
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("All");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [unitsData] = await Promise.all([fetchAllUnits()]);
        setUnits(unitsData);
        if (!numericUnitId && unitsData.length > 0) {
          setSelectedUnitId(unitsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load units:", err);
      }
    };
    loadData();
  }, [numericUnitId]);

  const filteredUnits =
    selectedTheme === "All"
      ? units
      : units.filter((u) => u.theme === selectedTheme);

  return (
    <div className="flex flex-col items-center space-y-4 bg-white dark:bg-primary-900">
      <h1 className="text-2xl font-bold mt-6 text-center">
        Unit {numericUnitId}
      </h1>

      {/* Exercise */}
      {numericUnitId && <MultiGapFillExerciseNew unitId={numericUnitId} />}
    </div>
  );
}
