"use client";

import React from "react";
import { useDarkMode, useLanguage } from "@/lib/hooks";
import LandingHeader from "@/app/components/LandingHeader";
import SiteFooter from "@/app/components/SiteFooter";

export default function LandingLayout({ children }) {
  const { darkMode, setDarkMode } = useDarkMode();
  const { lang, setLang, languageOptions } = useLanguage();

  return (
    <>
      <LandingHeader
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lang={lang}
        setLang={setLang}
        languageOptions={languageOptions}
      />
      {React.isValidElement(children)
        ? React.cloneElement(children, { lang, darkMode })
        : children}
      <SiteFooter />
    </>
  );
}
