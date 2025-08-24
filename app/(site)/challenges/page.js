// app\(site)\challenges\page.js - Enhanced with Premium Support
import {
  fetchChallengeDetails,
  fetchFeaturedChallenges,
} from "@/lib/data-service";
import { auth } from "@/lib/auth";
import ChallengesHomeClient from "./ChallengesHomeClient";

export default async function ChallengesHomePage() {
  const session = await auth();
  const isPremiumUser = session?.user?.is_premium || false;
  const isLoggedIn = !!session?.user?.email;

  // Fetch all challenges (no premium filtering at listing level)
  const challenges = await fetchFeaturedChallenges();

  const challengeDetails = await Promise.all(
    challenges.map((challenge) => fetchChallengeDetails(challenge.challenge_id))
  );

  const featuredChallenges = challenges.map((challenge, index) => ({
    ...challenge,
    ...challengeDetails[index],
  }));

  return (
    <ChallengesHomeClient
      featuredChallenges={featuredChallenges}
      userInfo={{
        isLoggedIn,
        isPremiumUser,
        email: session?.user?.email,
      }}
    />
  );
}

// app\(site)\challenges\page.js
// import {
//   fetchChallengeDetails,
//   fetchFeaturedChallenges,
// } from "@/lib/data-service";
// import ChallengesHomeClient from "./ChallengesHomeClient";

// export default async function ChallengesHomePage() {
//   const challenges = await fetchFeaturedChallenges();
//   const challengeDetails = await Promise.all(
//     challenges.map((challenge) => fetchChallengeDetails(challenge.challenge_id))
//   );

//   const featuredChallenges = challenges.map((challenge, index) => ({
//     ...challenge,
//     ...challengeDetails[index],
//   }));

//   return <ChallengesHomeClient featuredChallenges={featuredChallenges} />;
// }
