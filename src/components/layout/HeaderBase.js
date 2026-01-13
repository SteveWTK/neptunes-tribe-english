// app\components\HeaderBase.js
import { useLanguage } from "@/lib/contexts/LanguageContext";
import HeaderLogo from "./HeaderLogo";
import HeaderLogoDark from "./HeaderLogoDark";
import Link from "next/link";
import SignOutButton from "@/components/ui/signoutButton";
import { useSession } from "next-auth/react"; // Remove signOut import since we're not using it here
import { Moon, Sun, Menu, X, Leaf } from "lucide-react";
import { useState, useEffect } from "react";
import ChallengeNotification from "@/components/challenges/ChallengeNotification";

export default function HeaderBase({
  type = "landing",
  darkMode,
  setDarkMode,
}) {
  const { lang, setLang } = useLanguage();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [speciesAvatar, setSpeciesAvatar] = useState(null);

  // Fetch user's species avatar if logged in
  useEffect(() => {
    if (session?.user) {
      const fetchAvatar = async () => {
        try {
          const response = await fetch("/api/user/journey");
          const data = await response.json();
          if (data.hasSelectedAvatar && data.journey?.species_avatar) {
            setSpeciesAvatar(data.journey.species_avatar);
          }
        } catch (error) {
          console.error("Error fetching avatar:", error);
        }
      };
      fetchAvatar();
    }
  }, [session]);

  const languageOptions = {
    en: { label: "English", flag: "🇬🇧" },
    pt: { label: "Português", flag: "🇧🇷" },
    // es: { label: "Español", flag: "ES" },
    // th: { label: "ไทย", flag: "TH" },
  };

  const localizedLinks = {
    landing: {
      en: [
        { href: "/worlds", label: "Worlds" },
        { href: "/units", label: "Units" },
        { href: "/eco-news", label: "Eco News" },
        { href: "/about-us", label: "About Us" },
        { href: "/subscriptions", label: "Subscriptions" },
        // { href: "/explorers", label: "For Solo Explorers" },
        // { href: "/schools", label: "For schools" },
        // { href: "/about-us", label: "About Us" },
      ],
      pt: [
        { href: "/worlds", label: "Mundos" },
        { href: "/units", label: "Atividades" },
        { href: "/eco-news", label: "Eco News" },
        { href: "/about-us", label: "Sobre Nós" },
        { href: "/subscriptions", label: "Planos" },
        // { href: "/explorers", label: "Para Exploradores Solo" },
        // { href: "/schools", label: "Para Escolas" },
        // { href: "/about-us", label: "Sobre Nós" },
      ],
      es: [
        { href: "/worlds", label: "Mundos" },
        { href: "/units", label: "Atividades" },
        { href: "/eco-news", label: "Eco News" },
        { href: "/about-us", label: "Sobre Nosotros" },
        { href: "/subscriptions", label: "Suscripciones" },
        // { href: "/explorers", label: "Para Exploradores Solo" },
        // { href: "/schools", label: "Para Escolas" },
        // { href: "/about-us", label: "Sobre Nós" },
      ],
    },
    site: {
      en: [
        { href: "/worlds", label: "Worlds" },
        { href: "/units", label: "Units" },
        { href: "/eco-news", label: "Eco News" },
        { href: "/about-us", label: "About Us" },
        { href: "/subscriptions", label: "Subscriptions" },
      ],
      pt: [
        { href: "/worlds", label: "Mundos" },
        { href: "/units", label: "Atividades" },
        { href: "/eco-news", label: "Eco News" },
        { href: "/about-us", label: "Sobre Nós" },
        { href: "/subscriptions", label: "Planos" },
      ],
      es: [
        { href: "/worlds", label: "Mundos" },
        { href: "/units", label: "Atividades" },
        { href: "/eco-news", label: "Eco News" },
        { href: "/about-us", label: "Sobre Nosotros" },
        { href: "/subscriptions", label: "Suscripciones" },
        // { href: "/explorers", label: "Para Exploradores Solo" },
        // { href: "/schools", label: "Para Escolas" },
        // { href: "/about-us", label: "Sobre Nós" },
      ],
    },
  };

  const links = localizedLinks[type]?.[lang] || [];

  const t = {
    en: {
      ecoMap: "Dashboard",
      signIn: "Sign In",
      signOut: "Sign Out",
    },
    pt: {
      ecoMap: "Painel",
      signIn: "Entrar",
      signOut: "Sair",
    },
    es: {
      ecoMap: "Panel de control",
      signIn: "Iniciar sesión",
      signOut: "Cerrar sesión",
    },
  };

  const copy = t[lang];

  const buttonClass =
    "text-[16px] rounded-b-lg px-2 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 dark:hover:text-accent-400 dark:hover:border-accent-400";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-primary-950 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {darkMode ? <HeaderLogo /> : <HeaderLogoDark />}

            {/* Desktop Navigation*/}
            <nav className="hidden md:flex gap-3 sm:gap-6 md:gap-3 lg:gap-8 text-sm">
              {links.map(({ href, label }) => (
                <a key={href} href={href} className={buttonClass}>
                  {label}
                </a>
              ))}
            </nav>

            {/* Desktop Right side controls */}
            <div className="hidden md:flex gap-4 md:gap-3 lg:gap-4 items-center">
              {/* Challenge notification for logged-in users */}
              {session?.user && <ChallengeNotification />}

              {session?.user && (
                <Link
                  href="/dashboard"
                  data-tour="dashboard-link"
                  className="py-0.5 px-5 rounded-2xl transition-colors flex items-center text-primary-900 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 dark:text-accent-50 dark:hover:text-accent-400 dark:hover:border-accent-400 gap-2 lg:gap-4"
                >
                  {speciesAvatar?.avatar_image_url ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover border-2 border-accent-500"
                      src={speciesAvatar.avatar_image_url}
                      alt={speciesAvatar.common_name}
                    />
                  ) : session?.user?.image ? (
                    <img
                      className="h-8 rounded-full"
                      src={session.user.image}
                      alt={session.user.name}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
                      <Leaf className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    </div>
                  )}
                  <span>{copy.ecoMap}</span>
                </Link>
              )}

              {status === "authenticated" ? (
                <SignOutButton
                  onSignOutComplete={closeMobileMenu}
                  className="flex justify-end items-center"
                />
              ) : (
                <Link
                  href="/auth/signin"
                  className="py-0.5 px-5 rounded-2xl transition-colors flex items-center gap-3 text-primary-900 hover:text-accent-600 hover:border-b-1 hover:border-accent-600 dark:text-accent-50 dark:hover:text-accent-400 dark:hover:border-accent-400 w-full"
                >
                  {copy.signIn}
                </Link>
              )}

              {/* Language and dark mode */}
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
                className="text-[16px] rounded-full px-1 pt-0.5 pb-1 hover:text-accent-600 dark:text-accent-50 dark:hover:text-accent-400"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Mobile: Challenge notification + menu button */}
            <div className="md:hidden flex items-center gap-2">
              {session?.user && <ChallengeNotification />}
              <button
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FIXED: Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />

          <div className="fixed top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-40 md:hidden">
            <div className="max-w-7xl mx-auto px-4 py-6">
              {/* Navigation Links stay the same */}
              <nav className="space-y-4 mb-6">
                {links.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block py-2 text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    onClick={closeMobileMenu}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* FIXED: Mobile Auth Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                {session?.user && (
                  <Link
                    href="/dashboard"
                    className="block py-2 mb-4 transition-colors flex items-center text-primary-900 hover:text-accent-600 dark:text-accent-50 dark:hover:text-accent-400 gap-2"
                    onClick={closeMobileMenu}
                  >
                    {speciesAvatar?.avatar_image_url ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover border-2 border-accent-500"
                        src={speciesAvatar.avatar_image_url}
                        alt={speciesAvatar.common_name}
                      />
                    ) : session?.user?.image ? (
                      <img
                        className="h-8 rounded-full"
                        src={session.user.image}
                        alt={session.user.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                      </div>
                    )}
                    <span>{copy.ecoMap}</span>
                  </Link>
                )}

                {status === "authenticated" ? (
                  <SignOutButton
                    onSignOutComplete={closeMobileMenu}
                    className="w-full justify-start"
                  />
                ) : (
                  <Link
                    href="/login"
                    className="block py-2 transition-colors text-primary-900 hover:text-accent-600 dark:text-accent-50 dark:hover:text-accent-400"
                    onClick={closeMobileMenu}
                  >
                    {copy.signIn}
                  </Link>
                )}
              </div>

              {/* Controls section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                {/* Language and dark mode */}
                {languageOptions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    >
                      {Object.entries(languageOptions).map(
                        ([code, { label, flag }]) => (
                          <option key={code} value={code}>
                            {flag} {label}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                  <button
                    onClick={() => {
                      setDarkMode(!darkMode);
                      closeMobileMenu();
                    }}
                    className="flex items-center space-x-2 p-1 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {darkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                    <span className="text-sm">
                      {darkMode ? "Light" : "Dark"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
