"use client";

import Link from "next/link";
import { Button } from "./ui/button";

export function StickyFooterSupport() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-zinc-50 dark:bg-primary-950 border-t border-zinc-200 dark:border-zinc-700 shadow-lg p-4 sm:px-8">
      <div className="relative flex flex-col items-center justify-between gap-3">
        <div className="text-md font-bold sm:text-base text-center text-zinc-700 dark:text-zinc-200">
          Become a premium member and help us build Neptune&apos;s Tribe!
        </div>

        <Link href="#support">
          <Button className="px-5 py-0.5 text-sm sm:text-base z-10">
            Support Us
          </Button>
        </Link>
        <p className="absolute bottom-0 right-0 text-xs font-light">
          © {new Date().getFullYear()} Neptune&apos;s Tribe. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
