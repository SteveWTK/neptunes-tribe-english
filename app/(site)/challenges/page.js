import {
  fetchChallengeDetails,
  fetchFeaturedChallenges,
} from "@/lib/data-service";
import ChallengesHomeClient from "./ChallengesHomeClient";

export default async function ChallengesHomePage() {
  const challenges = await fetchFeaturedChallenges();
  const challengeDetails = await Promise.all(
    challenges.map((challenge) => fetchChallengeDetails(challenge.challenge_id))
  );

  const featuredChallenges = challenges.map((challenge, index) => ({
    ...challenge,
    ...challengeDetails[index],
  }));

  return <ChallengesHomeClient featuredChallenges={featuredChallenges} />;
}

// import SingleGapFillSeries from "@/app/components/gapfill/SingleGapFillSeries";
// import { fetchSingleGapChallenges } from "@/lib/data-service";

// export default async function SingleGapChallengePage({ params }) {
//   const challengeId = 4; // you can change this or make it dynamic later

//   const exercises = await fetchSingleGapChallenges(challengeId);

//   return (
//     <div className="flex flex-col items-center pt-8 bg-white dark:bg-primary-900">
//       <SingleGapFillSeries exercises={exercises} />
//     </div>
//   );
// }
