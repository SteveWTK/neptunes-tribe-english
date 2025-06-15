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
