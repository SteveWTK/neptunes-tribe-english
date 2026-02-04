"use client";
import { useDarkMode, useLanguage } from "@/lib/hooks";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import UserLevelSwitcher from "@/components/admin/UserLevelSwitcher";
import { FeedbackWidget } from "@inspire/shared";
import GuestBanner from "@/components/guest/GuestBanner";

export default function LandingLayout({ children }) {
  const { darkMode, setDarkMode } = useDarkMode();
  const { lang, setLang, languageOptions } = useLanguage();

  return (
    <>
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
