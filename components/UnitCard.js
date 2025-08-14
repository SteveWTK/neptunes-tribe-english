// components/UnitCard.jsx
import Link from "next/link";

export default function UnitCard({ unit }) {
  let themeBgClass = "";

  if (unit.theme === "Environmental Heroes") {
    themeBgClass = "bg-[#ACC572] text-white dark:text-[#ACC572]";
  } else if (unit.theme === "Endangered Species") {
    themeBgClass = "bg-[#ACC572] text-white dark:text-[#8ACCD5]";
  } else if (unit.theme === "Endangered trees") {
    themeBgClass = "bg-[#ACC572] text-white dark:text-[#F1BA88]";
  } else if (unit.theme === "Invertebrates") {
    themeBgClass = "bg-[#ACC572] text-white dark:text-[#E9F5BE]";
  } else {
    themeBgClass = "bg-gray-200 text-gray-800";
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-xl transition overflow-hidden">
      <img
        src={unit.image || "/images/placeholder.jpg"}
        alt={unit.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {unit.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {unit.description}
        </p>
        <span
          className={`inline-block mt-2 px-3 py-1 ${themeBgClass} dark:bg-primary-600 text-primary-800 dark:text-white text-xs font-medium rounded-full`}
        >
          {unit.theme}
        </span>
        <p className="mt-2 text-sm text-gray-600 font- dark:text-gray-300">
          {unit.region_name}
        </p>
        <div className="flex justify-between">
          <Link
            href={`/units/${unit.id}`}
            className="block mt-2 text-accent-600 dark:text-accent-400 font-semibold hover:underline"
          >
            Start Unit →
          </Link>
          <span className="block mt-2 mr-4 text-accent-600 dark:text-accent-400 font-semibold hover:underline">
            Gaps: {unit.length}
          </span>
        </div>
      </div>
    </div>
  );
}
