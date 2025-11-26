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
    <footer className="flex flex-col gap-1 sm:gap-1 sm:flex-row sm:justify-center bg-white sm:bg-gray-50  dark:bg-primary-950 py-3 md:py-4 lg:py-5 text-center text-primary-800 dark:text-white text-sm">
      © {new Date().getFullYear()} Habitat English. {copy.copyright}
      <p className="font-stretch-125%">Email: info@habitatenglish.com</p>
    </footer>
  );
}
