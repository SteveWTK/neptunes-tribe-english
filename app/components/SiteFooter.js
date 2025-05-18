"use client";

export default function SiteFooter() {
  return (
    <footer className="bg-gray-50  dark:bg-primary-900 py-5 text-center text-sm">
      © {new Date().getFullYear()} Neptune&apos;s Tribe. All rights reserved.
    </footer>
  );
}
