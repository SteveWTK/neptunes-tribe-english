"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import Link from "next/link";

export default function SiteFooter() {
  const { lang, setLang } = useLanguage();

  const t = {
    en: {
      copyright: "All rights reserved.",
      contactUs: "Contact Us",
    },
    pt: {
      copyright: "Todos os direitos reservados.",
      contactUs: "Entre em contato",
    },
  };

  const copy = t[lang];

  return (
    <footer className="bg-gray-50  dark:bg-primary-900 py-5 text-center text-sm">
      © {new Date().getFullYear()} Habitat English. {copy.copyright}
    </footer>
  );
}
