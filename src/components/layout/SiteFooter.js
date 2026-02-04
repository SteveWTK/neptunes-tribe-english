"use client";

import { useLanguage } from "@/lib/contexts/LanguageContext";
import Link from "next/link";

export default function SiteFooter() {
  const { lang, setLang } = useLanguage();

  const t = {
    en: {
      copyright: "All rights reserved.",
      contactUs: "Contact Us",
      feedback: "Give Feedback",
    },
    pt: {
      copyright: "Todos os direitos reservados.",
      contactUs: "Entre em contato",
      feedback: "Dar Feedback",
    },
    th: {
      copyright: "สงวนลิขสิทธิ์",
      contactUs: "ติดต่อเรา",
      feedback: "ให้ความคิดเห็น",
    },
  };

  const copy = t[lang];

  return (
    <footer className="flex flex-col gap-1 sm:gap-2 sm:flex-row sm:justify-center sm:items-center bg-white sm:bg-gray-50 dark:bg-primary-950 py-3 md:py-4 lg:py-5 text-center text-primary-800 dark:text-white text-sm">
      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
        <span>© {new Date().getFullYear()} Habitat English. {copy.copyright}</span>
        <span className="hidden sm:inline text-gray-400">•</span>
        <p className="font-stretch-125%">Email: info@habitatenglish.com</p>
        <span className="hidden sm:inline text-gray-400">•</span>
        <Link
          href="/feedback"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline transition-colors"
        >
          {copy.feedback}
        </Link>
      </div>
    </footer>
  );
}
