"use client";

import ChallengeCard from "@/components/ChallengeCard";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function ChallengesHomeClient({ featuredChallenges }) {
  const { lang } = useLanguage();

  const t = {
    en: {
      heroTitle: "Single-Gap Challenges",
      heroSubtitle:
        "Test your English skills with our interactive gap fill challenges. Each series contains 10 targeted exercises to improve your vocabulary and grammar.",
    },
    pt: {
      heroTitle: "Desafios",
      heroSubtitle:
        "Teste suas habilidades em inglês com nossos desafios interativos.",
    },
  };

  const copy = t[lang];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
        {copy.heroTitle}
      </h1>
      <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
        {copy.heroSubtitle}
      </p>

      {/* Grid of Challenge Series */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {featuredChallenges.map((challenge) => (
          <ChallengeCard key={challenge.challenge_id} challenge={challenge} />
        ))}
      </section>
    </div>
  );
}
