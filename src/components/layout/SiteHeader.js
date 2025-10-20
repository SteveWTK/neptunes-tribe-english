"use client";
import HeaderBase from "./HeaderBase";

export default function SiteHeader({ darkMode, setDarkMode }) {
  return (
    <HeaderBase type="site" darkMode={darkMode} setDarkMode={setDarkMode} />
  );
}
