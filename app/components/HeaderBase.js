import { useLanguage } from "@/lib/contexts/LanguageContext";
import HeaderLogo from "./HeaderLogo";
import HeaderLogoDark from "./HeaderLogoDark";
// import localizedLinks from "@/data/localizedLinks";

export default function HeaderBase({
  type = "landing",
  darkMode,
  setDarkMode,
}) {
  const { lang, setLang } = useLanguage();

  const languageOptions = {
    en: { label: "English", flag: "🇬🇧" },
    pt: { label: "Português", flag: "🇧🇷" },
    // es: { label: "Español", flag: "ES" },
    // th: { label: "ไทย", flag: "TH" },
  };

  const localizedLinks = {
    landing: {
      en: [
        { href: "/content", label: "Units" },
        { href: "#about", label: "About" },
        { href: "#team", label: "Team" },
        { href: "#support", label: "Support" },
      ],
      pt: [
        { href: "/content", label: "Unidades" },
        { href: "#about", label: "Sobre" },
        { href: "#team", label: "Equipe" },
        { href: "#support", label: "Apoie" },
      ],
      // ... add other languages as needed
    },
    site: {
      en: [
        { href: "/", label: "Home" },
        { href: "/content", label: "Units" },
        { href: "/challenges", label: "Challenges" },
        { href: "/support-us", label: "Support" },

        // { href: "/dashboard", label: "Dashboard" },
        // { href: "/profile", label: "Profile" },
      ],
      pt: [
        { href: "/", label: "Home" },
        { href: "/content", label: "Unidades" },
        { href: "/challenges", label: "Desafios" },
        { href: "/support-us", label: "Apoie" },

        // { href: "/dashboard", label: "Painel" },
        // { href: "/profile", label: "Perfil" },
      ],
      // ... add other languages as needed
    },
  };

  const links = localizedLinks[type]?.[lang] || [];

  const buttonClass =
    "text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600";

  // HeaderBase.defaultProps = {
  //   links: [],
  //   languageOptions: {},
  // };

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
          className="text-[16px] rounded-full px-2 pt-0.5 pb-1 text-white dark:text-primary-950 font-light bg-primary-700 dark:bg-blue-50 dark:border-gray-600"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}
