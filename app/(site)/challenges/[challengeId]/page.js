import { fetchSingleGapChallenges } from "@/lib/data-service";
import ChallengePageClient from "./ChallengePageClient";
import Link from "next/link";

export default async function ChallengePage({ params }) {
  const { challengeId } = params;
  const numericChallengeId = Number(challengeId);

  try {
    const exercises = await fetchSingleGapChallenges(numericChallengeId);

    if (!exercises || exercises.length === 0) {
      return (
        <div className="container mx-auto p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Challenge Not Found!
            </h1>
            <p className="text-gray-600 mb-4">
              The challenge you&apos;re looking for doesn&apos;t exist or has no
              exercises.
            </p>
            <Link
              href="/challenges"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
            >
              Back to Challenges
            </Link>
          </div>
        </div>
      );
    }

    return (
      <ChallengePageClient
        exercises={exercises}
        challengeId={numericChallengeId}
      />
    );
  } catch (error) {
    console.error("Failed to load challenge:", error);
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-600 mb-4">
            There was an error loading this challenge. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
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
