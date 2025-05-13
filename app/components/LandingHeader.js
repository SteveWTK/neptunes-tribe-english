import HeaderBase from "./HeaderBase";

export default function LandingHeader({ darkMode, setDarkMode }) {
  return (
    <HeaderBase type="landing" darkMode={darkMode} setDarkMode={setDarkMode} />
  );
}

// // components/LandingHeader.jsx
// import HeaderBase from "./HeaderBase";

// export default function LandingHeader({
//   lang,
//   setLang,
//   languageOptions,
//   darkMode,
//   setDarkMode,
// }) {
//   const links = [
//     { href: "#about", label: lang === "en" ? "About" : "Sobre" },
//     { href: "#mission", label: lang === "en" ? "Mission" : "Missão" },
//     // { href: "#vision", label: lang === "en" ? "Vision" : "Visão" },
//     { href: "#team", label: lang === "en" ? "Team" : "Equipe" },
//     { href: "#support", label: lang === "en" ? "Support Us" : "Apoie-nos" },
//   ];

//   return (
//     <HeaderBase
//       links={links}
//       lang={lang}
//       setLang={setLang}
//       languageOptions={languageOptions}
//       darkMode={darkMode}
//       setDarkMode={setDarkMode}
//     />
//   );
// }
