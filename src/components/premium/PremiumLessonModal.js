"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { usePremiumUpgrade } from "@/lib/contexts/PremiumUpgradeContext";
import { NGO_DONATION_PERCENTAGE, PREMIUM_FEATURES } from "@/config/premiumConfig";
import Image from "next/image";
import { X, Sparkles, Lock, CheckCircle, Heart, TreePine } from "lucide-react";

const translations = {
  en: {
    title: "Unlock Premium Content",
    subtitle: "Continue your journey and make a real difference",
    conservationMessage: "{percentage}% of your subscription goes directly to conservation NGOs working to protect endangered species like the ones you're learning about.",
    features: "Premium includes:",
    upgradeToPremium: "Upgrade to Premium",
    continueFree: "Continue with free content",
    learnMore: "Learn more about our conservation partners",
  },
  pt: {
    title: "Desbloquear Conteudo Premium",
    subtitle: "Continue sua jornada e faca uma diferenca real",
    conservationMessage: "{percentage}% da sua assinatura vai diretamente para ONGs de conservacao que trabalham para proteger especies ameacadas como as que voce esta aprendendo.",
    features: "Premium inclui:",
    upgradeToPremium: "Atualizar para Premium",
    continueFree: "Continuar com conteudo gratuito",
    learnMore: "Saiba mais sobre nossos parceiros de conservacao",
  },
  th: {
    title: "ปลดล็อกเนื้อหา Premium",
    subtitle: "เดินทางต่อและสร้างความแตกต่างที่แท้จริง",
    conservationMessage: "{percentage}% ของการสมัครสมาชิกของคุณจะไปสู่ NGO ด้านการอนุรักษ์โดยตรงที่ทำงานเพื่อปกป้องสัตว์ใกล้สูญพันธุ์เช่นเดียวกับที่คุณกำลังเรียนรู้",
    features: "Premium รวมถึง:",
    upgradeToPremium: "อัปเกรดเป็น Premium",
    continueFree: "ดำเนินการต่อด้วยเนื้อหาฟรี",
    learnMore: "เรียนรู้เพิ่มเติมเกี่ยวกับพันธมิตรด้านการอนุรักษ์ของเรา",
  },
};

/**
 * PremiumLessonModal - A meaningful modal shown when users click on locked premium content.
 * Emphasizes the conservation impact of upgrading to Premium.
 */
export default function PremiumLessonModal() {
  const router = useRouter();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;
  const { premiumModal, hidePremiumModal, journey } = usePremiumUpgrade();

  if (!premiumModal) return null;

  const avatar = journey?.species_avatar;
  const speciesName = lang === "pt"
    ? (avatar?.common_name_pt || avatar?.common_name)
    : avatar?.common_name;

  const conservationMessage = copy.conservationMessage.replace("{percentage}", NGO_DONATION_PERCENTAGE);

  const handleUpgrade = () => {
    hidePremiumModal();
    router.push("/subscriptions");
  };

  const handleContinueFree = () => {
    hidePremiumModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={hidePremiumModal}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Premium gradient header */}
        <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-8 opacity-20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute bottom-4 right-8 opacity-20">
            <TreePine className="w-10 h-10" />
          </div>

          <div className="relative flex items-center gap-4">
            {/* Lock icon or species avatar */}
            <div className="flex-shrink-0">
              {avatar?.avatar_image_url ? (
                <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white/50 shadow-lg">
                  <Image
                    src={avatar.avatar_image_url}
                    alt={speciesName || "Species"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Lock className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{copy.title}</h2>
              <p className="text-white/90 mt-1">{copy.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content info if available */}
        {premiumModal.title && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <Lock className="w-4 h-4 inline mr-1.5" />
              <span className="font-medium">{premiumModal.title}</span>
              {premiumModal.type === "lesson" && " is a Premium lesson"}
              {premiumModal.type === "adventure" && " is a Premium adventure"}
            </p>
          </div>
        )}

        {/* Conservation message */}
        <div className="px-6 py-5">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
                <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                {conservationMessage}
              </p>
            </div>
          </div>

          {/* Features list */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {copy.features}
            </p>
            <ul className="space-y-2">
              {PREMIUM_FEATURES.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              {copy.upgradeToPremium}
            </button>
            <button
              onClick={handleContinueFree}
              className="w-full py-3 px-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              {copy.continueFree}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
