"use client";

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`border border-primary-300 dark:border-primary-600 bg-white dark:bg-primary-800 text-zinc-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
    />
  );
}
