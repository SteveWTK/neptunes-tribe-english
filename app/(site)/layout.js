"use client";
import { useDarkMode, useLanguage } from "@/lib/hooks";
import SiteHeader from "@/app/components/SiteHeader";

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
      {children}
    </>
  );
}
