import SingleGapFillSeries from "@/app/components/gapfill/SingleGapFillSeries";
import { fetchSingleGapChallenges } from "@/lib/data-service";

export default async function SingleGapChallengePage({ params }) {
  const challengeId = 1; // you can change this or make it dynamic later

  const exercises = await fetchSingleGapChallenges(challengeId);

  return (
    <div className="flex flex-col items-center pt-8 bg-white dark:bg-primary-900">
      <SingleGapFillSeries exercises={exercises} />
    </div>
  );
}

// import { useDarkMode } from "@/lib/contexts/DarkModeContext";
// const { darkMode, setDarkMode } = useDarkMode();
