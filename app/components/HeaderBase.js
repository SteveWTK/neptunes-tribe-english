import { useLanguage } from "@/lib/contexts/LanguageContext";
import HeaderLogo from "./HeaderLogo";
import HeaderLogoDark from "./HeaderLogoDark";
import Link from "next/link";
import SignOutButton from "./signoutButton";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun } from "lucide-react";

export default function HeaderBase({
  type = "landing",
  darkMode,
  setDarkMode,
}) {
  const { lang, setLang } = useLanguage();

  const { data: session, status } = useSession();

  const languageOptions = {
    en: { label: "English", flag: "🇬🇧" },
    pt: { label: "Português", flag: "🇧🇷" },
    // es: { label: "Español", flag: "ES" },
    // th: { label: "ไทย", flag: "TH" },
  };

  const localizedLinks = {
    landing: {
      en: [
        { href: "/units", label: "Units" },
        { href: "/challenges", label: "Challenges" },
        { href: "#team", label: "Team" },
        { href: "/pricing", label: "Pricing" },
      ],
      pt: [
        { href: "/units", label: "Atividades" },
        { href: "/challenges", label: "Desafios" },
        { href: "#team", label: "Equipe" },
        { href: "pricing", label: "Apoie" },
      ],
      // ... add other languages as needed
    },
    site: {
      en: [
        { href: "/", label: "Home" },
        { href: "/units", label: "Units" },
        { href: "/challenges", label: "Challenges" },
        { href: "/pricing", label: "Pricing" },

        // { href: "/dashboard", label: "Dashboard" },
        // { href: "/profile", label: "Profile" },
      ],
      pt: [
        { href: "/", label: "Home" },
        { href: "/units", label: "Atividades" },
        { href: "/challenges", label: "Desafios" },
        { href: "/pricing", label: "Apoie" },

        // { href: "/dashboard", label: "Painel" },
        // { href: "/profile", label: "Perfil" },
      ],
      // ... add other languages as needed
    },
  };

  const links = localizedLinks[type]?.[lang] || [];

  const t = {
    en: {
      ecoMap: "Eco Map",
      signIn: "Sign In",
      signOut: "Sign Out",
    },
    pt: {
      ecoMap: "Eco Map",
      signIn: "Entrar",
      signOut: "Sair",
    },
  };

  const copy = t[lang];

  const buttonClass =
    "text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 dark:hover:text-accent-400 dark:hover:border-accent-400";

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-primary-950 shadow-md py-4 px-6 sm:px-12 lg:px-24 flex flex-col gap-3 justify-end items-center md:flex-row md:justify-between md:items-center">
      {darkMode ? <HeaderLogo /> : <HeaderLogoDark />}

      <nav className="flex gap-3 sm:gap-6 md:gap-3 lg:gap-12 text-sm">
        {links.map(({ href, label }) => (
          <a key={href} href={href} className={buttonClass}>
            {label}
          </a>
        ))}
      </nav>

      <div className="flex gap-4 md:gap-3 lg:gap-4 items-center">
        {session?.user && (
          <Link
            href="/eco-map"
            className="py-0.5 px-5 rounded-2xl  transition-colors flex items-center text-primary-900 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 dark:text-accent-50 dark:hover:text-accent-400 dark:hover:border-accent-400 gap-2 lg:gap-4"
          >
            {session?.user?.image && (
              <img
                className="h-8 rounded-full"
                src={session.user.image}
                alt={session.user.name}
                referrerPolicy="no-referrer"
              />
            )}
            <span>{copy.ecoMap}</span>
          </Link>
        )}

        {status === "authenticated" ? (
          <SignOutButton
            onClickonClick={() => signOut()}
            className="flex justify-end items-center"
          />
        ) : (
          <Link
            href="/login"
            className="py-0.5 px-5 rounded-2xl  transition-colors flex items-center gap-3 text-primary-900 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 dark:text-accent-50 dark:hover:text-accent-400 dark:hover:border-accent-400 w-full"
          >
            {copy.signIn}
          </Link>
        )}

        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className={buttonClass}
        >
          {Object.entries(languageOptions).map(([code, { label }]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-[16px] rounded-full px-1 pt-0.5 pb-1 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}
