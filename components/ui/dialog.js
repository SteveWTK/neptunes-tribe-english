"use client";

import { motion, AnimatePresence } from "framer-motion";

export function Dialog({ children }) {
  return <>{children}</>;
}

export function DialogTrigger({ children, asChild = false, onClick }) {
  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
}

export function DialogContent({ children, className = "", onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose} // click backdrop to close
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className={`bg-gray-50 dark:bg-primary-900 p-6 rounded-2xl shadow-xl w-[90%] max-w-sm sm:max-w-md ${className}`}
          onClick={(e) => e.stopPropagation()} // prevent closing on inner click
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
