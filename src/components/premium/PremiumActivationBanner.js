"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import { Gift, Sparkles, X, ArrowRight } from "lucide-react";

const translations = {
  en: {
    title: "You have a premium upgrade waiting!",
    subtitle: "Activate your code to unlock all content",
    activate: "Activate Now",
    later: "Later",
  },
  pt: {
    title: "Voce tem um upgrade premium esperando!",
    subtitle: "Ative seu codigo para desbloquear todo o conteudo",
    activate: "Ativar Agora",
    later: "Depois",
  },
  th: {
    title: "คุณมีการอัปเกรดพรีเมียมรออยู่!",
    subtitle: "เปิดใช้งานรหัสของคุณเพื่อปลดล็อกเนื้อหาทั้งหมด",
    activate: "เปิดใช้งานตอนนี้",
    later: "ภายหลัง",
  },
};

/**
 * PremiumActivationBanner - Shows a persistent banner for users who came from
 * QR campaigns that include premium codes, reminding them to activate.
 *
 * Displays after account creation when pending_premium_activation is true.
 * Can be dismissed for the session but will reappear on next visit.
 */
export default function PremiumActivationBanner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;

  const [dismissed, setDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check session storage for dismissal (persists only for this browser session)
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem("premium_banner_dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Check if user has pending premium activation
  useEffect(() => {
    if (status === "loading") return;

    // Only show for authenticated non-guest users
    if (!session?.user || session.user.is_guest || session.user.role === "guest") {
      setIsLoading(false);
      return;
    }

    // If user is already premium, don't show
    if (session.user.is_premium) {
      setIsLoading(false);
      return;
    }

    // Check the pending_premium_activation flag
    checkPendingActivation();
  }, [session, status]);

  async function checkPendingActivation() {
    try {
      const res = await fetch("/api/user/premium-status");
      if (res.ok) {
        const data = await res.json();
        setShouldShow(data.pendingPremiumActivation === true);
      }
    } catch (err) {
      console.error("Error checking premium status:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("premium_banner_dismissed", "true");
  }

  function handleActivate() {
    router.push("/activate-premium");
  }

  // Don't render while loading or if shouldn't show
  if (isLoading || !shouldShow || dismissed) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-amber-950 shadow-lg overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
        {/* Mobile: stacked layout, Desktop: horizontal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          {/* Top/Left: Icon and message */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="hidden sm:flex shrink-0 w-10 h-10 bg-white/30 rounded-full items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <Gift className="sm:hidden w-5 h-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2">
                <h3 className="font-bold text-xs sm:text-base truncate">
                  {copy.title}
                </h3>
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-700 shrink-0 animate-pulse" />
              </div>
              <p className="text-xs text-amber-800 truncate hidden sm:block">
                {copy.subtitle}
              </p>
            </div>
            {/* Dismiss button on mobile - top right */}
            <button
              onClick={handleDismiss}
              className="sm:hidden p-1.5 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              aria-label={copy.later}
              title={copy.later}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom/Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleActivate}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm"
            >
              {copy.activate}
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="hidden sm:block p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={copy.later}
              title={copy.later}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
