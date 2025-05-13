"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DarkModeContext = createContext();

export function DarkModeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") setDarkMode(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );

  // useEffect(() => {
  //   const root = document.documentElement;
  //   if (darkMode) {
  //     root.classList.add("dark");
  //   } else {
  //     root.classList.remove("dark");
  //   }
  //   localStorage.setItem("darkMode", darkMode);
  // }, [darkMode]);

  // return (
  //   <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
  //     {children}
  //   </DarkModeContext.Provider>
  // );
}

export const useDarkMode = () => useContext(DarkModeContext);
