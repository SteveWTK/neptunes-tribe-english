"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Settings } from "lucide-react";

export default function Footer() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "platform_admin";

  return (
    <footer className="bg-gray-100 dark:bg-primary-950 py-6 text-center text-sm">
      <div className="flex items-center justify-center gap-4">
        <span className="text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Habitat. All rights reserved.
        </span>

        {isAdmin && (
          <>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </>
        )}
      </div>
    </footer>
  );
}
