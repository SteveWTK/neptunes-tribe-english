"use client";

import UnitCard from "@/components/UnitCard";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import Link from "next/link";
import { countryNameLookup } from "@/lib/isoMappings";

export default function SiteHomeClient({
  featuredUnits,
  challenges,
  completedUnitIds = [],
  filterInfo = {
    isFiltered: false,
    regionFilter: null,
    marineZoneFilter: null,
  },
}) {
  const { lang } = useLanguage();

  const t = {
    en: {
      heroTitle: "Practice your English exploring the planet",
      heroSubtitle:
        "Neptune's Tribe is an English learning journey inspired by environmental action. Learn English. Support the Planet.",
      allUnits: "All Learning Units",
      unitsFound: "units found",
      completed: "completed",
      noUnitsFound: "No units found for this location",
      noUnitsSubtext: "Try exploring other areas on your eco-map!",
      backToEcoMap: "Back to Eco-Map",
      backToAllUnits: "View all units",
      clickHint: "Tip: Visit your eco-map to explore units by region",
    },
    pt: {
      heroTitle: "Pratique seu Inglês explorando o Planeta",
      heroSubtitle:
        "Neptune's Tribe é uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
      allUnits: "Todas as Unidades",
      unitsFound: "unidades encontradas",
      completed: "concluídas",
      noUnitsFound: "Nenhuma unidade encontrada para este local",
      noUnitsSubtext: "Tente explorar outras áreas no seu eco-mapa!",
      backToEcoMap: "Voltar ao Eco-Mapa",
      backToAllUnits: "Ver todas as unidades",
      clickHint:
        "💡 Dica: Visite seu eco-mapa para explorar unidades por região",
    },
  };

  const copy = t[lang];

  // Helper function to get display name for region
  const getRegionDisplayName = (regionCode) => {
    // Handle array format
    if (regionCode?.startsWith("[") && regionCode?.endsWith("]")) {
      try {
        const codes = JSON.parse(regionCode);
        return codes
          .map(
            (code) =>
              Object.entries(countryNameLookup).find(
                ([name, lookup]) => lookup === code
              )?.[0] || code
          )
          .join(", ");
      } catch (e) {
        return regionCode;
      }
    }

    // Single region code - find country name
    return (
      Object.entries(countryNameLookup).find(
        ([name, lookup]) => lookup === regionCode
      )?.[0] || regionCode
    );
  };

  // Create title based on filter
  const getPageTitle = () => {
    if (filterInfo.regionFilter) {
      const countryName = getRegionDisplayName(filterInfo.regionFilter);
      return `${countryName} - English Learning Units`;
    } else if (filterInfo.marineZoneFilter) {
      const zoneName = decodeURIComponent(filterInfo.marineZoneFilter);
      return `${zoneName} - Marine Learning Units`;
    }
    return copy.heroTitle;
  };

  const getPageSubtitle = () => {
    if (filterInfo.isFiltered) {
      return `${featuredUnits.length} ${copy.unitsFound}${
        completedUnitIds.length > 0
          ? ` • ${completedUnitIds.length} ${copy.completed}`
          : ""
      }`;
    }
    return copy.heroSubtitle;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {getPageTitle()}
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          {getPageSubtitle()}
        </p>

        {/* Filter Navigation */}
        {filterInfo.isFiltered && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/units"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-[#10b981] transition-colors"
            >
              ← {copy.backToAllUnits}
            </Link>
            <span className="hidden sm:inline text-gray-400">•</span>
            <Link
              href="/eco-map"
              className="inline-flex items-center text-sm text-[#10b981] hover:text-[#059669] transition-colors"
            >
              🗺️ {copy.backToEcoMap}
            </Link>
          </div>
        )}

        {/* Tip for non-filtered view */}
        {!filterInfo.isFiltered && (
          <div className="mb-6">
            <Link
              href="/eco-map"
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-[#10b981] transition-colors"
            >
              {copy.clickHint}
            </Link>
          </div>
        )}
      </div>

      {/* Units Grid or Empty State */}
      {featuredUnits && featuredUnits.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredUnits.map((unit) => {
            const isCompleted = completedUnitIds.includes(unit.id);

            return (
              <div key={unit.id} className="relative">
                <UnitCard unit={unit} />
                {isCompleted && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </section>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {filterInfo.isFiltered ? copy.noUnitsFound : "No units available"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filterInfo.isFiltered
                ? copy.noUnitsSubtext
                : "Please check back later for new learning content."}
            </p>

            {filterInfo.isFiltered && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/eco-map"
                  className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg hover:bg-[#059669] transition-colors"
                >
                  {copy.backToEcoMap}
                </Link>
                <Link
                  href="/units"
                  className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {copy.backToAllUnits}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back to Eco-Map link for filtered results */}
      {filterInfo.isFiltered && featuredUnits.length > 0 && (
        <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/eco-map"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-[#10b981] transition-colors"
          >
            ← Explore more regions on your Eco-Map
          </Link>
        </div>
      )}
    </div>
  );
}

// "use client";

// import UnitCard from "@/components/UnitCard";
// import { useLanguage } from "@/lib/contexts/LanguageContext";

// export default function SiteHomeClient({ featuredUnits, challenges }) {
//   const { lang } = useLanguage();
//   const topUnit = featuredUnits[0];
//   const remainingUnits = featuredUnits.slice(1);

//   const t = {
//     en: {
//       heroTitle: "Practice your English exploring the planet",
//       heroSubtitle:
//         "Neptune's Tribe is an English learning journey inspired by environmental action. Learn English. Support the Planet.",
//     },
//     pt: {
//       heroTitle: "Pratique seu Inglês explorando o Planeta.",
//       heroSubtitle:
//         "Neptune's Tribe é uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
//     },
//   };

//   const copy = t[lang];

//   const languageOptions = {
//     en: { label: "English", flag: "/flags/en.svg" },
//     pt: { label: "Português", flag: "/flags/pt.svg" },
//     th: { label: "ไทย", flag: "/flags/th.svg" },
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
//         {copy.heroTitle}
//       </h1>

//       {/* Grid of Units */}
//       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {featuredUnits.map((unit) => (
//           <UnitCard key={unit.id} unit={unit} />
//         ))}
//       </section>
//     </div>
//   );
// }
