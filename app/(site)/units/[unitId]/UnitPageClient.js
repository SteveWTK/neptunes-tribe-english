// app/(site)/units/[unitId]/UnitPageClient.js
"use client";

import { useState } from "react";
import MultiGapFillExerciseNew from "@/app/components/MultiGapFillExerciseNew";

export default function UnitPageClient({ units, numericUnitId }) {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("All");

  const filteredUnits =
    selectedTheme === "All"
      ? units
      : units.filter((u) => u.theme === selectedTheme);

  return (
    <div>
      <div>
        <h1 className="m-2">Unit {numericUnitId}</h1>
      </div>

      {/* Exercise */}
      {numericUnitId && (
        <MultiGapFillExerciseNew unitId={numericUnitId} units={filteredUnits} />
      )}
    </div>
  );
}
