// components\ui\button.js
"use client";

export function Button({
  children,
  onClick,
  variant = "default",
  className = "",
  ...props
}) {
  const base = "px-4 py-1 rounded-xl font-semibold transition-all";
  const variants = {
    default:
      "rounded-2xl bg-gradient-to-b from-primary-400 to-primary-700 hover:from-primary-700 hover:to-primary-950 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-white dark:text-primary-950",
    outline:
      "border border-primary-600 text-primary-600 hover:bg-primary-50 dark:text-primary-50 dark:hover:bg-primary-900",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
