"use client";

import * as React from "react";

/**
 * Input component for text input fields
 *
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Input type (text, email, password, etc.)
 * @param {boolean} props.error - Whether the input has an error state
 */
const Input = React.forwardRef(({ className = "", error = false, ...props }, ref) => {
  const baseClasses = "w-full border bg-white dark:bg-primary-800 text-zinc-900 dark:text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 transition-colors";
  const normalClasses = "border-primary-300 dark:border-primary-600 focus:ring-primary-500 focus:border-primary-500";
  const errorClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <input
      ref={ref}
      {...props}
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className}`}
    />
  );
});

Input.displayName = "Input";

export { Input };
