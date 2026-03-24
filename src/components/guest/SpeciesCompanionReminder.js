"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useGuestPrompts } from "@/lib/contexts/GuestPromptContext";
import Image from "next/image";
import { X, UserPlus } from "lucide-react";

const translations = {
  en: {
    message:
      "I don't want to forget you! Help me remember by creating an account.",
    createAccount: "Create Account",
    maybeLater: "Maybe later",
  },
  pt: {
    message: "Eu nao quero te esquecer! Me ajude a lembrar criando uma conta.",
    createAccount: "Criar Conta",
    maybeLater: "Talvez depois",
  },
  th: {
    message: "ฉันไม่อยากลืมคุณ! ช่วยให้ฉันจำได้โดยการสร้างบัญชี",
    createAccount: "สร้างบัญชี",
    maybeLater: "ไว้ทีหลัง",
  },
};

/**
 * SpeciesCompanionReminder - A speech bubble from the species avatar
 * that appears after 2nd lesson completion.
 */
export default function SpeciesCompanionReminder() {
  const router = useRouter();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;
  const { shouldShowCompanion, journey, updatePromptState } = useGuestPrompts();

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Show with a slight delay for better UX
  useEffect(() => {
    if (shouldShowCompanion) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShowCompanion]);

  if (!shouldShowCompanion || !visible) return null;

  const avatar = journey?.species_avatar;
  const speciesName =
    lang === "pt"
      ? avatar?.common_name_pt || avatar?.common_name
      : avatar?.common_name;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      updatePromptState("companionShown", true);
    }, 300);
  };

  const handleCreateAccount = () => {
    updatePromptState("companionShown", true);
    router.push("/claim-account");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div
        className={`relative max-w-sm w-full transition-all duration-300 ${
          exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Speech bubble */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Avatar section */}
          <div className="relative pt-8 pb-4 px-6 bg-gradient-to-b from-primary-50 to-white dark:from-primary-900/50 dark:to-gray-800">
            <div className="flex justify-center">
              <div className="relative">
                {/* Avatar image */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-primary-100 dark:bg-primary-800">
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
                {/* Animated heart/emotion indicator */}
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                  💚
                </div>
              </div>
            </div>

            {/* Species name */}
            {speciesName && (
              <p className="text-center mt-3 text-sm font-medium text-primary-700 dark:text-primary-300">
                {speciesName}
              </p>
            )}
          </div>

          {/* Message content */}
          <div className="px-6 py-5">
            {/* Speech bubble tail effect */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-3 w-6 h-6 bg-primary-50 dark:bg-primary-900/50 transform rotate-45 rounded-sm"
              style={{ top: "calc(50% - 12px)" }}
            />

            <p className="text-center text-gray-700 dark:text-gray-200 text-lg leading-relaxed">
              &quot;{copy.message}&quot;
            </p>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleCreateAccount}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                {copy.createAccount}
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
