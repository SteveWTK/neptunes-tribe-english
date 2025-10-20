// app/(site)/units/[unitId]/page.js
import { fetchAllUnits } from "@/lib/data-service";
import UnitPageClient from "./UnitPageClient";

export default async function UnitPage({ params }) {
  const { unitId } = params;
  const numericUnitId = Number(unitId);

  try {
    const units = await fetchAllUnits();

    return <UnitPageClient units={units} numericUnitId={numericUnitId} />;
  } catch (error) {
    console.error("Failed to load units:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-4">
            There was an error loading this unit. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}

// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// import MultiGapFillExerciseNew from "@/components/MultiGapFillExerciseNew";
// import { fetchAllUnits } from "@/lib/data-service";

// export default function UnitPage() {
//   const { unitId } = useParams();
//   const numericUnitId = Number(unitId);

//   const [units, setUnits] = useState([]);
//   const [themes, setThemes] = useState([]);
//   const [selectedTheme, setSelectedTheme] = useState("All");

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [unitsData] = await Promise.all([fetchAllUnits()]);
//         setUnits(unitsData);
//         if (!numericUnitId && unitsData.length > 0) {
//           setSelectedUnitId(unitsData[0].id);
//         }
//       } catch (err) {
//         console.error("Failed to load units:", err);
//       }
//     };
//     loadData();
//   }, [numericUnitId]);

//   const filteredUnits =
//     selectedTheme === "All"
//       ? units
//       : units.filter((u) => u.theme === selectedTheme);

//   return (
//     <div className="flex flex-col items-center space-y-4 bg-white dark:bg-primary-900">
//       <h1 className="text-2xl font-bold mt-6 text-center">
//         Unit {numericUnitId}
//       </h1>

//       {/* Exercise */}
//       {numericUnitId && <MultiGapFillExerciseNew unitId={numericUnitId} />}
//     </div>
//   );
// }
