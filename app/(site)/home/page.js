import UnitCard from "@/components/UnitCard";
import {
  fetchFeaturedUnits,
  fetchSingleGapChallenges,
  fetchUnitDetails,
} from "@/lib/data-service";

export default async function SiteHomePage() {
  const units = await fetchFeaturedUnits(); // Includes rank info
  const unitDetails = await Promise.all(
    units.map((unit) => fetchUnitDetails(unit.id))
  );

  // Combine metadata and content
  const featuredUnits = units.map((unit, index) => ({
    ...unit,
    ...unitDetails[index],
  }));

  const topUnit = featuredUnits[0];
  const remainingUnits = featuredUnits.slice(1);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
        Explore Units
      </h1>

      {/* Top featured unit */}
      {topUnit && (
        <div className="mb-10">
          <UnitCard unit={topUnit} highlight />
        </div>
      )}

      {/* Remaining featured units */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {remainingUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </section>
    </div>
  );
}
