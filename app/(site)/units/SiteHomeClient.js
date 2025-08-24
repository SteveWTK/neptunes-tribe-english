// app/(site)/units/SiteHomeClient.js - Enhanced with Premium UI and Filtering
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UnitCard from "@/components/UnitCard";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import Link from "next/link";
import { countryNameLookup } from "@/lib/isoMappings";

export default function SiteHomeClient({
  featuredUnits,
  challenges,
  completedUnitIds = [],
  filterInfo = {},
  userInfo = {},
}) {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const { isLoggedIn, isPremiumUser, email } = userInfo;

  const t = {
    en: {
      heroTitle: "Practice your English as you explore the planet",
      heroSubtitle:
        "Neptune's Tribe is an English learning journey inspired by environmental action. Learn English. Support the Planet.",
      allUnits: "All Learning Units",
      unitsFound: "units found",
      completed: "completed",
      premiumOnly: "Premium Only",
      upgradeToUnlock: "Upgrade to Unlock",
      loginToAccess: "Login to Access",

      // Filtering
      filters: "Filters",
      sortBy: "Sort by",
      sortByRank: "Default order",
      sortByLength: "Length (shortest first)",
      sortByNewest: "Newest first",
      showCompleted: "Show completed only",
      showIncomplete: "Show incomplete only",
      showAll: "Show all",
      applyFilters: "Apply Filters",
      clearFilters: "Clear All",

      // Premium messaging
      premiumContent: "Premium Content",
      unlockPremium: "Unlock with Premium",
      premiumBenefit: "Access 100+ premium units and challenges",
      upgradeNow: "Upgrade Now",

      noUnitsFound: "No units found for this location",
      noUnitsSubtext: "Try exploring other areas on your eco-map!",
      backToEcoMap: "Back to Eco-Map",
      backToAllUnits: "View all units",
      clickHint: "Tip: Visit your eco-map to explore units by region",
      helpingWith: "You're helping with",
      urgentChallenge: "Urgent Environmental Challenge",
    },
    pt: {
      heroTitle: "Pratique seu Inglês explorando o Planeta",
      heroSubtitle:
        "Neptune's Tribe é uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
      allUnits: "Todas as Unidades",
      unitsFound: "unidades encontradas",
      completed: "concluídas",
      premiumOnly: "Apenas Premium",
      upgradeToUnlock: "Faça Upgrade para Desbloquear",
      loginToAccess: "Entre para Acessar",

      // Filtering
      filters: "Filtros",
      sortBy: "Ordenar por",
      sortByRank: "Ordem padrão",
      sortByLength: "Tamanho (mais curtos primeiro)",
      sortByNewest: "Mais novos primeiro",
      showCompleted: "Mostrar apenas concluídas",
      showIncomplete: "Mostrar apenas incompletas",
      showAll: "Mostrar todas",
      applyFilters: "Aplicar Filtros",
      clearFilters: "Limpar Tudo",

      // Premium messaging
      premiumContent: "Conteúdo Premium",
      unlockPremium: "Desbloquear com Premium",
      premiumBenefit: "Acesse mais de 100 unidades e desafios premium",
      upgradeNow: "Fazer Upgrade",

      noUnitsFound: "Nenhuma unidade encontrada para este local",
      noUnitsSubtext: "Tente explorar outras áreas no seu eco-mapa!",
      backToEcoMap: "Voltar ao Eco-Mapa",
      backToAllUnits: "Ver todas as unidades",
      clickHint:
        "💡 Dica: Visite seu eco-mapa para explorar unidades por região",
      helpingWith: "Você está ajudando com",
      urgentChallenge: "Desafio Ambiental Urgente",
    },
  };

  const copy = t[lang];

  const updateFilters = (newParams) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "false" && value !== "") {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    router.push(`/units?${current.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/units");
  };

  // Premium content that user doesn't have access to (for demo/conversion)
  const premiumPreviewUnits = [
    {
      id: "premium-preview-1",
      title: "Advanced Ocean Vocabulary",
      description: "Master complex marine terminology",
      theme: "Advanced Vocabulary",
      difficulty_level: "Advanced",
      image: "/images/ocean-advanced.jpg",
      isPremiumPreview: true,
    },
    {
      id: "premium-preview-2",
      title: "Climate Change Discussions",
      description: "Debate environmental issues in English",
      theme: "Advanced Discussion",
      difficulty_level: "Expert",
      image: "/images/climate-debate.jpg",
      isPremiumPreview: true,
    },
  ];

  const shouldShowPremiumPreviews = !isPremiumUser && featuredUnits.length < 8;

  const allDisplayUnits = shouldShowPremiumPreviews
    ? [...featuredUnits, ...premiumPreviewUnits]
    : featuredUnits;

  const PremiumUpgradeCard = () => (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900 dark:to-amber-900 border-2 border-yellow-200 dark:border-yellow-700 rounded-xl p-6 text-center">
      <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">👑</span>
      </div>
      <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
        {copy.premiumContent}
      </h3>
      <p className="text-yellow-700 dark:text-yellow-300 mb-4 text-sm">
        {copy.premiumBenefit}
      </p>
      <Link
        href="/pricing"
        className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
      >
        {copy.upgradeNow}
      </Link>
    </div>
  );

  const FilterPanel = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 dark:text-white">
          {copy.filters}
        </h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-500"
        >
          {copy.clearFilters}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {copy.sortBy}
          </label>
          <select
            value={filterInfo.sortBy || "rank"}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="rank">{copy.sortByRank}</option>
            <option value="length">{copy.sortByLength}</option>
            <option value="newest">{copy.sortByNewest}</option>
          </select>
        </div>

        {/* Completion Filter */}
        {isLoggedIn && completedUnitIds.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Progress
            </label>
            <select
              value={
                filterInfo.showCompleted
                  ? "completed"
                  : filterInfo.showOnlyIncomplete
                  ? "incomplete"
                  : "all"
              }
              onChange={(e) => {
                const value = e.target.value;
                updateFilters({
                  completed: value === "completed" ? "true" : "false",
                  incomplete: value === "incomplete" ? "true" : "false",
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">{copy.showAll}</option>
              <option value="completed">{copy.showCompleted}</option>
              <option value="incomplete">{copy.showIncomplete}</option>
            </select>
          </div>
        )}

        {/* Premium Status (info only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account Type
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">
            {isPremiumUser ? "👑 Premium" : "🆓 Free"}
          </div>
        </div>
      </div>
    </div>
  );

  const getPageTitle = () => {
    if (filterInfo.ecosystemFilter) {
      const ecosystem = ecosystemInfo[filterInfo.ecosystemFilter];
      return `${ecosystem?.icon || "🌍"} ${
        ecosystem?.name || filterInfo.ecosystemFilter
      } - Environmental Learning`;
    } else if (filterInfo.regionFilter) {
      const countryName = getRegionDisplayName(filterInfo.regionFilter);
      return `${countryName} - English Learning Units`;
    } else if (filterInfo.marineZoneFilter) {
      const zoneName = decodeURIComponent(filterInfo.marineZoneFilter);
      return `${zoneName} - Marine Learning Units`;
    }
    return copy.heroTitle;
  };

  // Helper function to get display name for region
  const getRegionDisplayName = (regionCode) => {
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

    return (
      Object.entries(countryNameLookup).find(
        ([name, lookup]) => lookup === regionCode
      )?.[0] || regionCode
    );
  };

  const ecosystemInfo = {
    marine: { name: "Marine & Ocean", icon: "🌊", color: "blue" },
    forest: { name: "Forest & Jungle", icon: "🌳", color: "green" },
    polar: { name: "Polar Regions", icon: "❄️", color: "cyan" },
    grassland: { name: "Grassland & Savanna", icon: "🌾", color: "yellow" },
    mountains: { name: "Mountain & Alpine", icon: "🏔️", color: "gray" },
    freshwater: { name: "Freshwater & Rivers", icon: "💧", color: "teal" },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {getPageTitle()}
        </h1>

        {/* User Status Bar */}
        {isLoggedIn && (
          <div className="flex justify-center items-center gap-4 mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {email?.split("@")[0]}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isPremiumUser
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {isPremiumUser ? "👑 Premium" : "🆓 Free"}
            </span>
            {completedUnitIds.length > 0 && (
              <span className="text-sm text-green-600 dark:text-green-400">
                {completedUnitIds.length} {copy.completed}
              </span>
            )}
          </div>
        )}

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}

      {/* Stats Bar */}
      <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-3 shadow-sm">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {allDisplayUnits.length} {copy.unitsFound}
            {completedUnitIds.length > 0 && (
              <>
                {" "}
                • {completedUnitIds.length} {copy.completed}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Units Grid */}
      {allDisplayUnits && allDisplayUnits.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allDisplayUnits.map((unit) => {
            const isCompleted = completedUnitIds.includes(unit.id);
            const isPremiumPreview = unit.isPremiumPreview;

            return (
              <div key={unit.id} className="relative">
                {isPremiumPreview ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden opacity-75 border-2 border-yellow-300">
                    <div className="relative h-48 bg-gradient-to-br from-yellow-200 to-amber-200 flex items-center justify-center">
                      <span className="text-6xl">👑</span>
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {copy.premiumOnly}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">
                        {unit.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {unit.description}
                      </p>
                      <Link
                        href="/pricing"
                        className="block text-center bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        {copy.unlockPremium}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <UnitCard unit={unit} />
                    {isCompleted && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-10">
                        ✓
                      </div>
                    )}
                    {unit.is_premium && (
                      <div className="absolute top-3 left-3 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-10">
                        👑
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}

          {/* Premium Upgrade Card */}
          {shouldShowPremiumPreviews && <PremiumUpgradeCard />}
        </section>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {copy.noUnitsFound}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {copy.noUnitsSubtext}
            </p>
            <Link
              href="/eco-map"
              className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg hover:bg-[#059669] transition-colors"
            >
              {copy.backToEcoMap}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// app/(site)/units/SiteHomeClient.js - Updated with Ecosystem Support
// "use client";

// import UnitCard from "@/components/UnitCard";
// import { useLanguage } from "@/lib/contexts/LanguageContext";
// import Link from "next/link";
// import { countryNameLookup } from "@/lib/isoMappings";

// export default function SiteHomeClient({
//   featuredUnits,
//   challenges,
//   completedUnitIds = [],
//   filterInfo = {
//     isFiltered: false,
//     regionFilter: null,
//     marineZoneFilter: null,
//     ecosystemFilter: null, // ✅ NEW: Add ecosystem filter
//   },
// }) {
//   const { lang } = useLanguage();

//   // ✅ NEW: Ecosystem definitions for display
//   const ecosystemInfo = {
//     marine: {
//       name: "Marine & Ocean",
//       icon: "🌊",
//       color: "blue",
//       description: "Protect marine life and ocean ecosystems",
//     },
//     forest: {
//       name: "Forest & Jungle",
//       icon: "🌳",
//       color: "green",
//       description: "Safeguard forests and woodland creatures",
//     },
//     polar: {
//       name: "Polar Regions",
//       icon: "❄️",
//       color: "cyan",
//       description: "Champion polar regions and ice habitats",
//     },
//     grassland: {
//       name: "Grassland & Savanna",
//       icon: "🌾",
//       color: "yellow",
//       description: "Preserve savannas and prairie ecosystems",
//     },
//     mountains: {
//       name: "Mountain & Alpine",
//       icon: "🏔️",
//       color: "gray",
//       description: "Protect mountain ecosystems and alpine wildlife",
//     },
//     freshwater: {
//       name: "Freshwater & Rivers",
//       icon: "💧",
//       color: "teal",
//       description: "Safeguard rivers, lakes, and freshwater ecosystems",
//     },
//   };

//   const t = {
//     en: {
//       heroTitle: "Practise your English as you explore the planet ",
//       heroSubtitle:
//         "Neptune's Tribe is an English learning journey inspired by environmental action. Learn English. Support the Planet.",
//       allUnits: "All Learning Units",
//       unitsFound: "units found",
//       completed: "completed",
//       noUnitsFound: "No units found for this location",
//       noUnitsSubtext: "Try exploring other areas on your eco-map!",
//       backToEcoMap: "Back to Eco-Map",
//       backToAllUnits: "View all units",
//       clickHint: "Tip: Visit your eco-map to explore units by region",
//       helpingWith: "You're helping with", // ✅ NEW: For ecosystem challenges
//       urgentChallenge: "Urgent Environmental Challenge", // ✅ NEW
//     },
//     pt: {
//       heroTitle: "Pratique seu Inglês explorando o Planeta",
//       heroSubtitle:
//         "Neptune's Tribe é uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
//       allUnits: "Todas as Unidades",
//       unitsFound: "unidades encontradas",
//       completed: "concluídas",
//       noUnitsFound: "Nenhuma unidade encontrada para este local",
//       noUnitsSubtext: "Tente explorar outras áreas no seu eco-mapa!",
//       backToEcoMap: "Voltar ao Eco-Mapa",
//       backToAllUnits: "Ver todas as unidades",
//       clickHint:
//         "💡 Dica: Visite seu eco-mapa para explorar unidades por região",
//       helpingWith: "Você está ajudando com", // ✅ NEW
//       urgentChallenge: "Desafio Ambiental Urgente", // ✅ NEW
//     },
//   };

//   const copy = t[lang];

//   // Helper function to get display name for region
//   const getRegionDisplayName = (regionCode) => {
//     // Handle array format
//     if (regionCode?.startsWith("[") && regionCode?.endsWith("]")) {
//       try {
//         const codes = JSON.parse(regionCode);
//         return codes
//           .map(
//             (code) =>
//               Object.entries(countryNameLookup).find(
//                 ([name, lookup]) => lookup === code
//               )?.[0] || code
//           )
//           .join(", ");
//       } catch (e) {
//         return regionCode;
//       }
//     }

//     // Single region code - find country name
//     return (
//       Object.entries(countryNameLookup).find(
//         ([name, lookup]) => lookup === regionCode
//       )?.[0] || regionCode
//     );
//   };

//   // ✅ NEW: Create title based on filter (including ecosystem)
//   const getPageTitle = () => {
//     if (filterInfo.ecosystemFilter) {
//       const ecosystem = ecosystemInfo[filterInfo.ecosystemFilter];
//       return `${ecosystem?.icon || "🌍"} ${
//         ecosystem?.name || filterInfo.ecosystemFilter
//       } - Environmental Learning`;
//     } else if (filterInfo.regionFilter) {
//       const countryName = getRegionDisplayName(filterInfo.regionFilter);
//       return `${countryName} - English Learning Units`;
//     } else if (filterInfo.marineZoneFilter) {
//       const zoneName = decodeURIComponent(filterInfo.marineZoneFilter);
//       return `${zoneName} - Marine Learning Units`;
//     }
//     return copy.heroTitle;
//   };

//   const getPageSubtitle = () => {
//     if (filterInfo.ecosystemFilter) {
//       const ecosystem = ecosystemInfo[filterInfo.ecosystemFilter];
//       return `${copy.helpingWith} ${
//         ecosystem?.description || "environmental protection"
//       } • ${featuredUnits.length} ${copy.unitsFound}${
//         completedUnitIds.length > 0
//           ? ` • ${completedUnitIds.length} ${copy.completed}`
//           : ""
//       }`;
//     } else if (filterInfo.isFiltered) {
//       return `${featuredUnits.length} ${copy.unitsFound}${
//         completedUnitIds.length > 0
//           ? ` • ${completedUnitIds.length} ${copy.completed}`
//           : ""
//       }`;
//     }
//     return copy.heroSubtitle;
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
//       {/* Header Section */}
//       <div className="text-center mb-10">
//         <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//           {getPageTitle()}
//         </h1>

//         {/* <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
//           {getPageSubtitle()}
//         </p> */}

//         {/* ✅ NEW: Special banner for ecosystem challenges */}
//         {filterInfo.ecosystemFilter && (
//           <div className="max-w-2xl mx-auto mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-lg border border-red-200">
//             <div className="flex items-center justify-center gap-3 mb-2">
//               <span className="text-2xl animate-pulse">🚨</span>
//               <h3 className="font-bold text-lg text-red-800 dark:text-red-200">
//                 {copy.urgentChallenge}
//               </h3>
//               <span className="text-2xl animate-pulse">🚨</span>
//             </div>
//             <p className="text-sm text-red-700 dark:text-red-300">
//               Every unit you complete contributes to solving urgent
//               environmental challenges! Your learning makes a real difference in
//               protecting our planet.
//             </p>
//           </div>
//         )}

//         {/* Filter Navigation */}
//         {filterInfo.isFiltered && (
//           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
//             <Link
//               href="/units"
//               className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-[#10b981] transition-colors"
//             >
//               ← {copy.backToAllUnits}
//             </Link>
//             <span className="hidden sm:inline text-gray-400">•</span>
//             <Link
//               href="/eco-map"
//               className="inline-flex items-center text-sm text-[#10b981] hover:text-[#059669] transition-colors"
//             >
//               🗺️ {copy.backToEcoMap}
//             </Link>
//             {/* ✅ NEW: Link back to challenges if coming from ecosystem filter */}
//             {filterInfo.ecosystemFilter && (
//               <>
//                 <span className="hidden sm:inline text-gray-400">•</span>
//                 <Link
//                   href="/eco-map#challenges"
//                   className="inline-flex items-center text-sm text-red-600 hover:text-red-700 transition-colors"
//                 >
//                   🚨 View All Challenges
//                 </Link>
//               </>
//             )}
//           </div>
//         )}

//         {/* Tip for non-filtered view */}
//         {!filterInfo.isFiltered && (
//           <div className="mb-6">
//             <Link
//               href="/eco-map"
//               className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-[#10b981] transition-colors"
//             >
//               {copy.clickHint}
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* Units Grid or Empty State */}
//       {featuredUnits && featuredUnits.length > 0 ? (
//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {featuredUnits.map((unit) => {
//             const isCompleted = completedUnitIds.includes(unit.id);

//             return (
//               <div key={unit.id} className="relative">
//                 <UnitCard unit={unit} />
//                 {isCompleted && (
//                   <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
//                     ✓
//                   </div>
//                 )}
//                 {/* ✅ NEW: Special indicator for ecosystem challenge units */}
//                 {filterInfo.ecosystemFilter && (
//                   <div className="absolute top-3 left-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg animate-pulse">
//                     🚨
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </section>
//       ) : (
//         /* Empty State */
//         <div className="text-center py-16">
//           <div className="max-w-md mx-auto">
//             <div className="text-6xl mb-6">
//               {filterInfo.ecosystemFilter
//                 ? ecosystemInfo[filterInfo.ecosystemFilter]?.icon || "🌍"
//                 : "🌍"}
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//               {filterInfo.isFiltered ? copy.noUnitsFound : "No units available"}
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               {filterInfo.isFiltered
//                 ? filterInfo.ecosystemFilter
//                   ? `No ${ecosystemInfo[
//                       filterInfo.ecosystemFilter
//                     ]?.name.toLowerCase()} units available yet. Check back soon or try other ecosystems!`
//                   : copy.noUnitsSubtext
//                 : "Please check back later for new learning content."}
//             </p>

//             {filterInfo.isFiltered && (
//               <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                 <Link
//                   href="/eco-map"
//                   className="inline-block bg-[#10b981] text-white px-6 py-3 rounded-lg hover:bg-[#059669] transition-colors"
//                 >
//                   {copy.backToEcoMap}
//                 </Link>
//                 <Link
//                   href="/units"
//                   className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//                 >
//                   {copy.backToAllUnits}
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Back to Eco-Map link for filtered results */}
//       {filterInfo.isFiltered && featuredUnits.length > 0 && (
//         <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
//           <Link
//             href="/eco-map"
//             className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-[#10b981] transition-colors"
//           >
//             ←{" "}
//             {filterInfo.ecosystemFilter
//               ? "Back to Environmental Challenges"
//               : "Explore more regions on your Eco-Map"}
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// }
