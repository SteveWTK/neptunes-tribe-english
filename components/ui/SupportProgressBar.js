"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function SupportProgressBar({ current, goal }) {
  const percentage = Math.min((current / goal) * 100, 100);
  return (
    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-xl overflow-hidden">
      <motion.div
        className="h-5 bg-green-500"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <div className="text-xs text-center mt-1 text-zinc-600 dark:text-zinc-300">
        {current} of {goal} supporters
      </div>
    </div>
  );
}
