"use client";

/**
 * Button component with configurable variants
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {'default' | 'outline' | 'ghost' | 'destructive'} props.variant - Button style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Button size
 * @param {string} props.className - Additional CSS classes
 */
export function Button({
  children,
  onClick,
  variant = "default",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  ...props
}) {
  const base = "rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const variants = {
    default:
      "rounded-2xl bg-gradient-to-b from-primary-400 to-primary-700 hover:from-primary-700 hover:to-primary-950 dark:from-primary-50 dark:to-primary-200 dark:hover:from-primary-100 dark:hover:to-primary-300 text-white dark:text-primary-950 focus:ring-primary-500",
    outline:
      "border border-primary-600 text-primary-600 hover:bg-primary-50 dark:text-primary-50 dark:hover:bg-primary-900 focus:ring-primary-500",
    ghost:
      "text-primary-600 hover:bg-primary-100 dark:text-primary-50 dark:hover:bg-primary-800 focus:ring-primary-500",
    destructive:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
