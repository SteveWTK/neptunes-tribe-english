"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Dialog container component
 */
export function Dialog({ children }) {
  return <>{children}</>;
}

/**
 * Dialog trigger - wraps the element that opens the dialog
 */
export function DialogTrigger({ children, asChild = false, onClick }) {
  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
}

/**
 * Dialog content - the modal content area
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Dialog content
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClose - Close handler
 * @param {'sm' | 'md' | 'lg' | 'xl'} props.size - Dialog size
 */
export function DialogContent({
  children,
  className = "",
  onClose,
  size = "md",
}) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className={`bg-gray-50 dark:bg-primary-900 p-6 rounded-2xl shadow-xl w-[90%] ${sizes[size]} ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Dialog header - typically contains title and description
 */
export function DialogHeader({ children, className = "" }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Dialog title
 */
export function DialogTitle({ children, className = "" }) {
  return (
    <h2 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h2>
  );
}

/**
 * Dialog description
 */
export function DialogDescription({ children, className = "" }) {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
}

/**
 * Dialog footer - typically contains action buttons
 */
export function DialogFooter({ children, className = "" }) {
  return (
    <div className={`mt-6 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
