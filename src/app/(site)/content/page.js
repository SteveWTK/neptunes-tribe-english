import {
  fetchFeaturedUnits,
  fetchUnitDetails,
  fetchSingleGapChallenges,
} from "@/lib/data-service";
import SiteHomeClient from "./SiteHomeClient"; // 👈 new component

// Force dynamic rendering - don't prerender at build time
export const dynamic = "force-dynamic";

export default async function SiteHomePage() {
  try {
    const units = await fetchFeaturedUnits();

    // Fetch unit details with error handling for individual units
    const unitDetailsPromises = units.map(async (unit) => {
      try {
        return await fetchUnitDetails(unit.id);
      } catch (error) {
        console.error(`Failed to fetch details for unit ${unit.id}:`, error);
        return null; // Return null for failed fetches
      }
    });

    const unitDetails = await Promise.all(unitDetailsPromises);

    // Filter out any units that failed to fetch details
    const featuredUnits = units
      .map((unit, index) => ({
        ...unit,
        ...unitDetails[index],
      }))
      .filter((unit, index) => unitDetails[index] !== null);

    const challenges = await fetchSingleGapChallenges("default");

    return (
      <SiteHomeClient featuredUnits={featuredUnits} challenges={challenges} />
    );
  } catch (error) {
    console.error("Error loading content page:", error);
    // Return a fallback UI instead of crashing
    return (
      <SiteHomeClient featuredUnits={[]} challenges={[]} />
    );
  }
}

// import UnitCard from "@/components/UnitCard";
// import {
//   fetchFeaturedUnits,
//   fetchSingleGapChallenges,
//   fetchUnitDetails,
// } from "@/lib/data-service";

// export default async function SiteHomePage() {
//   const units = await fetchFeaturedUnits(); // Now only "Featured" units
//   const unitDetails = await Promise.all(
//     units.map((unit) => fetchUnitDetails(unit.id))
//   );

//   const featuredUnits = units.map((unit, index) => ({
//     ...unit,
//     ...unitDetails[index],
//   }));

//   const challenges = await fetchSingleGapChallenges("default");

//   const t = {
//     en: {
//       heroTitle: "Learn English while Exploring the Planet",
//       heroSubtitle:
//         "Neptune's Tribe is an English learning journey inspired by environmental action. Learn English. Support the Planet.",
//     },
//     pt: {
//       heroTitle: "Aprenda Inglês. Apoie o Planeta.",
//       heroSubtitle:
//         "Neptune's Tribe é uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
//     },
//   };

//   const copy = t["en"];

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
//         {copy.heroTitle}
//       </h1>

//       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {featuredUnits.map((unit) => (
//           <UnitCard key={unit.id} unit={unit} />
//         ))}
//       </section>

//       <h2 className="text-2xl font-semibold mt-16 mb-6 text-gray-800 dark:text-white">
//         Quick Challenges
//       </h2>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {challenges.slice(0, 3).map((challenge) => (
//           <div
//             key={challenge.id}
//             className="bg-white dark:bg-gray-900 p-4 rounded shadow"
//           >
//             <img
//               src={challenge.imageUrl || "/eco/bg_rainforest.jpg"}
//               alt={challenge.title}
//               className="w-full h-32 object-cover rounded"
//             />
//             <h3 className="text-lg font-bold mt-2 text-gray-900 dark:text-white">
//               {challenge.title}
//             </h3>
//             <a
//               href={`/challenges/${challenge.id}`}
//               className="inline-block mt-3 text-blue-600 dark:text-blue-400 font-medium"
//             >
//               Try Now →
//             </a>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
