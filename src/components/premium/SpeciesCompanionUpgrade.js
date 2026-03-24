"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { usePremiumUpgrade } from "@/lib/contexts/PremiumUpgradeContext";
import { NGO_DONATION_PERCENTAGE } from "@/config/premiumConfig";
import Image from "next/image";
import { X, Sparkles, Heart, TreePine } from "lucide-react";

const translations = {
  en: {
    message: "Help save me and my fellow endangered species in real life! Upgrade to Premium and {percentage}% of your subscription supports conservation NGOs.",
    upgradeToPremium: "Upgrade to Premium",
    maybeLater: "Maybe later",
    supportConservation: "Support Real Conservation",
  },
  pt: {
    message: "Ajude a salvar eu e meus companheiros de especies ameacadas na vida real! Atualize para Premium e {percentage}% da sua assinatura apoia ONGs de conservacao.",
    upgradeToPremium: "Atualizar para Premium",
    maybeLater: "Talvez depois",
    supportConservation: "Apoie a Conservacao Real",
  },
  th: {
    message: "ช่วยรักษาฉันและเพื่อนสัตว์ใกล้สูญพันธุ์ในชีวิตจริง! อัปเกรดเป็น Premium และ {percentage}% ของการสมัครสมาชิกของคุณจะสนับสนุน NGO ด้านการอนุรักษ์",
    upgradeToPremium: "อัปเกรดเป็น Premium",
    maybeLater: "ไว้ทีหลัง",
    supportConservation: "สนับสนุนการอนุรักษ์จริง",
  },
};

/**
 * SpeciesCompanionUpgrade - A speech bubble from the species avatar
 * encouraging users to upgrade to Premium to support real conservation.
 * Appears after 3+ lesson completions for non-premium users.
 */
export default function SpeciesCompanionUpgrade() {
  const router = useRouter();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;
  const { shouldShowCompanionUpgrade, journey, updatePromptState } = usePremiumUpgrade();

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Show with a slight delay for better UX
  useEffect(() => {
    if (shouldShowCompanionUpgrade) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowCompanionUpgrade]);

  if (!shouldShowCompanionUpgrade || !visible) return null;

  const avatar = journey?.species_avatar;
  const speciesName = lang === "pt"
    ? (avatar?.common_name_pt || avatar?.common_name)
    : avatar?.common_name;

  const message = copy.message.replace("{percentage}", NGO_DONATION_PERCENTAGE);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      updatePromptState("companionUpgradeShown", true);
    }, 300);
  };

  const handleUpgrade = () => {
    updatePromptState("companionUpgradeShown", true);
    router.push("/subscriptions");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`relative max-w-sm w-full transition-all duration-300 ${
          exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Speech bubble */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-400/50">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Premium header gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />

          {/* Avatar section */}
          <div className="relative pt-8 pb-4 px-6 bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800">
            <div className="flex justify-center">
              <div className="relative">
                {/* Avatar image */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg bg-amber-100 dark:bg-amber-800">
                  {avatar?.avatar_image_url ? (
                    <Image
                      src={avatar.avatar_image_url}
                      alt={speciesName || "Your species companion"}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      🐾
                    </div>
                  )}
                </div>
                {/* Premium sparkle indicator */}
                <div className="absolute -top-2 -right-2 p-1.5 bg-amber-400 rounded-full animate-pulse">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                {/* Heart indicator */}
                <div className="absolute -bottom-1 -left-1 text-2xl animate-bounce" style={{ animationDelay: "0.3s" }}>
                  💚
                </div>
              </div>
            </div>

            {/* Species name */}
            {speciesName && (
              <p className="text-center mt-3 text-sm font-medium text-amber-700 dark:text-amber-300">
                {speciesName}
              </p>
            )}
          </div>

          {/* Message content */}
          <div className="px-6 py-5">
            <p className="text-center text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
              &quot;{message}&quot;
            </p>

            {/* Conservation impact badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-700 dark:text-green-400">
              <TreePine className="w-4 h-4" />
              <span className="font-medium">{copy.supportConservation}</span>
              <Heart className="w-4 h-4 text-red-500" />
            </div>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleUpgrade}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <Sparkles className="w-5 h-5" />
                {copy.upgradeToPremium}
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 px-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium rounded-xl transition-colors"
              >
                {copy.maybeLater}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
