"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/lib/contexts/LanguageContext";
import {
  Smartphone,
  X,
  ChevronDown,
  Share,
  Plus,
  MoreVertical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const translations = {
  en: {
    title: "Add to Home Screen",
    subtitle: "Get quick access to your lessons",
    description:
      "Install the app on your phone for a better experience - works offline too!",
    showMeHow: "Show me how",
    maybeLater: "Maybe later",
    dontShowAgain: "Don't show again",
    // Instructions
    iosInstructions: "Tap the Share button, then 'Add to Home Screen'",
    androidInstructions: "Tap the menu (3 dots), then 'Add to Home Screen'",
  },
  pt: {
    title: "Adicionar a Tela Inicial",
    subtitle: "Acesso rapido as suas licoes",
    description:
      "Instale o app no seu celular para uma experiencia melhor - funciona offline tambem!",
    showMeHow: "Mostrar como",
    maybeLater: "Talvez depois",
    dontShowAgain: "Nao mostrar novamente",
    iosInstructions:
      "Toque no botao Compartilhar, depois em 'Adicionar a Tela de Inicio'",
    androidInstructions:
      "Toque no menu (3 pontos), depois em 'Adicionar a tela inicial'",
  },
  th: {
    title: "เพิ่มลงหน้าจอหลัก",
    subtitle: "เข้าถึงบทเรียนได้เร็วขึ้น",
    description:
      "ติดตั้งแอปบนโทรศัพท์เพื่อประสบการณ์ที่ดีขึ้น - ใช้งานออฟไลน์ได้!",
    showMeHow: "แสดงวิธีการ",
    maybeLater: "ไว้ทีหลัง",
    dontShowAgain: "ไม่ต้องแสดงอีก",
    iosInstructions: "แตะปุ่มแชร์ แล้วเลือก 'เพิ่มลงหน้าจอหลัก'",
    androidInstructions: "แตะเมนู (จุด 3 จุด) แล้วเลือก 'เพิ่มลงหน้าจอหลัก'",
  },
};

// Storage keys
const STORAGE_KEYS = {
  dismissed: "a2hs_dismissed",
  permanentlyDismissed: "a2hs_never_show",
  lastShown: "a2hs_last_shown",
  showCount: "a2hs_show_count",
};

// Configuration
const CONFIG = {
  // Minimum lessons completed before showing
  minLessonsCompleted: 2,
  // Days between showing the CTA (if not permanently dismissed)
  daysBetweenPrompts: 3,
  // Maximum times to show before giving up
  maxShowCount: 5,
};

/**
 * AddToHomeScreenCTA - Encourages mobile users to add the app to their home screen.
 *
 * Shows for:
 * - Mobile users only
 * - Registered (non-guest) users
 * - Users who haven't installed as PWA yet
 * - Intermittently (not every session)
 */
export default function AddToHomeScreenCTA() {
  const { data: session } = useSession();
  const { lang } = useLanguage();
  const copy = translations[lang] || translations.en;

  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if should show
    const shouldShow = checkShouldShow();
    if (shouldShow) {
      // Slight delay for better UX (don't show immediately)
      const timer = setTimeout(() => {
        setIsVisible(true);
        recordShown();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [session]);

  // Detect device type
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));
    setIsAndroid(/android/.test(ua));
  }, []);

  const checkShouldShow = () => {
    if (typeof window === "undefined") return false;

    // 1. Must be mobile
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    if (!isMobile) return false;

    // 2. Must not be in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator, any).standalone === true;
    if (isStandalone) return false;

    // 3. Must be logged in and not a guest
    if (!session?.user) return false;
    const isGuest = session.user.is_guest || session.user.role === "guest";
    if (isGuest) return false;

    // 4. Check if permanently dismissed
    const permanentlyDismissed = localStorage.getItem(
      STORAGE_KEYS.permanentlyDismissed
    );
    if (permanentlyDismissed === "true") return false;

    // 5. Check show count limit
    const showCount = parseInt(
      localStorage.getItem(STORAGE_KEYS.showCount) || "0",
      10
    );
    if (showCount >= CONFIG.maxShowCount) return false;

    // 6. Check if dismissed this session
    const sessionDismissed = sessionStorage.getItem(STORAGE_KEYS.dismissed);
    if (sessionDismissed === "true") return false;

    // 7. Check time since last shown
    const lastShown = localStorage.getItem(STORAGE_KEYS.lastShown);
    if (lastShown) {
      const daysSinceShown =
        (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < CONFIG.daysBetweenPrompts) return false;
    }

    return true;
  };

  const recordShown = () => {
    localStorage.setItem(STORAGE_KEYS.lastShown, Date.now().toString());
    const currentCount = parseInt(
      localStorage.getItem(STORAGE_KEYS.showCount) || "0",
      10
    );
    localStorage.setItem(STORAGE_KEYS.showCount, (currentCount + 1).toString());
  };

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEYS.dismissed, "true");
    setIsVisible(false);
  };

  const handleNeverShow = () => {
    localStorage.setItem(STORAGE_KEYS.permanentlyDismissed, "true");
    setIsVisible(false);
  };

  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-24 left-4 right-4 md:left-auto md:right-auto md:bottom-6 md:left-6 md:max-w-sm z-40"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 px-4 py-3 text-white">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1.5 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="p-2 bg-white/20 rounded-xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">{copy.title}</h3>
                <p className="text-sm text-white/90">{copy.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {!showInstructions ? (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {copy.description}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={handleShowInstructions}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                    {copy.showMeHow}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={handleDismiss}
                      className="flex-1 py-2 px-3 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      {copy.maybeLater}
                    </button>
                    <button
                      onClick={handleNeverShow}
                      className="flex-1 py-2 px-3 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 font-medium rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      {copy.dontShowAgain}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* iOS Instructions */}
                {isIOS && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Share className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-200">
                        {copy.iosInstructions}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Share className="w-4 h-4" />
                        <span>→</span>
                        <Plus className="w-4 h-4" />
                        <span>Add to Home Screen</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Android Instructions */}
                {isAndroid && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <MoreVertical className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-200">
                        {copy.androidInstructions}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <MoreVertical className="w-4 h-4" />
                        <span>→</span>
                        <Plus className="w-4 h-4" />
                        <span>Add to Home Screen</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generic Instructions (fallback) */}
                {!isIOS && !isAndroid && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Look for the &quot;Add to Home Screen&quot; option in your
                    browser menu.
                  </p>
                )}

                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl transition-colors"
                >
                  Got it!
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
