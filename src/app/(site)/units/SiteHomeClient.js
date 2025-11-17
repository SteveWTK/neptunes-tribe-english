// app/(site)/units/SiteHomeClient.js - Enhanced with Premium UI and Filtering
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UnitCard from "@/components/UnitCard";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import Link from "next/link";
import { countryNameLookup } from "@/lib/isoMappings";
import brandConfig from "@/config/brand.config";
import { getWorldById } from "@/data/worldsConfig";

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

  const { isLoggedIn, isPremiumUser, isPlatformAdmin, email } = userInfo;

  // Get featured world info
  const featuredWorldId = brandConfig.contentStructure.featuredWorld;
  const featuredWorldData = getWorldById(featuredWorldId);

  const t = {
    en: {
      heroTitle: "Practise your English as you explore the planet",
      heroSubtitle:
        "Neptune's Tribe is an English learning journey inspired by environmental action. Learn English. Support the Planet.",
      allUnits: "All Learning Units",
      featuredWorld: "Featured World",
      viewingWorld: "You're viewing units from",
      adminViewingAll: "Admin View: Showing all units from all worlds",
      unitsFound: "units found",
      completed: "completed",
      premiumOnly: "Premium Only",
      upgradeToUnlock: "Upgrade to Unlock",
      loginToAccess: "Login to Access",
      clickHint: "Tip: Visit your eco-map to explore units by region",

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
      heroTitle: "Pratique seu Inglês explorando o planeta",
      heroSubtitle:
        "Neptune's Tribe é uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
      allUnits: "Todas as Unidades",
      featuredWorld: "Mundo em Destaque",
      viewingWorld: "Você está vendo unidades de",
      adminViewingAll:
        "Visão Admin: Mostrando todas as unidades de todos os mundos",
      unitsFound: "unidades encontradas",
      completed: "concluídas",
      premiumOnly: "Apenas Premium",
      upgradeToUnlock: "Faça Upgrade para Desbloquear",
      loginToAccess: "Entre para Acessar",
      clickHint:
        "💡 Dica: Visite seu eco-mapa para explorar unidades por região",

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

  // Remove premium previews logic since we're showing all actual units now
  const allDisplayUnits = featuredUnits;

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
    <div className=" bg-white dark:bg-primary-950 rounded-lg px-4 py-1 shadow-lg sm:w-1/2 self-center mb-2">
      {/* <div className="flex flex-row-reverse items-center justify-between mb-2">
        <h3 className="font-bold text-gray-800 dark:text-white">
          {copy.filters}
        </h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent-500"
        >
          {copy.clearFilters}
        </button>
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {copy.sortBy}
          </label>
          <select
            value={filterInfo.sortBy || "rank"}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full px-2 py-1 border-b hover:border-b-2 border-accent-400 dark:border-accent-400 rounded-md bg-white dark:bg-primary-950 text-gray-900 dark:text-white"
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
              className="w-full px-2 py-1 border-b hover:border-b-2 border-accent-400 dark:border-accent-400 rounded-md bg-white dark:bg-primary-950 text-gray-900 dark:text-white"
            >
              <option value="all">{copy.showAll}</option>
              <option value="completed">{copy.showCompleted}</option>
              <option value="incomplete">{copy.showIncomplete}</option>
            </select>
          </div>
        )}

        {/* Premium Status (info only) */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account Type
          </label>
          <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm">
            {isPremiumUser ? "👑 Premium" : "Free"}
          </div>
        </div> */}
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
      <div className="text-center mb-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {getPageTitle()}
        </h1>

        {/* Tip for non-filtered view  */}
        {/* {!filterInfo.isFiltered && (
          <div className="mb-3">
            <Link
              href="/eco-map"
              className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-[#10b981] transition-colors"
            >
              {copy.clickHint}
            </Link>
          </div>
        )} */}

        {/* User Status Bar */}
        {isLoggedIn && (
          <div className="flex justify-center items-center gap-2 mb-2s">
            {/* <span className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {email?.split("@")[0]}
            </span> */}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isPremiumUser
                  ? "bg-accent-100 text-accent-800 dark:bg-accent-900 dark:text-accent-200"
                  : "bg-gray-100 text-premium-600 dark:bg-primary-700 dark:text-premium-400"
              }`}
            >
              {isPremiumUser ? "👑 Premium" : "Explorer"}
            </span>
            {/* {completedUnitIds.length > 0 && (
              <span className="text-sm text-accent-600 dark:text-accent-400">
                {completedUnitIds.length} {copy.completed}
              </span>
            )} */}
          </div>
        )}
        {/* Filter Toggle */}
        {/* <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-1 bg-premium-500 text-gray-800 dark:text-white rounded-xl hover:bg-premium-600 transition-colors"
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button> */}
      </div>

      {/* Featured World Banner */}
      {featuredWorldData && (
        <div className="mb-4 max-w-4xl mx-auto">
          {isPlatformAdmin ? (
            <div className="rounded-lg px-6 pb-2 shadow-md text-center">
              <p className="text-gray-800 dark:text-gray-50">
                {copy.adminViewingAll}
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-1 bg-premium-500 text-gray-800 dark:text-white rounded-xl hover:bg-premium-600 transition-colors"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          ) : (
            <div
              className="rounded-lg px-6 pb-2 shadow-md text-center text-gray-800 dark:text-white"
              // style={{
              //   background: `linear-gradient(135deg, ${featuredWorldData.color.primary} 0%, ${featuredWorldData.color.secondary} 100%)`,
              // }}
            >
              {/* <p className="text-sm opacity-90 mb-1">{copy.featuredWorld}</p> */}
              <p className="text-xl font-bold">{featuredWorldData.name}</p>
              {/* <p className="text-sm opacity-90 mt-1">
                {featuredWorldData.description}
              </p> */}
            </div>
          )}
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}

      {/* Stats Bar */}
      {/* <div className="flex justify-center mb-8">
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
      </div> */}

      {/* Units Grid */}
      {allDisplayUnits && allDisplayUnits.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allDisplayUnits.map((unit) => {
            const isCompleted = completedUnitIds.includes(unit.id);

            return (
              <div key={unit.id} className="relative">
                <UnitCard unit={unit} isPremiumUser={isPremiumUser} />
                {isCompleted && (
                  <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-20">
                    ✓
                  </div>
                )}
                {/* Special indicator for ecosystem challenge units */}
                {filterInfo.ecosystemFilter && (
                  <div className="absolute top-3 right-14 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg animate-pulse z-10">
                    🚨
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

// Enhanced SiteHomeClient.js with corrected tier logic
// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import UnitCard from "@/components/UnitCard";
// import { useLanguage } from "@/lib/contexts/LanguageContext";
// import Link from "next/link";
// import { countryNameLookup } from "@/lib/isoMappings";
// import { useOnboarding } from "@/lib/contexts/OnboardingContext";

// export default function SiteHomeClientEnhanced({
//   featuredUnits,
//   challenges,
//   completedUnitIds = [],
//   filterInfo = {},
//   userInfo = {},
//   currentWeeklyTheme = null,
// }) {
//   const { lang } = useLanguage();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [showFilters, setShowFilters] = useState(false);
//   const { completeStep } = useOnboarding();

//   const { isLoggedIn, userTier, email } = userInfo; // userTier: 'explorer', 'pro', 'premium', or null

//   // Helper function to determine if user has access to units
//   const hasAccessToUnit = (unit) => {
//     // All logged-in users (Explorer, Pro, Premium) have access to weekly theme units
//     if (currentWeeklyTheme && isWeeklyThemeUnit(unit)) {
//       return isLoggedIn;
//     }

//     // For non-theme units, apply premium restrictions
//     if (unit.is_premium) {
//       return userTier === "pro" || userTier === "premium";
//     }

//     // Free units available to everyone
//     return true;
//   };

//   // Helper function to check if unit is part of weekly theme
//   const isWeeklyThemeUnit = (unit) => {
//     if (!currentWeeklyTheme) return false;

//     const unitRegions = parseRegionCodes(unit.region_code);
//     const unitMarineZones = parseMarineZones(unit.marine_zone);

//     const matchesRegion = unitRegions.some((region) =>
//       currentWeeklyTheme.featured_regions?.includes(region.toUpperCase())
//     );

//     const matchesMarineZone = unitMarineZones.some((zone) =>
//       currentWeeklyTheme.featured_marine_zones?.includes(zone)
//     );

//     return matchesRegion || matchesMarineZone;
//   };

//   // Helper function to get upgrade message based on unit type
//   const getUpgradeMessage = (unit) => {
//     if (isWeeklyThemeUnit(unit) && !isLoggedIn) {
//       return {
//         message: "Sign in to join this week's adventure",
//         action: "Sign In",
//         href: "/login",
//       };
//     }

//     if (unit.is_premium && (!userTier || userTier === "explorer")) {
//       return {
//         message: "Upgrade to Pro for premium content",
//         action: "Upgrade to Pro",
//         href: "/pricing",
//       };
//     }

//     return null;
//   };

//   // Filter units based on access and preferences
//   const getDisplayUnits = () => {
//     let unitsToShow = featuredUnits;

//     // If there's a weekly theme, prioritize theme units for logged-in users
//     if (currentWeeklyTheme && isLoggedIn) {
//       const themeUnits = unitsToShow.filter(isWeeklyThemeUnit);
//       const otherUnits = unitsToShow.filter((unit) => !isWeeklyThemeUnit(unit));

//       // Show theme units first, then others
//       unitsToShow = [...themeUnits, ...otherUnits];
//     }

//     return unitsToShow;
//   };

//   // Onboarding: Track when user views units page
//   React.useEffect(() => {
//     completeStep("hasViewedUnits");
//   }, [completeStep]);

//   const displayUnits = getDisplayUnits();

//   const t = {
//     en: {
//       heroTitle: "Practice your English as you explore the planet",
//       weeklyAdventure: "This Week's Tribal Adventure",
//       joinWeeklyTheme: "Join This Week's Adventure",
//       allUnits: "All Learning Units",
//       signInToJoin: "Sign in to join the weekly adventure",
//       upgradeForPremium: "Upgrade for premium content access",
//       conversationClasses: "Live Conversation Classes",
//       explorerAccess: "Listen to classes",
//       proAccess: "Participate in classes",
//       premiumAccess: "Participate + Vote on themes",
//     },
//     pt: {
//       heroTitle: "Pratique seu inglês explorando o planeta",
//       weeklyAdventure: "Aventura Tribal desta Semana",
//       joinWeeklyTheme: "Participe da Aventura desta Semana",
//       allUnits: "Todas as Unidades",
//       signInToJoin: "Entre para participar da aventura semanal",
//       upgradeForPremium: "Faça upgrade para acesso a conteúdo premium",
//       conversationClasses: "Aulas de Conversação ao Vivo",
//       explorerAccess: "Ouvir as aulas",
//       proAccess: "Participar das aulas",
//       premiumAccess: "Participar + Votar nos temas",
//     },
//   };

//   const copy = t[lang];

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
//       {/* Header Section */}
//       <div className="text-center mb-8">
//         <h1
//           className="units-header text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
//           data-tour="units-header"
//         >
//           {currentWeeklyTheme ? copy.weeklyAdventure : copy.heroTitle}
//         </h1>

//         {/* Weekly Theme Banner */}
//         {currentWeeklyTheme && (
//           <div className="mb-6 mx-auto max-w-4xl" data-tour="weekly-theme">
//             <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl p-6 shadow-lg">
//               <h2 className="text-2xl font-bold mb-2">
//                 {lang === "pt"
//                   ? currentWeeklyTheme.theme_title_pt
//                   : currentWeeklyTheme.theme_title}
//               </h2>
//               <p className="text-blue-100 mb-4">
//                 {lang === "pt"
//                   ? currentWeeklyTheme.theme_description_pt
//                   : currentWeeklyTheme.theme_description}
//               </p>

//               {/* Tier Access Information */}
//               <div className="bg-white/10 rounded-lg p-4 mb-4">
//                 <h3 className="font-semibold mb-2">
//                   {copy.conversationClasses}
//                 </h3>
//                 <div className="grid md:grid-cols-3 gap-4 text-sm">
//                   <div
//                     className={`p-3 rounded-lg ${
//                       userTier === "explorer" ? "bg-white/20" : "bg-white/10"
//                     }`}
//                   >
//                     <div className="font-medium">Explorer</div>
//                     <div>{copy.explorerAccess}</div>
//                   </div>
//                   <div
//                     className={`p-3 rounded-lg ${
//                       userTier === "pro" ? "bg-white/20" : "bg-white/10"
//                     }`}
//                   >
//                     <div className="font-medium">Pro</div>
//                     <div>{copy.proAccess}</div>
//                   </div>
//                   <div
//                     className={`p-3 rounded-lg ${
//                       userTier === "premium" ? "bg-white/20" : "bg-white/10"
//                     }`}
//                   >
//                     <div className="font-medium">Premium</div>
//                     <div>{copy.premiumAccess}</div>
//                   </div>
//                 </div>
//               </div>

//               {!isLoggedIn && (
//                 <Link
//                   href="/login"
//                   className="inline-block bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg font-medium transition-all duration-200"
//                 >
//                   {copy.signInToJoin}
//                 </Link>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Units Grid */}
//       {displayUnits && displayUnits.length > 0 ? (
//         <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {displayUnits.map((unit, index) => {
//             const isCompleted = completedUnitIds.includes(unit.id);
//             const hasAccess = hasAccessToUnit(unit);
//             const upgradeInfo = hasAccess ? null : getUpgradeMessage(unit);
//             const isThemeUnit = isWeeklyThemeUnit(unit);

//             return (
//               <div key={unit.id} className="relative">
//                 <UnitCard
//                   unit={unit}
//                   hasAccess={hasAccess}
//                   upgradeInfo={upgradeInfo}
//                   isWeeklyTheme={isThemeUnit}
//                   index={index}
//                 />
//                 {isCompleted && (
//                   <div className="absolute top-3 left-3 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg z-20">
//                     ✓
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
//             <div className="text-6xl mb-6">🌍</div>
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
//               No units available
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               Check back soon for new learning adventures!
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // Helper functions (add these to your utils or keep in component)
// const parseRegionCodes = (regionCode) => {
//   if (!regionCode) return [];
//   if (regionCode.startsWith("[") && regionCode.endsWith("]")) {
//     try {
//       return JSON.parse(regionCode);
//     } catch (e) {
//       console.warn("Failed to parse region code array:", regionCode);
//       return [];
//     }
//   }
//   return [regionCode];
// };

// const parseMarineZones = (marineZone) => {
//   if (!marineZone) return [];
//   if (marineZone.startsWith("[") && marineZone.endsWith("]")) {
//     try {
//       return JSON.parse(marineZone);
//     } catch (e) {
//       console.warn("Failed to parse marine zone array:", marineZone);
//       return [];
//     }
//   }
//   return [marineZone];
// };
