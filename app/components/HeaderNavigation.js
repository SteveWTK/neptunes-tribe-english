"use client";

import { usePathname } from "next/navigation";

const navLinks = [
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Units",
    href: "/units",
  },
];

export default function HeaderNavigation() {
  const pathname = usePathname();
  return (
    <nav className=" z-10 text-base">
      <ul className=" flex gap-12 items-center">
        {navLinks.map((link) => (
          <li key={link.name}>
            <a
              className={`py-3 px-5 font-josefin text-center text-accent-50 hover:text-accent-500 transition-colors ${
                pathname === link.href ? "text-accent-500" : ""
              } `}
              href={link.href}
            >
              {/* {link.icon} */}
              <span>{link.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
