"use client";

import UnitCard from "@/components/UnitCard";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function SiteHomeClient({ featuredUnits, challenges }) {
  const { lang } = useLanguage();
  const topUnit = featuredUnits[0];
  const remainingUnits = featuredUnits.slice(1);

  const t = {
    en: {
      heroTitle: "Practice your English exploring the planet",
      heroSubtitle:
        "Neptune's Tribe is an English learning journey inspired by environmental action. Learn English. Support the Planet.",
    },
    pt: {
      heroTitle: "Pratique seu Inglês explorando o Planeta.",
      heroSubtitle:
        "Neptune's Tribe é uma jornada de aprendizado de inglês inspirada pela ação ambiental.",
    },
  };

  const copy = t[lang];

  const languageOptions = {
    en: { label: "English", flag: "/flags/en.svg" },
    pt: { label: "Português", flag: "/flags/pt.svg" },
    th: { label: "ไทย", flag: "/flags/th.svg" },
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-10">
        {copy.heroTitle}
      </h1>

      {/* Grid of Units */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {featuredUnits.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </section>
    </div>
  );
}
