"use client";
import { useDarkMode, useLanguage } from "@/lib/hooks";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import UserLevelSwitcher from "@/components/admin/UserLevelSwitcher";
import { FeedbackWidget, AffiliateTracker } from "@inspire/shared";
import GuestBanner from "@/components/guest/GuestBanner";
import GuestPrompts from "@/components/guest/GuestPrompts";

export default function LandingLayout({ children }) {
  const { darkMode, setDarkMode } = useDarkMode();
  const { lang, setLang, languageOptions } = useLanguage();

  return (
    <>
      {/* Affiliate tracking - captures ?via=CODE from URLs */}
      <AffiliateTracker attributionDays={90} />
      <SiteHeader
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lang={lang}
        setLang={setLang}
        languageOptions={languageOptions}
      />
      <GuestBanner />
      {children}
      <SiteFooter />
      {/* Guest user CTAs - floating button, modals, exit intent, time warnings */}
      <GuestPrompts />
      {/* Admin tool: only visible to platform_admin users */}
      {/* <UserLevelSwitcher /> */}
      {/* Floating feedback widget - always accessible (from @inspire/shared) */}
      <FeedbackWidget
        appName="Neptune's Tribe English"
        lang={lang}
      />
    </>
  );
}
