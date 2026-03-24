"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useGuestPrompts } from "@/lib/contexts/GuestPromptContext";
import { X, Trophy, Star, Sparkles, UserPlus } from "lucide-react";

const translations = {
  en: {
    title: "Great Progress!",
    subtitle: "You've completed {count} lessons",
    message: "You're doing amazing! Create a free account to save your progress forever.",
    stats: {
      lessons: "Lessons",
      points: "Points",
    },
    createAccount: "Save My Progress",
    continueLearning: "Continue Learning",
  },
  pt: {
    title: "Otimo Progresso!",
    subtitle: "Voce completou {count} licoes",
    message: "Voce esta indo muito bem! Crie uma conta gratuita para salvar seu progresso para sempre.",
    stats: {
      lessons: "Licoes",
      points: "Pontos",
    },
    createAccount: "Salvar Meu Progresso",
    continueLearning: "Continuar Aprendendo",
  },
  th: {
    title: "ความก้าวหน้าที่ยอดเยี่ยม!",
    subtitle: "คุณเรียนจบแล้ว {count} บทเรียน",
    message: "คุณทำได้ดีมาก! สร้างบัญชีฟรีเพื่อบันทึกความก้าวหน้าตลอดไป",
    stats: {
      lessons: "บทเรียน",
      points: "คะแนน",
    },
    createAccount: "บันทึกความก้าวหน้า",
    continueLearning: "เรียนต่อ",
  },
};

/**
 * MilestoneModal - Celebration modal that appears after 3rd lesson completion.
 * Shows progress stats and encourages account creation.
 */
export default function MilestoneModal() {
  const router = useRouter();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;
  const { shouldShowMilestone, stats, updatePromptState } = useGuestPrompts();

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Show with a slight delay for better UX
  useEffect(() => {
    if (shouldShowMilestone) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [shouldShowMilestone]);

  if (!shouldShowMilestone || !visible) return null;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => {
      updatePromptState("milestoneShown", true);
    }, 300);
  };

  const handleCreateAccount = () => {
    updatePromptState("milestoneShown", true);
    router.push("/claim-account");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className={`relative max-w-md w-full transition-all duration-300 ${
          exiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebration header */}
          <div className="relative px-6 pt-8 pb-6 bg-gradient-to-br from-accent-400 via-accent-500 to-primary-600 text-white overflow-hidden">
            {/* Animated sparkles */}
            <div className="absolute inset-0 overflow-hidden">
              <Sparkles className="absolute top-4 left-8 w-6 h-6 text-white/30 animate-pulse" />
              <Star className="absolute top-8 right-12 w-5 h-5 text-yellow-300/50 animate-bounce" style={{ animationDelay: "0.2s" }} />
              <Sparkles className="absolute bottom-6 left-16 w-4 h-4 text-white/20 animate-pulse" style={{ animationDelay: "0.4s" }} />
              <Star className="absolute bottom-4 right-8 w-6 h-6 text-yellow-300/40 animate-bounce" style={{ animationDelay: "0.6s" }} />
            </div>

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <h2 className="text-2xl font-bold">{copy.title}</h2>
              <p className="text-white/90 mt-1">
                {copy.subtitle.replace("{count}", stats.lessons)}
              </p>
            </div>
          </div>

          {/* Stats cards */}
          <div className="px-6 -mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {stats.lessons}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                  {copy.stats.lessons}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                  {stats.points?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
                  {copy.stats.points}
                </p>
              </div>
            </div>
          </div>

          {/* Message and actions */}
          <div className="px-6 py-6">
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              {copy.message}
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCreateAccount}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-5 h-5" />
                {copy.createAccount}
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-3 px-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                {copy.continueLearning}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
