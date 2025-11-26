"use client";
import { useDarkMode, useLanguage } from "@/lib/hooks";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";
import UserLevelSwitcher from "@/components/admin/UserLevelSwitcher";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

export default function LandingLayout({ children }) {
  const { darkMode, setDarkMode } = useDarkMode();
  const { lang, setLang, languageOptions } = useLanguage();

  return (
    <>
      <OnboardingWrapper>
        <SiteHeader
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          lang={lang}
          setLang={setLang}
          languageOptions={languageOptions}
        />
        {children}
        <SiteFooter />
        {/* Admin tool: only visible to platform_admin users */}
        <UserLevelSwitcher />
        {/* Floating feedback widget - always accessible */}
        <FeedbackWidget />
      </OnboardingWrapper>
    </>
  );
}
