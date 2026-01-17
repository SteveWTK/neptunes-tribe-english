// components/UnitCard.js - Corrected for Neptune's Tribe tier system
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  Crown,
  Lock,
  Play,
  Clock,
  MapPin,
  Calendar,
  LogIn,
} from "lucide-react";

const UnitCardEnhanced = ({
  unit,
  hasAccess = true,
  upgradeInfo = null,
  isWeeklyTheme = false,
  index = 0,
}) => {
  const { lang } = useLanguage();

  const t = {
    en: {
      startUnit: "Start Unit",
      thisWeek: "This Week",
      gaps: "Gaps",
      region: "Region",
      signIn: "Sign In",
      upgrade: "Upgrade",
      weeklyFeature: "Weekly Adventure",
    },
    pt: {
      startUnit: "Iniciar Unidade",
      thisWeek: "Esta Semana",
      gaps: "Lacunas",
      region: "Região",
      signIn: "Entrar",
      upgrade: "Fazer Upgrade",
      weeklyFeature: "Aventura Semanal",
    },
  };

  const copy = t[lang];

  // Determine theme background class
  const getThemeBgClass = (theme) => {
    switch (theme) {
      case "Environmental Heroes":
        return "bg-green-500 text-white";
      case "Endangered Species":
        return "bg-red-500 text-white";
      case "Endangered trees":
        return "bg-amber-500 text-white";
      case "Invertebrates":
        return "bg-purple-500 text-white";
      case "Marine Life":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const themeBgClass = getThemeBgClass(unit.theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      data-tour={index === 0 ? "unit-card" : undefined}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative group ${
        !hasAccess ? "opacity-95" : ""
      } ${isWeeklyTheme ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""}`}
    >
      {/* Weekly Theme Badge */}
      {isWeeklyTheme && (
        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {copy.thisWeek}
        </div>
      )}

      {/* Premium Badge - Only for truly premium content */}
      {unit.is_premium && (
        <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Premium
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={unit.image || "/images/placeholder.jpg"}
          alt={unit.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            !hasAccess ? "filter blur-sm" : ""
          }`}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Access overlay for restricted content */}
        {!hasAccess && upgradeInfo && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-center text-white">
              {upgradeInfo.action === "Sign In" ? (
                <>
                  <LogIn className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Sign in to access</p>
                  <p className="text-xs">{copy.weeklyFeature}</p>
                </>
              ) : (
                <>
                  <Lock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Premium Content</p>
                  <p className="text-xs">Upgrade for access</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Play button overlay */}
        {hasAccess && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Description */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {unit.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {unit.description}
        </p>

        {/* Theme Badge */}
        <span
          className={`inline-block mb-3 px-3 py-1 ${themeBgClass} text-xs font-medium rounded-full`}
        >
          {unit.theme}
        </span>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{unit.region_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>
              {copy.gaps}: {unit.length}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full">
          {hasAccess ? (
            <Link
              href={`/units/${unit.id}`}
              className="block w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                {copy.startUnit}
              </div>
            </Link>
          ) : upgradeInfo ? (
            <Link
              href={upgradeInfo.href}
              className={`block w-full text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                upgradeInfo.action === "Sign In"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {upgradeInfo.action === "Sign In" ? (
                  <LogIn className="w-4 h-4" />
                ) : (
                  <Crown className="w-4 h-4" />
                )}
                {upgradeInfo.action}
              </div>
            </Link>
          ) : (
            <div className="w-full bg-gray-300 text-gray-600 text-center py-3 px-4 rounded-lg font-semibold">
              Access Restricted
            </div>
          )}
        </div>
      </div>

      {/* Weekly theme glow effect */}
      {isWeeklyTheme && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-green-400/20 pointer-events-none" />
      )}
    </motion.div>
  );
};

export default UnitCardEnhanced;

// import React from "react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { useLanguage } from "@/lib/contexts/LanguageContext";
// import { useOnboarding } from "@/lib/contexts/OnboardingContext";
// import { Crown, Lock, Play, Clock, MapPin, Calendar } from "lucide-react";

// const UnitCardEnhanced = ({
//   unit,
//   isPremiumUser = false,
//   isWeeklyTheme = false,
//   index = 0,
// }) => {
//   const { lang } = useLanguage();
//   const { completeStep } = useOnboarding();

//   const t = {
//     en: {
//       premium: "Premium",
//       upgradeToUnlock: "Upgrade to Unlock",
//       startUnit: "Start Unit",
//       thisWeek: "This Week",
//       gaps: "Gaps",
//       region: "Region",
//       premiumContent: "Premium Content",
//       weeklyFeature: "Weekly Feature",
//     },
//     pt: {
//       premium: "Premium",
//       upgradeToUnlock: "Fazer Upgrade para Desbloquear",
//       startUnit: "Iniciar Unidade",
//       thisWeek: "Esta Semana",
//       gaps: "Lacunas",
//       region: "Região",
//       premiumContent: "Conteúdo Premium",
//       weeklyFeature: "Destaque Semanal",
//     },
//   };

//   const copy = t[lang];

//   // Determine theme background class
//   let themeBgClass = "";
//   if (unit.theme === "Environmental Heroes") {
//     themeBgClass = "bg-green-500 text-white";
//   } else if (unit.theme === "Endangered Species") {
//     themeBgClass = "bg-red-500 text-white";
//   } else if (unit.theme === "Endangered trees") {
//     themeBgClass = "bg-amber-500 text-white";
//   } else if (unit.theme === "Invertebrates") {
//     themeBgClass = "bg-purple-500 text-white";
//   } else {
//     themeBgClass = "bg-gray-500 text-white";
//   }

//   const isPremiumContent = unit.is_premium;
//   const hasAccess = !isPremiumContent || isPremiumUser;

//   // Handle unit click with onboarding tracking
//   const handleUnitClick = () => {
//     completeStep("hasTriedUnit");
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3, delay: index * 0.1 }}
//       data-tour={index === 0 ? "unit-card" : undefined}
//       className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative group ${
//         !hasAccess ? "opacity-95" : ""
//       } ${isWeeklyTheme ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""}`}
//     >
//       {/* Weekly Theme Badge */}
//       {isWeeklyTheme && (
//         <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 flex items-center gap-1">
//           <Calendar className="w-3 h-3" />
//           {copy.thisWeek}
//         </div>
//       )}

//       {/* Premium Badge */}
//       {isPremiumContent && (
//         <div className="absolute top-3 right-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold z-20 flex items-center gap-1">
//           <Crown className="w-3 h-3" />
//           {copy.premium}
//         </div>
//       )}

//       {/* Image Container */}
//       <div className="relative h-48 overflow-hidden">
//         <img
//           src={unit.image || "/images/placeholder.jpg"}
//           alt={unit.title}
//           className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
//             !hasAccess ? "filter blur-sm" : ""
//           }`}
//         />

//         {/* Overlay gradient */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

//         {/* Lock overlay for premium content */}
//         {isPremiumContent && !isPremiumUser && (
//           <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
//             <div className="text-center text-white">
//               <Lock className="w-8 h-8 mx-auto mb-2" />
//               <p className="text-sm font-semibold">{copy.premiumContent}</p>
//             </div>
//           </div>
//         )}

//         {/* Play button overlay */}
//         {hasAccess && (
//           <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//             <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
//               <Play className="w-8 h-8 text-white ml-1" />
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="p-5">
//         {/* Title and Description */}
//         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
//           {unit.title}
//         </h3>
//         <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
//           {unit.description}
//         </p>

//         {/* Theme Badge */}
//         <span
//           className={`inline-block mb-3 px-3 py-1 ${themeBgClass} text-xs font-medium rounded-full`}
//         >
//           {unit.theme}
//         </span>

//         {/* Meta Information */}
//         <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
//           <div className="flex items-center gap-1">
//             <MapPin className="w-4 h-4" />
//             <span className="truncate">{unit.region_name}</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Clock className="w-4 h-4" />
//             <span>
//               {copy.gaps}: {unit.length}
//             </span>
//           </div>
//         </div>

//         {/* Action Button */}
//         <div className="w-full">
//           {hasAccess ? (
//             <Link
//               href={`/units/${unit.id}`}
//               onClick={handleUnitClick}
//               className="block w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
//             >
//               <div className="flex items-center justify-center gap-2">
//                 <Play className="w-4 h-4" />
//                 {copy.startUnit}
//               </div>
//             </Link>
//           ) : (
//             <Link
//               href="/pricing"
//               className="block w-full bg-gray-400 hover:bg-gray-500 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300"
//             >
//               <div className="flex items-center justify-center gap-2">
//                 <Lock className="w-4 h-4" />
//                 {copy.upgradeToUnlock}
//               </div>
//             </Link>
//           )}
//         </div>
//       </div>

//       {/* Weekly theme glow effect */}
//       {isWeeklyTheme && (
//         <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-green-400/20 pointer-events-none" />
//       )}
//     </motion.div>
//   );
// };

// export default UnitCardEnhanced;
