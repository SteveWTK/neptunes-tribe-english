"use client";

import { useEffect, useState } from "react";

export function useDarkMode(defaultValue = false) {
  const [darkMode, setDarkMode] = useState(defaultValue);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      setDarkMode(stored === "true");
    } else {
      // Optional: auto-detect system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return { darkMode, setDarkMode };
}

export function useLanguage(defaultLang = "en") {
  const [lang, setLang] = useState(defaultLang);

  const languageOptions = {
    en: { label: "English", flag: "🇬🇧" },
    pt: { label: "Português", flag: "🇧🇷" },
    es: { label: "ไทย", flag: "TH" },
    // Add more as needed
  };

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored && languageOptions[stored]) {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  return { lang, setLang, languageOptions };
}
