// app\(site)\challenges\ChallengesHomeClient.js - Enhanced with Premium Support
"use client";

import ChallengeCard from "@/components/ChallengeCard";
import { useLanguage } from "@/lib/contexts/LanguageContext";

export default function ChallengesHomeClient({
  featuredChallenges,
  userInfo = {},
}) {
  const { lang } = useLanguage();
  const { isPremiumUser = false } = userInfo;

  const t = {
    en: {
      heroTitle: "Single-Gap Challenges",
      heroSubtitle:
        "Test your English skills with our interactive gap-fill challenges. Each series contains 10 targeted items to improve your vocabulary and grammar.",
      premiumChallenges: "Premium challenges available",
      upgradeForMore: "Upgrade to access all challenges",
    },
    pt: {
      heroTitle: "Desafios",
      heroSubtitle:
        "Teste suas habilidades em inglês com nossos desafios interativos.",
      premiumChallenges: "Desafios premium disponíveis",
      upgradeForMore: "Faça upgrade para acessar todos os desafios",
    },
    th: {
      heroTitle: "แบบฝึกหัดเติมคำในช่องว่าง",
      heroSubtitle:
        "ทดสอบทักษะภาษาอังกฤษของคุณด้วยแบบฝึกหัดเติมคำในช่องว่างแบบโต้ตอบ แต่ละชุดมี 10 ข้อเพื่อพัฒนาคำศัพท์และไวยากรณ์ของคุณ",
      premiumChallenges: "แบบฝึกหัดพรีเมียมที่พร้อมใช้งาน",
      upgradeForMore: "อัปเกรดเพื่อเข้าถึงแบบฝึกหัดทั้งหมด",
    },
  };

  const copy = t[lang];

  // Count premium vs free challenges
  const premiumChallenges = featuredChallenges.filter((c) => c.is_premium);
  const freeChallenges = featuredChallenges.filter((c) => !c.is_premium);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
        {copy.heroTitle}
      </h1>
      <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
        {copy.heroSubtitle}
      </p>

      {/* Stats Bar */}
      {/* <div className="flex justify-center mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg px-6 py-3 shadow-sm text-center">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{featuredChallenges.length} total challenges</span>
            <span>•</span>
            <span>{freeChallenges.length} free</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span>👑</span>
              <span>{premiumChallenges.length} premium</span>
            </span>
            {!isPremiumUser && premiumChallenges.length > 0 && (
              <>
                <span>•</span>
                <a
                  href="/pricing"
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  {copy.upgradeForMore}
                </a>
              </>
            )}
          </div>
        </div>
      </div> */}

      {/* Grid of Challenge Series */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {featuredChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.challenge_id}
            challenge={challenge}
            isPremiumUser={isPremiumUser}
          />
        ))}
      </section>
    </div>
  );
}

// app\(site)\challenges\ChallengesHomeClient.js
// "use client";

// import ChallengeCard from "@/components/ChallengeCard";
// import { useLanguage } from "@/lib/contexts/LanguageContext";

// export default function ChallengesHomeClient({ featuredChallenges }) {
//   const { lang } = useLanguage();

//   const t = {
//     en: {
//       heroTitle: "Single-Gap Challenges",
//       heroSubtitle:
//         "Test your English skills with our interactive gap-fill challenges. Each series contains 10 targeted exercises to improve your vocabulary and grammar.",
//     },
//     pt: {
//       heroTitle: "Desafios",
//       heroSubtitle:
//         "Teste suas habilidades em inglês com nossos desafios interativos.",
//     },
//   };

//   const copy = t[lang];

//   return (
//     <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 sm:px-8 py-8">
//       <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
//         {copy.heroTitle}
//       </h1>
//       <p className="text-lg text-center text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
//         {copy.heroSubtitle}
//       </p>

//       {/* Grid of Challenge Series */}
//       <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {featuredChallenges.map((challenge) => (
//           <ChallengeCard key={challenge.challenge_id} challenge={challenge} />
//         ))}
//       </section>
//     </div>
//   );
// }
