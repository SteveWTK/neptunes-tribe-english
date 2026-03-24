"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { useGuestPrompts } from "@/lib/contexts/GuestPromptContext";
import { Clock, X, UserPlus } from "lucide-react";

const translations = {
  en: {
    warning30: {
      title: "Session expires soon",
      message: "About 30 minutes left. Save your progress with a free account!",
    },
    warning10: {
      title: "Almost out of time!",
      message: "Only 10 minutes left! Create an account now to keep your progress.",
    },
    createAccount: "Save Progress",
  },
  pt: {
    warning30: {
      title: "Sessao expira em breve",
      message: "Cerca de 30 minutos restantes. Salve seu progresso com uma conta gratuita!",
    },
    warning10: {
      title: "Quase sem tempo!",
      message: "Apenas 10 minutos restantes! Crie uma conta agora para manter seu progresso.",
    },
    createAccount: "Salvar Progresso",
  },
  th: {
    warning30: {
      title: "เซสชันจะหมดอายุเร็วๆ นี้",
      message: "เหลือประมาณ 30 นาที บันทึกความก้าวหน้าด้วยบัญชีฟรี!",
    },
    warning10: {
      title: "ใกล้หมดเวลา!",
      message: "เหลือเพียง 10 นาที! สร้างบัญชีตอนนี้เพื่อเก็บความก้าวหน้า",
    },
    createAccount: "บันทึกความก้าวหน้า",
  },
};

function formatTimeRemaining(ms) {
  if (ms <= 0) return "0m";
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * TimeWarningBanner - Shows banners when guest session time is running low.
 * - 30 minutes remaining: Gentle amber warning
 * - 10 minutes remaining: Urgent red warning
 */
export default function TimeWarningBanner() {
  const router = useRouter();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;
  const {
    shouldShowTimeWarning30,
    shouldShowTimeWarning10,
    getTimeRemaining,
    updatePromptState,
  } = useGuestPrompts();

  const [timeDisplay, setTimeDisplay] = useState("");
  const [visible, setVisible] = useState(false);

  // Determine which warning to show (10min takes priority)
  const activeWarning = shouldShowTimeWarning10
    ? "10"
    : shouldShowTimeWarning30
      ? "30"
      : null;

  // Update time display
  useEffect(() => {
    if (!activeWarning) {
      setVisible(false);
      return;
    }

    const updateTime = () => {
      const remaining = getTimeRemaining();
      if (remaining !== null) {
        setTimeDisplay(formatTimeRemaining(remaining));
      }
    };

    updateTime();
    setVisible(true);

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeWarning, getTimeRemaining]);

  if (!activeWarning || !visible) return null;

  const is10MinWarning = activeWarning === "10";
  const warningCopy = is10MinWarning ? copy.warning10 : copy.warning30;

  const handleDismiss = () => {
    if (is10MinWarning) {
      updatePromptState("timeWarning10Dismissed", true);
    } else {
      updatePromptState("timeWarning30Dismissed", true);
    }
  };

  const handleCreateAccount = () => {
    router.push("/claim-account");
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
        is10MinWarning
          ? "bg-gradient-to-r from-red-600 to-red-700 animate-pulse"
          : "bg-gradient-to-r from-amber-500 to-amber-600"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon, title, and message */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex-shrink-0 p-2 rounded-full ${
                is10MinWarning ? "bg-white/20" : "bg-white/20"
              }`}
            >
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white text-sm sm:text-base">
                  {warningCopy.title}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    is10MinWarning
                      ? "bg-white text-red-700"
                      : "bg-white/30 text-white"
                  }`}
                >
                  {timeDisplay}
                </span>
              </div>
              <p className="text-white/90 text-xs sm:text-sm truncate">
                {warningCopy.message}
              </p>
            </div>
          </div>

          {/* Right: CTA and dismiss */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCreateAccount}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                is10MinWarning
                  ? "bg-white text-red-700 hover:bg-gray-100"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">{copy.createAccount}</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
