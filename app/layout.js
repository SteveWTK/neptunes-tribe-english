"use client";

import "@/app/styles/globals.css";

import { Orbitron } from "next/font/google";
import { Roboto_Slab } from "next/font/google";
import { Josefin_Sans } from "next/font/google";
// import { useEffect, useState } from "react";

import { StyledComponentsRegistry } from "@/lib/StyledComponentsRegistry";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { DarkModeProvider } from "@/lib/contexts/DarkModeContext";
import { SessionProvider } from "next-auth/react";

const orbitron = Orbitron({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbitron",
});

const roboto = Roboto_Slab({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-slab",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-josefin-sans",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white dark:bg-primary-950 font-roboto relative">
        <StyledComponentsRegistry>
          <SessionProvider>
            <LanguageProvider>
              <DarkModeProvider>{children}</DarkModeProvider>
            </LanguageProvider>
          </SessionProvider>
          <Toaster richColors closeButton />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
