import {
  fetchFeaturedUnits,
  fetchUnitDetails,
  fetchSingleGapChallenges,
} from "@/lib/data-service";
import SiteHomeClient from "./SiteHomeClient"; // 👈 new component

export default async function SiteHomePage() {
  const units = await fetchFeaturedUnits();
  const unitDetails = await Promise.all(
    units.map((unit) => fetchUnitDetails(unit.id))
  );

  const featuredUnits = units.map((unit, index) => ({
    ...unit,
    ...unitDetails[index],
  }));

  const challenges = await fetchSingleGapChallenges("default");

  return (
    <SiteHomeClient featuredUnits={featuredUnits} challenges={challenges} />
  );
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
