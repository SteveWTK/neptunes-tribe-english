import * as React from "react";

/**
 * Textarea component for multi-line text input
 *
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.error - Whether the textarea has an error state
 * @param {number} props.rows - Number of visible rows
 */
const Textarea = React.forwardRef(({ className, error = false, rows = 4, ...props }, ref) => {
  const baseClasses = "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
  const normalClasses = "border-input focus-visible:ring-ring";
  const errorClasses = "border-red-500 focus-visible:ring-red-500";

  return (
    <textarea
      className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className || ""}`}
      ref={ref}
      rows={rows}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
