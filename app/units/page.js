"use client";

import { useState } from "react";
import MultiGapFillExercise from "@/app/components/MultiGapFillExercise";

export default function Page() {
  const [unitId, setUnitId] = useState(1); // Set a default unit ID

  return (
    <div>
      <select
        className=" bg-accent-300 hover:bg-accent-500 text-accent-900 rounded-md px-3 py-1 text-center align-middle min-w-32 max-w-40"
        value={unitId}
        onChange={(e) => setUnitId(Number(e.target.value))}
      >
        <option value={1}>Unit 1</option>
        <option value={2}>Unit 2</option>
        <option value={3}>Unit 3</option>
        <option value={4}>Unit 4</option>
      </select>

      <MultiGapFillExercise unitId={unitId} />
    </div>
  );
}
