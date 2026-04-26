"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Layout for the school enrollment flow.
 * Minimal design with branded background and SessionProvider.
 */
export default function SchoolLayout({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-primary-900">
        {children}
      </div>
    </SessionProvider>
  );
}
