import "@/app/styles/globals.css";

import { Orbitron } from "next/font/google";
import { Roboto_Slab } from "next/font/google";
import { Josefin_Sans } from "next/font/google";
import Header from "@/app/components/Header";

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
    <html
      lang="en"
      className={`${roboto.variable} ${orbitron.variable} ${josefin.variable}`}
    >
      <body className="antialiased bg-primary-950 font-roboto">
        <Header />
        {children}
      </body>
    </html>
  );
}
