"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useGuestPrompts } from "@/lib/contexts/GuestPromptContext";
import { X, LogOut, UserPlus, AlertCircle } from "lucide-react";

const translations = {
  en: {
    title: "Wait! Don't lose your progress",
    message: "Your learning journey will be lost when you leave. Create a free account to save everything.",
    stats: "You've earned {points} points across {lessons} lessons",
    createAccount: "Save My Progress",
    leaveAnyway: "Leave without saving",
  },
  pt: {
    title: "Espere! Nao perca seu progresso",
    message: "Sua jornada de aprendizado sera perdida quando voce sair. Crie uma conta gratuita para salvar tudo.",
    stats: "Voce ganhou {points} pontos em {lessons} licoes",
    createAccount: "Salvar Meu Progresso",
    leaveAnyway: "Sair sem salvar",
  },
  th: {
    title: "รอก่อน! อย่าเสียความก้าวหน้า",
    message: "การเรียนรู้ของคุณจะหายไปเมื่อคุณออก สร้างบัญชีฟรีเพื่อบันทึกทุกอย่าง",
    stats: "คุณได้รับ {points} คะแนนจาก {lessons} บทเรียน",
    createAccount: "บันทึกความก้าวหน้า",
    leaveAnyway: "ออกโดยไม่บันทึก",
  },
};

/**
 * ExitIntentPrompt - Detects when user's mouse leaves the viewport (desktop only)
 * and shows a prompt to save their progress.
 */
export default function ExitIntentPrompt() {
  const router = useRouter();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;
  const { isGuest, stats, promptState, updatePromptState } = useGuestPrompts();

  const [showPrompt, setShowPrompt] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Only show if guest hasn't already dismissed and has some progress
  const canShow = isGuest && !promptState.exitIntentShown && stats.lessons > 0;

  // Detect mouse leaving viewport (exit intent)
  const handleMouseLeave = useCallback((e) => {
    // Only trigger if mouse leaves from the top of the viewport
    if (e.clientY <= 0 && canShow && !showPrompt) {
      setShowPrompt(true);
    }
  }, [canShow, showPrompt]);

  useEffect(() => {
    // Only add listener on desktop (no touch support check)
    const isMobile = typeof window !== "undefined" && (
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );

    if (isMobile || !canShow) return;

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [canShow, handleMouseLeave]);

  if (!showPrompt) return null;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      setShowPrompt(false);
      updatePromptState("exitIntentShown", true);
    }, 300);
  };

  const handleCreateAccount = () => {
    updatePromptState("exitIntentShown", true);
    router.push("/claim-account");
  };

  const statsText = copy.stats
    .replace("{points}", stats.points?.toLocaleString() || 0)
    .replace("{lessons}", stats.lessons);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-sm">
      <div
        className={`relative max-w-md w-full transition-all duration-300 ${
          exiting ? "opacity-0 -translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-t-4 border-amber-500">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="px-6 py-6">
            {/* Header with icon */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {copy.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {statsText}
                </p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {copy.message}
            </p>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCreateAccount}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
              >
                <UserPlus className="w-5 h-5" />
                {copy.createAccount}
              </button>
              <button
                onClick={handleDismiss}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <LogOut className="w-4 h-4" />
                {copy.leaveAnyway}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
